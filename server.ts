import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/db/dbStore.js';
import { createSession, getSessionUser, removeSession } from './src/server/auth.js';
import { AuthSessionUser, Role, ReviewStatus } from './src/types/index.js';

interface AuthenticatedRequest extends Request {
  user?: AuthSessionUser;
  token?: string;
}

export const app = express();
const PORT = 3000;

async function startServer() {
  app.use(express.json());

  // Helper middleware to extract token
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

  // Auth Guard Middlewares
  const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
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

  // Get public brand details for feedback page
  app.get('/api/public/org/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const org = dbStore.getOrgBySlug(slug);

    if (!org) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    const buildGoogleUrl = (placeId: string | null | undefined, name: string) => {
      if (!placeId || !placeId.trim()) {
        return `https://www.google.com/search?q=${encodeURIComponent(name + ' reviews')}`;
      }
      const pid = placeId.trim();
      if (pid.startsWith('http://') || pid.startsWith('https://')) {
        return pid;
      }
      return `https://search.google.com/local/writereview?placeid=${pid}`;
    };

    const targetUrl = buildGoogleUrl(org.googlePlaceId, org.name);

    // Return public branding details only
    res.json({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      primaryColor: org.primaryColor || '#5B00FF',
      googlePlaceId: org.googlePlaceId,
      googleReviewUrl: targetUrl,
    });
  });

  // Submit public feedback
  app.post('/api/public/review', (req: Request, res: Response) => {
    const { orgSlug, rating, commentText, customerName, customerContact } = req.body;

    if (!orgSlug || typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Invalid input parameters. Rating must be between 1 and 5.' });
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

      // Rating above 3 (i.e. 4 or 5 stars) triggers Google review auto-redirect
      const isHighRating = rating > 3;

      const buildGoogleUrl = (placeId: string | null | undefined, name: string) => {
        if (!placeId || !placeId.trim()) {
          return `https://www.google.com/search?q=${encodeURIComponent(name + ' reviews')}`;
        }
        const pid = placeId.trim();
        if (pid.startsWith('http://') || pid.startsWith('https://')) {
          return pid;
        }
        return `https://search.google.com/local/writereview?placeid=${pid}`;
      };

      const googleReviewUrl = buildGoogleUrl(org.googlePlaceId, org.name);

      res.status(201).json({
        success: true,
        review,
        branch: isHighRating ? 'GOOGLE_REDIRECT' : 'PRIVATE_FEEDBACK',
        googlePlaceId: isHighRating ? org.googlePlaceId : null,
        googleReviewUrl: isHighRating ? googleReviewUrl : null,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit review' });
    }
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
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isMatch = bcrypt.compareSync(password, admin.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const org = admin.orgId ? dbStore.getOrgById(admin.orgId) : null;

      const sessionUser: AuthSessionUser = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
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
  // ADMIN DASHBOARD ENDPOINTS
  // ==========================================

  // Get Analytics (Scoped by Role & OrgId)
  app.get('/api/admin/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    if (user.role === 'SUPERADMIN') {
      res.json(dbStore.getSuperadminAnalytics());
    } else {
      if (!user.orgId) {
        res.status(400).json({ error: 'Brand admin has no associated organization' });
        return;
      }
      res.json(dbStore.getBrandAnalytics(user.orgId));
    }
  });

  // List Reviews (Strict Server-Side Org Scoping!)
  app.get('/api/admin/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { rating, status, orgId: filterOrgId } = req.query;

    let targetOrgId: string | undefined = undefined;

    if (user.role === 'BRAND_ADMIN') {
      // BRAND ADMIN IS STRICTLY LOCKED TO THEIR ASSIGNED ORGID SERVER-SIDE
      targetOrgId = user.orgId || 'unassigned';
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

  // Update Review Status / Internal Notes
  app.put('/api/admin/reviews/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    const { status, internalNotes } = req.body;

    const allReviews = dbStore.getReviews();
    const existing = allReviews.find((r) => r.id === id);

    if (!existing) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // SERVER-SIDE SCOPING CHECK
    if (user.role === 'BRAND_ADMIN' && existing.orgId !== user.orgId) {
      res.status(403).json({ error: 'Forbidden: You do not have permission to manage this review' });
      return;
    }

    const updated = dbStore.updateReview(id, {
      status,
      internalNotes,
    });

    res.json({ success: true, review: updated });
  });

  // Get own Org branding (Brand Admin)
  app.get('/api/admin/my-org', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!user.orgId) {
      res.status(404).json({ error: 'No organization linked to account' });
      return;
    }

    const org = dbStore.getOrgById(user.orgId);
    if (!org) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    res.json({ org });
  });

  // Update own Org branding & Google Place ID (Brand Admin or Superadmin)
  app.put('/api/admin/my-org', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { name, logoUrl, primaryColor, googlePlaceId, slug } = req.body;

    const targetOrgId = user.role === 'BRAND_ADMIN' ? user.orgId : req.body.orgId || user.orgId;

    if (!targetOrgId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const updated = dbStore.updateOrg(targetOrgId, {
      name,
      logoUrl,
      primaryColor,
      googlePlaceId,
      slug,
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

  // List all Orgs (Superadmin)
  app.get('/api/admin/orgs', requireAuth, requireSuperadmin, (req: Request, res: Response) => {
    res.json({ orgs: dbStore.getOrgs() });
  });

  // Create Org (Superadmin)
  app.post('/api/admin/orgs', requireAuth, requireSuperadmin, (req: Request, res: Response) => {
    const { name, slug, logoUrl, primaryColor, googlePlaceId, ownerEmail } = req.body;

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
      logoUrl: logoUrl || null,
      primaryColor: primaryColor || '#2563eb',
      googlePlaceId: googlePlaceId || null,
      ownerEmail,
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

  // List Admin Accounts (Superadmin or Brand Admin)
  app.get('/api/admin/admins', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const allAdmins = dbStore.getAdmins();

    if (user.role === 'SUPERADMIN') {
      res.json({ admins: allAdmins });
    } else {
      const myAdmins = allAdmins.filter((a) => a.orgId === user.orgId);
      res.json({ admins: myAdmins });
    }
  });

  // Create Admin / Team User (Superadmin or Brand Admin)
  app.post('/api/admin/admins', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { email, password, role, orgId } = req.body;

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
        orgId: targetOrgId,
      });

      res.status(201).json({ success: true, admin });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create user account' });
    }
  });

  // Reset Demo Data Endpoint
  app.post('/api/admin/reset-demo', requireAuth, (req: Request, res: Response) => {
    dbStore.resetDemoData();
    res.json({ success: true, message: 'Database reset to initial demo state' });
  });

  // Catch-all 404 handler for API routes to prevent falling through to Vite HTML fallback
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Global Express Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  // ==========================================
  // VITE & STATIC FILES
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReviewFlow Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
