import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import { dbStore } from './src/db/dbStore.js';
import { createSession, getSessionUser, removeSession } from './src/server/auth.js';
import { AuthSessionUser, Role, ReviewStatus, PlanType, OrderStatus } from './src/types/index.js';
import { MAST_PLANS } from './src/data/plans.js';

interface AuthenticatedRequest extends Request {
  user?: AuthSessionUser;
  token?: string;
}

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Razorpay instance if keys are configured
function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && key_id.trim() !== '' && key_secret.trim() !== '') {
    return new Razorpay({
      key_id: key_id.trim(),
      key_secret: key_secret.trim(),
    });
  }
  return null;
}

// Session Token Middleware
app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.split(';').find((c) => c.trim().startsWith('rf_session='));
    if (match) {
      token = match.split('=')[1].trim();
    }
  }
  if (token) {
    const user = getSessionUser(token);
    if (user) {
      req.user = user;
      req.token = token;
    }
  }
  next();
});

// Guards
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: Please log in to continue' });
    return;
  }
  next();
};

const requireSuperadmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    res.status(403).json({ error: 'Forbidden: Superadmin privilege required' });
    return;
  }
  next();
};

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// Get all plans
app.get('/api/public/plans', (_req: Request, res: Response) => {
  res.json({ plans: MAST_PLANS });
});

// Get public brand details for QR feedback page
app.get('/api/public/org/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const org = dbStore.getOrgBySlug(slug);

  if (!org) {
    res.status(404).json({ error: 'Organization or Standee QR not found' });
    return;
  }

  // Record QR Scan
  dbStore.recordScan(org.id);

  const buildGoogleUrl = (targetUrl: string | null | undefined, placeId: string | null | undefined, name: string) => {
    if (targetUrl && targetUrl.trim().startsWith('http')) {
      return targetUrl.trim();
    }
    if (placeId && placeId.trim()) {
      const pid = placeId.trim();
      if (pid.startsWith('http://') || pid.startsWith('https://')) {
        return pid;
      }
      return `https://search.google.com/local/writereview?placeid=${pid}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(name + ' reviews')}`;
  };

  const googleReviewUrl = buildGoogleUrl(org.googleReviewUrl, org.googlePlaceId, org.name);

  res.json({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logoUrl: org.logoUrl || '/mast-qr-logo.svg',
    primaryColor: org.primaryColor || '#581C87',
    googlePlaceId: org.googlePlaceId,
    googleReviewUrl,
    plan: org.plan || 'BASIC',
  });
});

// Submit review from public QR page
app.post('/api/public/review', (req: Request, res: Response) => {
  const { orgSlug, rating, commentText, customerName, customerContact } = req.body;

  if (!orgSlug || typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Invalid parameters. Rating must be between 1 and 5.' });
    return;
  }

  const org = dbStore.getOrgBySlug(orgSlug);
  if (!org) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }

  try {
    const review = dbStore.createReview({
      orgId: org.id,
      rating,
      commentText: commentText ? String(commentText).trim() : '',
      customerName: customerName ? String(customerName).trim() : '',
      customerContact: customerContact ? String(customerContact).trim() : '',
    });

    const isHighRating = rating >= 4;

    const buildGoogleUrl = (targetUrl: string | null | undefined, placeId: string | null | undefined, name: string) => {
      if (targetUrl && targetUrl.trim().startsWith('http')) {
        return targetUrl.trim();
      }
      if (placeId && placeId.trim()) {
        const pid = placeId.trim();
        if (pid.startsWith('http://') || pid.startsWith('https://')) {
          return pid;
        }
        return `https://search.google.com/local/writereview?placeid=${pid}`;
      }
      return `https://www.google.com/search?q=${encodeURIComponent(name + ' reviews')}`;
    };

    const googleReviewUrl = buildGoogleUrl(org.googleReviewUrl, org.googlePlaceId, org.name);

    if (isHighRating) {
      dbStore.recordRedirect(org.id);
    }

    res.status(201).json({
      success: true,
      review,
      branch: isHighRating ? 'GOOGLE_REDIRECT' : 'PRIVATE_FEEDBACK',
      googleReviewUrl: isHighRating ? googleReviewUrl : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record feedback' });
  }
});

// Public Order Tracking by Order Number or Email
app.get('/api/public/orders/track', (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ error: 'Please provide an Order Number (e.g. MQ-1041) or Customer Email.' });
    return;
  }

  const cleanQuery = query.trim();
  let orders = [];

  if (cleanQuery.includes('@')) {
    orders = dbStore.getOrdersByEmail(cleanQuery);
  } else {
    const order = dbStore.getOrderByNumber(cleanQuery) || dbStore.getOrderById(cleanQuery);
    if (order) orders.push(order);
  }

  if (orders.length === 0) {
    res.status(404).json({ error: 'No matching order found for this query.' });
    return;
  }

  res.json({ orders });
});

// ==========================================
// RAZORPAY PAYMENT ENDPOINTS
// ==========================================

// Get public payment configuration
app.get('/api/payments/config', (_req: Request, res: Response) => {
  const keyId = process.env.RAZORPAY_KEY_ID || null;
  const isConfigured = !!(keyId && process.env.RAZORPAY_KEY_SECRET);

  res.json({
    keyId,
    isConfigured,
    currency: 'INR',
    environment: keyId?.startsWith('rzp_live') ? 'production' : 'test',
  });
});

// Create Order & Initiate Razorpay Order
app.post('/api/payments/create-order', async (req: Request, res: Response) => {
  try {
    const {
      plan,
      businessName,
      businessSlug,
      googleReviewUrl,
      googlePlaceId,
      customerName,
      customerEmail,
      customerPhone,
      tagline,
      primaryColor,
      shippingAddress,
    } = req.body;

    if (!plan || !businessName || !googleReviewUrl || !customerName || !customerEmail || !customerPhone) {
      res.status(400).json({
        error: 'Missing required order details: Plan, Business Name, Google Review Link, Customer Name, Email, and Phone are required.',
      });
      return;
    }

    const selectedPlan = MAST_PLANS.find((p) => p.id === plan);
    if (!selectedPlan) {
      res.status(400).json({ error: 'Invalid plan selected.' });
      return;
    }

    // Require shipping address for physical standee plans
    if ((plan === 'STANDARD' || plan === 'PRO') && (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode)) {
      res.status(400).json({ error: 'Physical shipping address (Street, City, Pincode) is required for Standee fulfillment.' });
      return;
    }

    // 1. Create order record in our database
    const order = dbStore.createOrder({
      customerEmail,
      customerName,
      customerPhone,
      plan: selectedPlan.id,
      planTitle: selectedPlan.name,
      amount: selectedPlan.price,
      currency: 'INR',
      businessName,
      businessSlug,
      googleReviewUrl,
      googlePlaceId,
      tagline,
      primaryColor: primaryColor || '#581C87',
      standeeMaterial: selectedPlan.standeeType,
      shippingAddress,
    });

    const razorpay = getRazorpayClient();
    const amountInPaise = selectedPlan.price * 100; // Razorpay amounts in subunits (paise)

    if (razorpay) {
      // 2. Real Razorpay Server-side order creation
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order.id,
          businessName: order.businessName,
          plan: order.plan,
        },
      });

      // Update order with Razorpay Order ID
      order.razorpayOrderId = rzpOrder.id;

      res.status(201).json({
        success: true,
        order,
        razorpayOrderId: rzpOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        isProductionReady: true,
      });
    } else {
      // Razorpay credentials not yet injected into environment
      res.status(200).json({
        success: true,
        order,
        razorpayOrderId: null,
        keyId: null,
        amount: amountInPaise,
        currency: 'INR',
        needsCredentials: true,
        message: 'Razorpay keys not configured in server environment. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Settings.',
      });
    }
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment order' });
  }
});

// Server-side Payment Verification (HMAC-SHA256)
app.post('/api/payments/verify', (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId) {
      res.status(400).json({ error: 'Order ID and Razorpay Payment ID are required' });
      return;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (secret && razorpayOrderId && razorpaySignature) {
      // Compute cryptographic HMAC-SHA256
      const generatedSignature = crypto
        .createHmac('sha256', secret.trim())
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        res.status(400).json({ error: 'Payment signature verification failed. Possible tampering.' });
        return;
      }
    }

    // Mark order paid and initiate fulfillment
    const updatedOrder = dbStore.markOrderPaid(orderId, {
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!updatedOrder) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    console.log(`[MAST QR FULFILLMENT] Order ${updatedOrder.orderNumber} successfully paid! Plan: ${updatedOrder.plan}. Email dispatched to ${updatedOrder.customerEmail}`);

    res.json({
      success: true,
      message: 'Payment verified and fulfillment initiated.',
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: err.message || 'Server error during payment verification' });
  }
});

// Razorpay Webhooks
app.post('/api/payments/webhook', (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && signature) {
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  if (event === 'payment.captured' || event === 'order.paid') {
    const rzpOrderId = payload?.payment?.entity?.order_id || payload?.order?.entity?.id;
    const rzpPaymentId = payload?.payment?.entity?.id;

    if (rzpOrderId && rzpPaymentId) {
      const order = dbStore.getOrderByRazorpayOrderId(rzpOrderId);
      if (order && order.paymentStatus !== 'COMPLETED') {
        dbStore.markOrderPaid(order.id, { razorpayPaymentId: rzpPaymentId });
      }
    }
  }

  res.json({ status: 'ok' });
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const admin = dbStore.getAdminByEmail(cleanEmail);
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
      return;
    }

    const org = admin.orgId ? dbStore.getOrgById(admin.orgId) : null;

    const sessionUser: AuthSessionUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
      orgId: admin.orgId,
      orgName: org ? org.name : null,
      orgSlug: org ? org.slug : null,
    };

    const token = createSession(sessionUser);

    res.setHeader('Set-Cookie', `rf_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
    res.json({
      success: true,
      token,
      user: sessionUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Server error during authentication' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  if (req.token) {
    removeSession(req.token);
  }
  res.setHeader('Set-Cookie', 'rf_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.json({ success: true });
});

// ==========================================
// CUSTOMER & BRAND DASHBOARD
// ==========================================

// Get Orders for current customer / brand
app.get('/api/customer/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let orders = [];

  if (user.role === 'SUPERADMIN') {
    orders = dbStore.getOrders();
  } else if (user.orgId) {
    orders = dbStore.getOrdersByOrgId(user.orgId);
    if (orders.length === 0) {
      orders = dbStore.getOrdersByEmail(user.email);
    }
  } else {
    orders = dbStore.getOrdersByEmail(user.email);
  }

  res.json({ orders });
});

// Get Analytics (Scoped by Role & OrgId)
app.get('/api/admin/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  if (user.role === 'SUPERADMIN') {
    res.json(dbStore.getSuperadminAnalytics());
  } else {
    if (!user.orgId) {
      // Find or link org
      const foundOrg = dbStore.getOrgs().find((o) => o.ownerEmail.toLowerCase() === user.email.toLowerCase());
      if (foundOrg) {
        res.json(dbStore.getBrandAnalytics(foundOrg.id));
        return;
      }
      res.json({
        totalReviews: 0,
        totalScans: 0,
        avgRating: 5.0,
        fiveStarCount: 0,
        fourStarCount: 0,
        lowRatingCount: 0,
        statusBreakdown: { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0 },
      });
      return;
    }
    res.json(dbStore.getBrandAnalytics(user.orgId));
  }
});

// List Reviews
app.get('/api/admin/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { rating, status, orgId: filterOrgId } = req.query;

  let targetOrgId: string | undefined = undefined;

  if (user.role === 'BRAND_ADMIN') {
    targetOrgId = user.orgId || undefined;
  } else if (user.role === 'SUPERADMIN' && filterOrgId) {
    targetOrgId = String(filterOrgId);
  }

  const reviews = dbStore.getReviews({
    orgId: targetOrgId,
    rating: rating ? parseInt(String(rating), 10) : undefined,
    status: status ? (String(status) as ReviewStatus) : undefined,
  });

  res.json({ reviews });
});

// Update Review Status / Internal Staff Notes
app.put('/api/admin/reviews/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, internalNotes } = req.body;

  const allReviews = dbStore.getReviews();
  const existing = allReviews.find((r) => r.id === id);

  if (!existing) {
    res.status(404).json({ error: 'Review record not found' });
    return;
  }

  if (user.role === 'BRAND_ADMIN' && existing.orgId !== user.orgId) {
    res.status(403).json({ error: 'Forbidden: You do not have permission to manage this feedback' });
    return;
  }

  const updated = dbStore.updateReview(id, {
    status,
    internalNotes,
  });

  res.json({ success: true, review: updated });
});

// Get own Org branding & Google target link
app.get('/api/admin/my-org', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let orgId = user.orgId;

  if (!orgId) {
    const found = dbStore.getOrgs().find((o) => o.ownerEmail.toLowerCase() === user.email.toLowerCase());
    if (found) orgId = found.id;
  }

  if (!orgId) {
    res.status(404).json({ error: 'No organization linked to account' });
    return;
  }

  const org = dbStore.getOrgById(orgId);
  if (!org) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }

  res.json({ org });
});

// Update own Org branding & Google target URL
app.put('/api/admin/my-org', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, logoUrl, primaryColor, googlePlaceId, googleReviewUrl, slug, phone } = req.body;

  let targetOrgId = user.role === 'BRAND_ADMIN' ? user.orgId : req.body.orgId || user.orgId;

  if (!targetOrgId) {
    const found = dbStore.getOrgs().find((o) => o.ownerEmail.toLowerCase() === user.email.toLowerCase());
    if (found) targetOrgId = found.id;
  }

  if (!targetOrgId) {
    res.status(400).json({ error: 'Organization ID is required' });
    return;
  }

  const updated = dbStore.updateOrg(targetOrgId, {
    name,
    logoUrl,
    primaryColor,
    googlePlaceId,
    googleReviewUrl,
    slug,
    phone,
  });

  if (!updated) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }

  res.json({ success: true, org: updated });
});

// ==========================================
// SUPERADMIN MANAGEMENT ENDPOINTS
// ==========================================

// List all Orders (Superadmin)
app.get('/api/admin/orders', requireAuth, requireSuperadmin, (req: Request, res: Response) => {
  res.json({ orders: dbStore.getOrders() });
});

// Update Order Fulfillment & Tracking (Superadmin)
app.put('/api/admin/orders/:id/fulfillment', requireAuth, requireSuperadmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { orderStatus, courierPartner, trackingNumber, trackingUrl, estimatedDelivery, pdfGenerated, emailSent } = req.body;

  const updated = dbStore.updateOrderStatus(id, {
    orderStatus,
    courierPartner,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    pdfGenerated,
    emailSent,
  });

  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ success: true, order: updated });
});

// List all Orgs (Superadmin)
app.get('/api/admin/orgs', requireAuth, requireSuperadmin, (_req: Request, res: Response) => {
  res.json({ orgs: dbStore.getOrgs() });
});

// Create Org (Superadmin)
app.post('/api/admin/orgs', requireAuth, requireSuperadmin, (req: Request, res: Response) => {
  const { name, slug, logoUrl, primaryColor, googlePlaceId, googleReviewUrl, ownerEmail, phone, plan } = req.body;

  if (!name || !slug || !ownerEmail) {
    res.status(400).json({ error: 'Name, Slug, and Owner Email are required fields' });
    return;
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const existing = dbStore.getOrgBySlug(cleanSlug);
  if (existing) {
    res.status(400).json({ error: `An organization with slug "${cleanSlug}" already exists.` });
    return;
  }

  const org = dbStore.createOrg({
    name,
    slug: cleanSlug,
    logoUrl: logoUrl || '/mast-qr-logo.svg',
    primaryColor: primaryColor || '#581C87',
    googlePlaceId: googlePlaceId || null,
    googleReviewUrl: googleReviewUrl || googlePlaceId || null,
    ownerEmail,
    phone,
    plan,
  });

  res.status(201).json({ success: true, org });
});

// Delete Org (Superadmin)
app.delete('/api/admin/orgs/:id', requireAuth, requireSuperadmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = dbStore.deleteOrg(id);
  if (!success) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }
  res.json({ success: true });
});

// List Admin Accounts (Superadmin)
app.get('/api/admin/admins', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allAdmins = dbStore.getAdmins();

  if (user.role === 'SUPERADMIN') {
    res.json({ admins: allAdmins });
  } else {
    const myAdmins = allAdmins.filter((a) => a.orgId === user.orgId || a.email.toLowerCase() === user.email.toLowerCase());
    res.json({ admins: myAdmins });
  }
});

// Create Admin / Team User
app.post('/api/admin/admins', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { email, password, role, name, orgId } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  let targetRole: Role = 'BRAND_ADMIN';
  let targetOrgId: string | null = null;

  if (user.role === 'SUPERADMIN') {
    targetRole = (role as Role) || 'BRAND_ADMIN';
    targetOrgId = orgId || null;
  } else {
    targetRole = 'BRAND_ADMIN';
    targetOrgId = user.orgId || null;
  }

  try {
    const admin = dbStore.createAdmin({
      email,
      password,
      role: targetRole,
      name,
      orgId: targetOrgId,
    });

    res.status(201).json({ success: true, admin });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create user account' });
  }
});

// Reset Demo Data Endpoint
app.post('/api/admin/reset-demo', requireAuth, (_req: Request, res: Response) => {
  dbStore.resetDemoData();
  res.json({ success: true, message: 'Database reset to initial MAST QR state' });
});

// Catch-all 404 handler for API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global Express Error Handler
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

// Standalone dev/container execution
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== 'production') {
    import('vite').then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      }).then((vite) => {
        app.use(vite.middlewares);
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`MAST QR Server running on http://0.0.0.0:${PORT}`);
        });
      });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`MAST QR Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

export default app;
