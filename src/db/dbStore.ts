import {
  Organization,
  AdminUser,
  Review,
  Role,
  ReviewStatus,
  BrandAnalytics,
  SuperadminAnalytics,
  Order,
  OrderStatus,
  PlanType,
  PaymentMethod,
  ShippingAddress,
} from '../types/index.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

interface StoredAdmin extends AdminUser {
  passwordHash: string;
}

const STORAGE_FILE = path.join(process.cwd(), '.mast_qr_store.json');

export class DbStore {
  private orgs: Organization[] = [];
  private admins: StoredAdmin[] = [];
  private reviews: Review[] = [];
  private orders: Order[] = [];
  private orderCounter = 1042;

  constructor() {
    this.loadFromDisk();
    if (this.orgs.length === 0 && this.admins.length === 0) {
      this.seedInitialData();
      this.saveToDisk();
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.orgs) this.orgs = data.orgs;
        if (data.admins) this.admins = data.admins;
        if (data.reviews) this.reviews = data.reviews;
        if (data.orders) this.orders = data.orders;
        if (data.orderCounter) this.orderCounter = data.orderCounter;
      }
    } catch (e) {
      console.warn('Could not load existing store from disk, initializing in-memory:', e);
    }
  }

  private saveToDisk() {
    try {
      const data = {
        orgs: this.orgs,
        admins: this.admins,
        reviews: this.reviews,
        orders: this.orders,
        orderCounter: this.orderCounter,
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      // Ignore disk write errors in ephemeral environments
    }
  }

  private seedInitialData() {
    const defaultPasswordHash = bcrypt.hashSync('mastqr2026', 10);

    const initialOrgs: Organization[] = [
      {
        id: 'org-mast-demo',
        name: 'MAST QR Flagship Demo',
        slug: 'mast-demo',
        logoUrl: '/mast-qr-logo.svg',
        primaryColor: '#581C87',
        googlePlaceId: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
        ownerEmail: 'admin@mastqr.com',
        phone: '+91 98765 43210',
        plan: 'PRO',
        totalScans: 342,
        fiveStarRedirects: 318,
        privateFeedbacks: 24,
        createdAt: new Date('2026-01-01T08:00:00Z').toISOString(),
      },
      {
        id: 'org-yellow-360',
        name: 'Yellow 360 Studio',
        slug: 'yellow-360',
        logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
        primaryColor: '#581C87',
        googlePlaceId: 'https://www.google.com/search?q=Yellow+360&oq=yellow+&gs_lcrp=EgZjaHJvbWUqCAgAEEUYJxg7MggIABBFGCcYOzIGCAEQRRg5MgoIAhAAGLEDGIAEMgYIAxBFGDwyBggEEEUYPDIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDI1NTVqMGo0qAIAsAIB&sourceid=chrome&source=chrome.ob&ie=UTF-8#lrd=0x395fc9ddb15ba5d3:0xa95c7581951a117d,3,,,,',
        googleReviewUrl: 'https://www.google.com/search?q=Yellow+360&oq=yellow+&gs_lcrp=EgZjaHJvbWUqCAgAEEUYJxg7MggIABBFGCcYOzIGCAEQRRg5MgoIAhAAGLEDGIAEMgYIAxBFGDwyBggEEEUYPDIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDI1NTVqMGo0qAIAsAIB&sourceid=chrome&source=chrome.ob&ie=UTF-8#lrd=0x395fc9ddb15ba5d3:0xa95c7581951a117d,3,,,,',
        ownerEmail: 'contact@yellow360.com',
        phone: '+91 98765 12345',
        plan: 'STANDARD',
        totalScans: 189,
        fiveStarRedirects: 172,
        privateFeedbacks: 17,
        createdAt: new Date('2026-02-10T10:00:00Z').toISOString(),
      },
    ];

    const initialAdmins: StoredAdmin[] = [
      {
        id: 'admin-super',
        email: 'superadmin@mastqr.com',
        role: 'SUPERADMIN',
        name: 'MAST QR Operations Lead',
        passwordHash: defaultPasswordHash,
        orgId: null,
        orgName: 'MAST QR Global HQ',
        createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
      },
      {
        id: 'admin-brand-1',
        email: 'admin@mastqr.com',
        role: 'BRAND_ADMIN',
        name: 'Demo Store Manager',
        passwordHash: defaultPasswordHash,
        orgId: 'org-mast-demo',
        orgName: 'MAST QR Flagship Demo',
        createdAt: new Date('2026-01-01T08:00:00Z').toISOString(),
      },
    ];

    const initialReviews: Review[] = [
      {
        id: 'rev-101',
        orgId: 'org-mast-demo',
        rating: 2,
        commentText: 'The waiting line was quite long on Saturday evening. The QR standee at table 4 was convenient to scan though.',
        customerName: 'Rahul Sharma',
        customerContact: 'rahul.s@example.com',
        status: 'NEW',
        internalNotes: 'Staff informed to expedite queue on weekends. Follow-up email sent with voucher.',
        createdAt: new Date('2026-08-18T14:32:00Z').toISOString(),
      },
      {
        id: 'rev-102',
        orgId: 'org-mast-demo',
        rating: 3,
        commentText: 'Good ambience but AC cooling was inadequate in the corner booth.',
        customerName: 'Priya Mehta',
        customerContact: '+91 98201 55432',
        status: 'RESOLVED',
        internalNotes: 'AC serviced by facility technician on Aug 20.',
        createdAt: new Date('2026-08-19T18:12:00Z').toISOString(),
      },
    ];

    const initialOrders: Order[] = [
      {
        id: 'ord-1001',
        orderNumber: 'MQ-1041',
        customerEmail: 'admin@mastqr.com',
        customerName: 'Demo Store Manager',
        customerPhone: '+91 98765 43210',
        plan: 'STANDARD',
        planTitle: 'Standard Standee + Dashboard',
        amount: 1499,
        currency: 'INR',
        businessName: 'MAST QR Flagship Demo',
        businessSlug: 'mast-demo',
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        tagline: 'Scan to Rate Us on Google',
        primaryColor: '#581C87',
        standeeMaterial: 'Premium Acrylic Standee (5x7 inch)',
        shippingAddress: {
          fullName: 'Demo Store Manager',
          phone: '+91 98765 43210',
          street: '402, Skyline Business Park, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          country: 'India',
        },
        razorpayOrderId: 'order_MAST1041',
        razorpayPaymentId: 'pay_MAST1041_SUCCESS',
        paymentStatus: 'COMPLETED',
        orderStatus: 'SHIPPED',
        courierPartner: 'Delhivery Express',
        trackingNumber: 'DEL-8892104912',
        trackingUrl: 'https://www.delhivery.com/track/package/DEL-8892104912',
        estimatedDelivery: '2026-08-25',
        pdfGenerated: true,
        emailSent: true,
        orgId: 'org-mast-demo',
        createdAt: new Date('2026-08-20T11:00:00Z').toISOString(),
        paidAt: new Date('2026-08-20T11:05:00Z').toISOString(),
        shippedAt: new Date('2026-08-21T15:30:00Z').toISOString(),
      },
    ];

    this.orgs = initialOrgs;
    this.admins = initialAdmins;
    this.reviews = initialReviews;
    this.orders = initialOrders;
  }

  // ==========================================
  // ORGANIZATIONS
  // ==========================================

  public getOrgs(): Organization[] {
    return [...this.orgs];
  }

  public getOrgById(id: string): Organization | undefined {
    return this.orgs.find((o) => o.id === id);
  }

  public getOrgBySlug(slug: string): Organization | undefined {
    const clean = slug.toLowerCase().trim();
    if (['yellow-360', 'yellow360', 'yellow-page', 'yellow-pages', 'yellowpage', 'yellowpages'].includes(clean)) {
      const yellowOrg = this.orgs.find((o) => o.slug === 'yellow-360');
      if (yellowOrg) return yellowOrg;
    }
    return this.orgs.find((o) => o.slug.toLowerCase() === clean);
  }

  public createOrg(data: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    googlePlaceId?: string | null;
    googleReviewUrl?: string | null;
    ownerEmail: string;
    phone?: string | null;
    plan?: PlanType;
    customBarcode?: string | null;
    customSku?: string | null;
  }): Organization {
    const newOrg: Organization = {
      id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      logoUrl: data.logoUrl || '/mast-qr-logo.svg',
      primaryColor: data.primaryColor || '#581C87',
      googlePlaceId: data.googlePlaceId || null,
      googleReviewUrl: data.googleReviewUrl || data.googlePlaceId || null,
      ownerEmail: data.ownerEmail.trim().toLowerCase(),
      phone: data.phone || null,
      plan: data.plan || 'BASIC',
      customBarcode: data.customBarcode || null,
      customSku: data.customSku || null,
      totalScans: 0,
      fiveStarRedirects: 0,
      privateFeedbacks: 0,
      createdAt: new Date().toISOString(),
    };

    this.orgs.push(newOrg);
    this.saveToDisk();
    return newOrg;
  }

  public updateOrg(
    id: string,
    updates: Partial<Pick<Organization, 'name' | 'logoUrl' | 'primaryColor' | 'googlePlaceId' | 'googleReviewUrl' | 'slug' | 'phone' | 'customBarcode' | 'customSku' | 'plan'>>
  ): Organization | null {
    const index = this.orgs.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const current = this.orgs[index];
    const updated: Organization = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : current.logoUrl,
      primaryColor: updates.primaryColor !== undefined ? updates.primaryColor : current.primaryColor,
      googlePlaceId: updates.googlePlaceId !== undefined ? updates.googlePlaceId : current.googlePlaceId,
      googleReviewUrl: updates.googleReviewUrl !== undefined ? updates.googleReviewUrl : current.googleReviewUrl,
      slug: updates.slug !== undefined ? updates.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : current.slug,
      phone: updates.phone !== undefined ? updates.phone : current.phone,
      plan: updates.plan !== undefined ? updates.plan : current.plan,
      customBarcode: updates.customBarcode !== undefined ? updates.customBarcode : current.customBarcode,
      customSku: updates.customSku !== undefined ? updates.customSku : current.customSku,
    };

    this.orgs[index] = updated;
    this.saveToDisk();
    return updated;
  }

  public deleteOrg(id: string): boolean {
    const initialLen = this.orgs.length;
    this.orgs = this.orgs.filter((o) => o.id !== id);
    this.reviews = this.reviews.filter((r) => r.orgId !== id);
    this.admins = this.admins.filter((a) => a.orgId !== id);
    this.saveToDisk();
    return this.orgs.length < initialLen;
  }

  public recordScan(orgId: string) {
    const org = this.orgs.find((o) => o.id === orgId);
    if (org) {
      org.totalScans = (org.totalScans || 0) + 1;
      this.saveToDisk();
    }
  }

  public recordRedirect(orgId: string) {
    const org = this.orgs.find((o) => o.id === orgId);
    if (org) {
      org.fiveStarRedirects = (org.fiveStarRedirects || 0) + 1;
      this.saveToDisk();
    }
  }

  // ==========================================
  // ORDERS & FULFILLMENT
  // ==========================================

  public createOrder(data: {
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    plan: PlanType;
    planTitle: string;
    amount: number;
    currency?: string;
    businessName: string;
    businessSlug?: string;
    googleReviewUrl: string;
    googlePlaceId?: string | null;
    tagline?: string;
    logoUrl?: string | null;
    primaryColor?: string;
    standeeMaterial?: string;
    shippingAddress?: ShippingAddress | null;
    razorpayOrderId?: string | null;
    barcode?: string | null;
    barcodeFormat?: string | null;
    paymentMethod?: PaymentMethod | null;
    manualPaymentRef?: string | null;
    manualPaymentCollector?: string | null;
    manualPaymentNotes?: string | null;
    initialStatus?: OrderStatus;
    paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  }): Order {
    this.orderCounter += 1;
    const orderNumber = `MQ-${this.orderCounter}`;

    const cleanSlug = (data.businessSlug || data.businessName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    // Create or find matching Organization for dynamic QR routing
    let org = this.getOrgBySlug(cleanSlug);
    if (!org) {
      org = this.createOrg({
        name: data.businessName,
        slug: cleanSlug,
        logoUrl: data.logoUrl || '/mast-qr-logo.svg',
        primaryColor: data.primaryColor || '#581C87',
        googlePlaceId: data.googlePlaceId || data.googleReviewUrl,
        googleReviewUrl: data.googleReviewUrl,
        ownerEmail: data.customerEmail,
        phone: data.customerPhone,
        plan: data.plan,
        customBarcode: data.barcode || null,
      });
    } else if (data.barcode && !org.customBarcode) {
      org.customBarcode = data.barcode;
    }

    const isPaid = data.paymentStatus === 'COMPLETED' || data.initialStatus === 'PAID' || data.initialStatus === 'PRINTING';

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      orderNumber,
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      plan: data.plan,
      planTitle: data.planTitle,
      amount: data.amount,
      currency: data.currency || 'INR',
      businessName: data.businessName.trim(),
      businessSlug: org.slug,
      googleReviewUrl: data.googleReviewUrl.trim(),
      googlePlaceId: data.googlePlaceId || null,
      tagline: data.tagline || 'Scan to Rate Us on Google',
      logoUrl: data.logoUrl || '/mast-qr-logo.svg',
      primaryColor: data.primaryColor || '#581C87',
      standeeMaterial: data.standeeMaterial || 'Digital High-Res Printable',
      shippingAddress: data.shippingAddress || null,
      barcode: data.barcode || `${orderNumber}-${org.slug.toUpperCase().slice(0, 8)}`,
      barcodeFormat: data.barcodeFormat || 'CODE128',
      paymentMethod: data.paymentMethod || (data.razorpayOrderId ? 'ONLINE_RAZORPAY' : 'ONLINE_LINK'),
      manualPaymentRef: data.manualPaymentRef || null,
      manualPaymentCollector: data.manualPaymentCollector || null,
      manualPaymentNotes: data.manualPaymentNotes || null,
      razorpayOrderId: data.razorpayOrderId || null,
      paymentStatus: isPaid ? 'COMPLETED' : (data.paymentStatus || 'PENDING'),
      orderStatus: data.initialStatus || (isPaid ? (data.plan === 'BASIC' ? 'DELIVERED' : 'PRINTING') : 'PENDING_PAYMENT'),
      pdfGenerated: isPaid,
      emailSent: isPaid,
      orgId: org.id,
      paidAt: isPaid ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    };

    if (isPaid) {
      this.ensureCustomerUser(newOrder.customerEmail, newOrder.customerName, newOrder.orgId, newOrder.businessName);
    }

    this.orders.unshift(newOrder);
    this.saveToDisk();
    return newOrder;
  }

  public markOrderManualPaid(
    orderId: string,
    details: {
      paymentMethod?: PaymentMethod;
      manualPaymentRef?: string;
      manualPaymentCollector?: string;
      manualPaymentNotes?: string;
      amountCollected?: number;
    }
  ): Order | null {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber.toUpperCase() === orderId.toUpperCase());
    if (!order) return null;

    order.paymentStatus = 'COMPLETED';
    order.paymentMethod = details.paymentMethod || 'MANUAL_CASH';
    order.manualPaymentRef = details.manualPaymentRef || `MANUAL-${Date.now().toString().slice(-6)}`;
    order.manualPaymentCollector = details.manualPaymentCollector || 'Superadmin';
    order.manualPaymentNotes = details.manualPaymentNotes || null;
    if (details.amountCollected !== undefined) {
      order.amount = details.amountCollected;
    }
    order.paidAt = new Date().toISOString();

    if (order.plan === 'BASIC') {
      order.orderStatus = 'DELIVERED';
      order.pdfGenerated = true;
      order.emailSent = true;
    } else {
      order.orderStatus = 'PRINTING';
      order.pdfGenerated = true;
      order.emailSent = true;
    }

    this.ensureCustomerUser(order.customerEmail, order.customerName, order.orgId, order.businessName);
    this.saveToDisk();
    return order;
  }

  public createProfileWithAccount(data: {
    businessName: string;
    slug?: string;
    ownerEmail: string;
    ownerPassword?: string;
    ownerName?: string;
    phone?: string;
    plan: PlanType;
    googleReviewUrl: string;
    googlePlaceId?: string;
    primaryColor?: string;
    logoUrl?: string;
    customBarcode?: string;
    customSku?: string;
    createOrder?: boolean;
    paymentOption?: 'ONLINE' | 'MANUAL' | 'NONE';
    manualPaymentMethod?: PaymentMethod;
    manualPaymentRef?: string;
    manualPaymentCollector?: string;
    manualPaymentNotes?: string;
    shippingAddress?: ShippingAddress | null;
  }): {
    org: Organization;
    adminUser: AdminUser;
    order: Order | null;
    loginCredentials: { email: string; temporaryPassword: string };
  } {
    const cleanEmail = data.ownerEmail.trim().toLowerCase();
    const cleanSlug = (data.slug || data.businessName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    // 1. Create or update Organization
    let org = this.getOrgBySlug(cleanSlug);
    if (org) {
      org = this.updateOrg(org.id, {
        name: data.businessName,
        phone: data.phone || org.phone,
        googleReviewUrl: data.googleReviewUrl || org.googleReviewUrl,
        googlePlaceId: data.googlePlaceId || org.googlePlaceId,
        primaryColor: data.primaryColor || org.primaryColor,
        logoUrl: data.logoUrl || org.logoUrl,
        plan: data.plan || org.plan,
        customBarcode: data.customBarcode || org.customBarcode,
        customSku: data.customSku || org.customSku,
      })!;
    } else {
      org = this.createOrg({
        name: data.businessName,
        slug: cleanSlug,
        ownerEmail: cleanEmail,
        phone: data.phone || null,
        plan: data.plan || 'STANDARD',
        googleReviewUrl: data.googleReviewUrl,
        googlePlaceId: data.googlePlaceId || null,
        primaryColor: data.primaryColor || '#581C87',
        logoUrl: data.logoUrl || '/mast-qr-logo.svg',
        customBarcode: data.customBarcode || null,
        customSku: data.customSku || null,
      });
    }

    // 2. Create or find Admin User account
    const tempPassword = data.ownerPassword && data.ownerPassword.trim() !== '' ? data.ownerPassword.trim() : 'welcome@mastqr';
    let admin = this.getAdminByEmail(cleanEmail);
    if (!admin) {
      admin = this.createAdmin({
        email: cleanEmail,
        password: tempPassword,
        role: 'BRAND_ADMIN',
        name: data.ownerName || data.businessName,
        orgId: org.id,
      }) as any;
    } else {
      // update orgId if not set
      if (!admin.orgId) admin.orgId = org.id;
    }

    // 3. Create initial order if requested
    let order: Order | null = null;
    if (data.createOrder !== false) {
      const planPrices: Record<PlanType, { price: number; title: string }> = {
        BASIC: { price: 499, title: 'Basic Digital QR Kit' },
        STANDARD: { price: 1499, title: 'Standard Acrylic Standee + Dashboard' },
        PRO: { price: 2999, title: 'Pro NFC Tap + Acrylic Standee + Window Decals' },
      };
      const planInfo = planPrices[data.plan || 'STANDARD'];

      const isManualPaid = data.paymentOption === 'MANUAL';

      order = this.createOrder({
        customerEmail: cleanEmail,
        customerName: data.ownerName || data.businessName,
        customerPhone: data.phone || '+91 9081232224',
        plan: data.plan || 'STANDARD',
        planTitle: planInfo.title,
        amount: planInfo.price,
        businessName: data.businessName,
        businessSlug: org.slug,
        googleReviewUrl: data.googleReviewUrl,
        googlePlaceId: data.googlePlaceId,
        primaryColor: data.primaryColor || '#581C87',
        logoUrl: data.logoUrl || '/mast-qr-logo.svg',
        barcode: data.customBarcode || `MQ-BC-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingAddress: data.shippingAddress || null,
        paymentStatus: isManualPaid ? 'COMPLETED' : 'PENDING',
        paymentMethod: isManualPaid ? (data.manualPaymentMethod || 'MANUAL_CASH') : 'ONLINE_LINK',
        manualPaymentRef: isManualPaid ? (data.manualPaymentRef || `MANUAL-${Date.now().toString().slice(-6)}`) : null,
        manualPaymentCollector: isManualPaid ? (data.manualPaymentCollector || 'Superadmin') : null,
        manualPaymentNotes: isManualPaid ? (data.manualPaymentNotes || 'Created and collected via backend') : null,
        initialStatus: isManualPaid ? (data.plan === 'BASIC' ? 'DELIVERED' : 'PRINTING') : 'PENDING_PAYMENT',
      });
    }

    this.saveToDisk();

    return {
      org,
      adminUser: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
        orgId: admin.orgId,
        createdAt: admin.createdAt,
      },
      order,
      loginCredentials: {
        email: cleanEmail,
        temporaryPassword: tempPassword,
      },
    };
  }

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public getOrderByNumber(orderNumber: string): Order | undefined {
    return this.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase());
  }

  public getOrderByRazorpayOrderId(orderId: string): Order | undefined {
    return this.orders.find((o) => o.razorpayOrderId === orderId);
  }

  public getOrdersByEmail(email: string): Order[] {
    const clean = email.trim().toLowerCase();
    return this.orders.filter((o) => o.customerEmail.toLowerCase() === clean);
  }

  public getOrdersByOrgId(orgId: string): Order[] {
    return this.orders.filter((o) => o.orgId === orgId);
  }

  public markOrderPaid(
    orderId: string,
    details: {
      razorpayPaymentId: string;
      razorpaySignature?: string;
    }
  ): Order | null {
    const order = this.orders.find((o) => o.id === orderId || o.razorpayOrderId === orderId);
    if (!order) return null;

    order.paymentStatus = 'COMPLETED';
    order.razorpayPaymentId = details.razorpayPaymentId;
    if (details.razorpaySignature) {
      order.razorpaySignature = details.razorpaySignature;
    }
    order.paidAt = new Date().toISOString();

    if (order.plan === 'BASIC') {
      order.orderStatus = 'DELIVERED';
      order.pdfGenerated = true;
      order.emailSent = true;
    } else {
      order.orderStatus = 'PRINTING';
      order.pdfGenerated = true;
      order.emailSent = true;
    }

    // Also ensure a customer account exists so they can log in to their dashboard
    this.ensureCustomerUser(order.customerEmail, order.customerName, order.orgId, order.businessName);

    this.saveToDisk();
    return order;
  }

  public updateOrderStatus(
    orderId: string,
    updates: {
      orderStatus?: OrderStatus;
      courierPartner?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
      pdfGenerated?: boolean;
      emailSent?: boolean;
    }
  ): Order | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    if (updates.orderStatus) {
      order.orderStatus = updates.orderStatus;
      if (updates.orderStatus === 'SHIPPED' && !order.shippedAt) {
        order.shippedAt = new Date().toISOString();
      }
      if (updates.orderStatus === 'DELIVERED' && !order.deliveredAt) {
        order.deliveredAt = new Date().toISOString();
      }
    }
    if (updates.courierPartner !== undefined) order.courierPartner = updates.courierPartner;
    if (updates.trackingNumber !== undefined) order.trackingNumber = updates.trackingNumber;
    if (updates.trackingUrl !== undefined) order.trackingUrl = updates.trackingUrl;
    if (updates.estimatedDelivery !== undefined) order.estimatedDelivery = updates.estimatedDelivery;
    if (updates.pdfGenerated !== undefined) order.pdfGenerated = updates.pdfGenerated;
    if (updates.emailSent !== undefined) order.emailSent = updates.emailSent;

    this.saveToDisk();
    return order;
  }

  // ==========================================
  // REVIEWS & PRIVATE FEEDBACK
  // ==========================================

  public createReview(data: {
    orgId: string;
    rating: number;
    commentText?: string;
    customerName?: string;
    customerContact?: string;
  }): Review {
    const org = this.getOrgById(data.orgId);
    if (org) {
      if (data.rating < 4) {
        org.privateFeedbacks = (org.privateFeedbacks || 0) + 1;
      }
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      orgId: data.orgId,
      rating: data.rating,
      commentText: data.commentText || null,
      customerName: data.customerName || null,
      customerContact: data.customerContact || null,
      status: 'NEW',
      internalNotes: null,
      createdAt: new Date().toISOString(),
      orgName: org ? org.name : undefined,
      orgSlug: org ? org.slug : undefined,
    };

    this.reviews.unshift(newReview);
    this.saveToDisk();
    return newReview;
  }

  public getReviews(filter?: { orgId?: string; rating?: number; status?: ReviewStatus }): Review[] {
    let result = [...this.reviews];

    if (filter?.orgId && filter.orgId !== 'all') {
      result = result.filter((r) => r.orgId === filter.orgId);
    }
    if (filter?.rating) {
      result = result.filter((r) => r.rating === filter.rating);
    }
    if (filter?.status) {
      result = result.filter((r) => r.status === filter.status);
    }

    return result.map((r) => {
      const org = this.getOrgById(r.orgId);
      return {
        ...r,
        orgName: org ? org.name : 'Unknown Organization',
        orgSlug: org ? org.slug : '',
      };
    });
  }

  public updateReview(id: string, updates: { status?: ReviewStatus; internalNotes?: string }): Review | null {
    const review = this.reviews.find((r) => r.id === id);
    if (!review) return null;

    if (updates.status !== undefined) review.status = updates.status;
    if (updates.internalNotes !== undefined) review.internalNotes = updates.internalNotes;

    this.saveToDisk();
    return review;
  }

  // ==========================================
  // USERS & AUTHENTICATION
  // ==========================================

  public getAdminByEmail(email: string): StoredAdmin | undefined {
    const clean = email.trim().toLowerCase();
    return this.admins.find((a) => a.email.toLowerCase() === clean);
  }

  public getAdmins(): AdminUser[] {
    return this.admins.map((a) => ({
      id: a.id,
      email: a.email,
      role: a.role,
      name: a.name,
      orgId: a.orgId,
      orgName: a.orgId ? this.getOrgById(a.orgId)?.name : null,
      createdAt: a.createdAt,
    }));
  }

  public createAdmin(data: {
    email: string;
    password: string;
    role: Role;
    name?: string;
    orgId?: string | null;
  }): AdminUser {
    const cleanEmail = data.email.trim().toLowerCase();
    if (this.getAdminByEmail(cleanEmail)) {
      throw new Error(`User with email "${cleanEmail}" already exists`);
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);

    const newAdmin: StoredAdmin = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      email: cleanEmail,
      role: data.role,
      name: data.name || (data.role === 'SUPERADMIN' ? 'Admin' : 'Brand Owner'),
      passwordHash,
      orgId: data.orgId || null,
      createdAt: new Date().toISOString(),
    };

    this.admins.push(newAdmin);
    this.saveToDisk();

    return {
      id: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role,
      name: newAdmin.name,
      orgId: newAdmin.orgId,
      createdAt: newAdmin.createdAt,
    };
  }

  public ensureCustomerUser(email: string, name: string, orgId: string, orgName: string): AdminUser {
    const existing = this.getAdminByEmail(email);
    if (existing) {
      if (!existing.orgId) existing.orgId = orgId;
      return existing;
    }

    // Create standard password for customer login if none exists
    const defaultCustomerPass = 'welcome@mastqr';
    return this.createAdmin({
      email,
      password: defaultCustomerPass,
      role: 'BRAND_ADMIN',
      name,
      orgId,
    });
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  public getBrandAnalytics(orgId: string): BrandAnalytics {
    const org = this.getOrgById(orgId);
    const orgReviews = this.reviews.filter((r) => r.orgId === orgId);

    const totalReviews = orgReviews.length;
    const avgRating =
      totalReviews > 0
        ? Number((orgReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

    const fiveStarCount = orgReviews.filter((r) => r.rating === 5).length;
    const fourStarCount = orgReviews.filter((r) => r.rating === 4).length;
    const lowRatingCount = orgReviews.filter((r) => r.rating < 4).length;

    const statusBreakdown = {
      NEW: orgReviews.filter((r) => r.status === 'NEW').length,
      IN_PROGRESS: orgReviews.filter((r) => r.status === 'IN_PROGRESS').length,
      RESOLVED: orgReviews.filter((r) => r.status === 'RESOLVED').length,
    };

    return {
      totalReviews,
      totalScans: org?.totalScans || 0,
      avgRating,
      fiveStarCount,
      fourStarCount,
      lowRatingCount,
      statusBreakdown,
    };
  }

  public getSuperadminAnalytics(): SuperadminAnalytics {
    const totalOrganizations = this.orgs.length;
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders
      .filter((o) => o.paymentStatus === 'COMPLETED')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalReviews = this.reviews.length;
    const globalAvgRating =
      totalReviews > 0
        ? Number((this.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

    const totalLowRatings = this.reviews.filter((r) => r.rating < 4).length;
    const pendingShipments = this.orders.filter((o) => o.orderStatus === 'PRINTING' || o.orderStatus === 'QUALITY_CHECK').length;

    const orgSummaries = this.orgs.map((org) => {
      const oReviews = this.reviews.filter((r) => r.orgId === org.id);
      const revCount = oReviews.length;
      const avg =
        revCount > 0
          ? Number((oReviews.reduce((acc, curr) => acc + curr.rating, 0) / revCount).toFixed(1))
          : 5.0;
      const lowCount = oReviews.filter((r) => r.rating < 4).length;

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        reviewCount: revCount,
        avgRating: avg,
        lowRatingCount: lowCount,
        totalScans: org.totalScans || 0,
      };
    });

    return {
      totalOrganizations,
      totalOrders,
      totalRevenue,
      totalReviews,
      globalAvgRating,
      totalLowRatings,
      pendingShipments,
      orgSummaries,
    };
  }

  public resetDemoData() {
    this.seedInitialData();
    this.saveToDisk();
  }
}

export const dbStore = new DbStore();
