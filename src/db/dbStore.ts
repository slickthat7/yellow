import { Organization, AdminUser, Review, Role, ReviewStatus, BrandAnalytics, SuperadminAnalytics } from '../types/index.js';
import bcrypt from 'bcryptjs';

// Default hashed password for demo accounts ("password123")
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const INITIAL_ORGS: Organization[] = [
  {
    id: 'org-yellow-360',
    name: 'Yellow 360',
    slug: 'yellow-360',
    logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
    primaryColor: '#5B00FF', // Signature Purple
    googlePlaceId: 'https://www.google.com/search?q=Yellow+360&oq=yellow+&gs_lcrp=EgZjaHJvbWUqCAgAEEUYJxg7MggIABBFGCcYOzIGCAEQRRg5MgoIAhAAGLEDGIAEMgYIAxBFGDwyBggEEEUYPDIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDI1NTVqMGo0qAIAsAIB&sourceid=chrome&source=chrome.ob&ie=UTF-8#lrd=0x395fc9ddb15ba5d3:0xa95c7581951a117d,3,,,,',
    ownerEmail: 'admin@yellow360.com',
    createdAt: new Date('2026-01-01T08:00:00Z').toISOString(),
  },
  {
    id: 'org-apex-1',
    name: 'Apex Dental Studio',
    slug: 'apex-dental',
    logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&auto=format&fit=crop&q=80',
    primaryColor: '#2563eb', // Royal Blue
    googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    ownerEmail: 'dr.smith@apexdental.com',
    createdAt: new Date('2026-01-10T08:00:00Z').toISOString(),
  },
  {
    id: 'org-bistro-2',
    name: 'Gourmet Bistro & Grill',
    slug: 'gourmet-bistro',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    primaryColor: '#dc2626', // Vibrant Red
    googlePlaceId: 'ChIJP3Sa8ziYEmsRUKgyG83frY4',
    ownerEmail: 'chef@gourmetbistro.com',
    createdAt: new Date('2026-01-15T09:30:00Z').toISOString(),
  },
  {
    id: 'org-urban-3',
    name: 'Urban Auto Care',
    slug: 'urban-auto',
    logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=200&auto=format&fit=crop&q=80',
    primaryColor: '#059669', // Emerald Green
    googlePlaceId: 'ChIJ3S109Gq3EmsR82gyG83frY4',
    ownerEmail: 'service@urbanauto.com',
    createdAt: new Date('2026-02-01T10:00:00Z').toISOString(),
  },
];

const INITIAL_ADMINS: Array<AdminUser & { passwordHash: string }> = [
  {
    id: 'admin-super-1',
    email: 'superadmin@reviewflow.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'SUPERADMIN',
    orgId: null,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'admin-super-2',
    email: 'superadmin@reviewflow.io',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'SUPERADMIN',
    orgId: null,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'admin-apex-2',
    email: 'admin@apexdental.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'BRAND_ADMIN',
    orgId: 'org-apex-1',
    createdAt: new Date('2026-01-10T08:30:00Z').toISOString(),
  },
  {
    id: 'admin-bistro-3',
    email: 'admin@gourmetbistro.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'BRAND_ADMIN',
    orgId: 'org-bistro-2',
    createdAt: new Date('2026-01-15T10:00:00Z').toISOString(),
  },
  {
    id: 'admin-urban-4',
    email: 'admin@urbanauto.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'BRAND_ADMIN',
    orgId: 'org-urban-3',
    createdAt: new Date('2026-02-01T11:00:00Z').toISOString(),
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    orgId: 'org-apex-1',
    rating: 5,
    commentText: 'Dr. Smith and his hygiene team were so gentle, polite, and thorough. I used to fear dentist visits, but this place completely changed my mind!',
    customerName: 'Elena Rostova',
    customerContact: 'elena.r@example.com',
    status: 'RESOLVED',
    createdAt: new Date('2026-07-20T14:22:00Z').toISOString(),
  },
  {
    id: 'rev-2',
    orgId: 'org-apex-1',
    rating: 5,
    commentText: 'Fast check-in, pristine modern clinic, and painless whitening. Highly recommended!',
    customerName: 'Marcus Vance',
    customerContact: '+1 (555) 234-5678',
    status: 'RESOLVED',
    createdAt: new Date('2026-07-21T09:15:00Z').toISOString(),
  },
  {
    id: 'rev-3',
    orgId: 'org-apex-1',
    rating: 2,
    commentText: 'I had to wait 40 minutes past my appointment time without any apology or update from front desk.',
    customerName: 'David K.',
    customerContact: 'david.k@example.com',
    status: 'NEW',
    internalNotes: 'Front desk staff notified regarding queue communication.',
    createdAt: new Date('2026-07-22T16:45:00Z').toISOString(),
  },
  {
    id: 'rev-4',
    orgId: 'org-apex-1',
    rating: 1,
    commentText: 'Double charged on my credit card for x-rays. Please issue a refund immediately.',
    customerName: 'Sarah Jenkins',
    customerContact: 'sarah.j@example.com',
    status: 'IN_PROGRESS',
    internalNotes: 'Contacted accounting department. Refund in progress.',
    createdAt: new Date('2026-07-23T11:05:00Z').toISOString(),
  },
  {
    id: 'rev-5',
    orgId: 'org-bistro-2',
    rating: 5,
    commentText: 'The truffle mushroom pasta was exquisite and the wine pairing was divine! 10/10 dining experience.',
    customerName: 'Chloe Bennett',
    customerContact: 'chloe.b@example.com',
    status: 'RESOLVED',
    createdAt: new Date('2026-07-18T20:30:00Z').toISOString(),
  },
  {
    id: 'rev-6',
    orgId: 'org-bistro-2',
    rating: 3,
    commentText: 'Food was delicious, but service was quite slow during peak dinner hours.',
    customerName: 'Liam O’Connor',
    customerContact: 'liam.o@example.com',
    status: 'NEW',
    createdAt: new Date('2026-07-22T21:10:00Z').toISOString(),
  },
  {
    id: 'rev-7',
    orgId: 'org-urban-3',
    rating: 5,
    commentText: 'Honest mechanics! Saved me $400 by fixing a loose cable instead of replacing the entire alternator.',
    customerName: 'Robert Vance',
    customerContact: 'robert.v@example.com',
    status: 'RESOLVED',
    createdAt: new Date('2026-07-19T11:00:00Z').toISOString(),
  },
  {
    id: 'rev-8',
    orgId: 'org-urban-3',
    rating: 2,
    commentText: 'Oil change took over 2 hours despite having a booked appointment slot.',
    customerName: 'Amanda Garcia',
    customerContact: 'amanda.g@example.com',
    status: 'IN_PROGRESS',
    internalNotes: 'Offered free car wash voucher for next visit.',
    createdAt: new Date('2026-07-23T15:20:00Z').toISOString(),
  },
];

class DatabaseStore {
  private orgs: Organization[] = [...INITIAL_ORGS];
  private admins: Array<AdminUser & { passwordHash: string }> = [...INITIAL_ADMINS];
  private reviews: Review[] = [...INITIAL_REVIEWS];

  public resetDemoData() {
    this.orgs = [...INITIAL_ORGS];
    this.admins = [...INITIAL_ADMINS];
    this.reviews = [...INITIAL_REVIEWS];
  }

  // --- ORGANIZATIONS ---
  public getOrgs(): Organization[] {
    return this.orgs;
  }

  public getOrgBySlug(slug: string): Organization | undefined {
    const clean = slug.toLowerCase().trim();
    if (['yellow-360', 'yellow360', 'yellow-page', 'yellow-pages', 'yellowpage', 'yellowpages'].includes(clean)) {
      const yellowOrg = this.orgs.find((o) => o.slug === 'yellow-360');
      if (yellowOrg) return yellowOrg;
    }
    return this.orgs.find((o) => o.slug.toLowerCase() === clean);
  }

  public getOrgById(id: string): Organization | undefined {
    return this.orgs.find((o) => o.id === id);
  }

  public createOrg(data: Omit<Organization, 'id' | 'createdAt'>): Organization {
    const newOrg: Organization = {
      ...data,
      id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.orgs.push(newOrg);
    return newOrg;
  }

  public updateOrg(id: string, updates: Partial<Omit<Organization, 'id' | 'createdAt'>>): Organization | undefined {
    const org = this.getOrgById(id);
    if (!org) return undefined;
    Object.assign(org, updates);
    return org;
  }

  public deleteOrg(id: string): boolean {
    const index = this.orgs.findIndex((o) => o.id === id);
    if (index === -1) return false;
    this.orgs.splice(index, 1);
    // Remove associated reviews & admin users
    this.reviews = this.reviews.filter((r) => r.orgId !== id);
    this.admins = this.admins.filter((a) => a.orgId !== id);
    return true;
  }

  // --- ADMIN USERS ---
  public getAdmins(): AdminUser[] {
    return this.admins.map(({ passwordHash, ...admin }) => {
      const org = admin.orgId ? this.getOrgById(admin.orgId) : null;
      return {
        ...admin,
        orgName: org ? org.name : null,
      };
    });
  }

  public getAdminByEmail(email: string) {
    return this.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  public createAdmin(data: { email: string; password: string; role: Role; orgId?: string | null }): AdminUser {
    const existing = this.getAdminByEmail(data.email);
    if (existing) {
      throw new Error('An admin with this email already exists.');
    }
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const newAdmin = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email: data.email,
      passwordHash,
      role: data.role,
      orgId: data.orgId || null,
      createdAt: new Date().toISOString(),
    };
    this.admins.push(newAdmin);
    const { passwordHash: _, ...result } = newAdmin;
    const org = newAdmin.orgId ? this.getOrgById(newAdmin.orgId) : null;
    return {
      ...result,
      orgName: org ? org.name : null,
    };
  }

  // --- REVIEWS ---
  public getReviews(filters?: { orgId?: string; rating?: number; status?: ReviewStatus }): Review[] {
    let list = [...this.reviews];

    if (filters?.orgId) {
      list = list.filter((r) => r.orgId === filters.orgId);
    }
    if (filters?.rating) {
      list = list.filter((r) => r.rating === filters.rating);
    }
    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status);
    }

    // Attach org metadata for easy UI display
    return list.map((r) => {
      const org = this.getOrgById(r.orgId);
      return {
        ...r,
        orgName: org?.name || 'Unknown Org',
        orgSlug: org?.slug || '',
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createReview(data: {
    orgId: string;
    rating: number;
    commentText?: string;
    customerName?: string;
    customerContact?: string;
  }): Review {
    const org = this.getOrgById(data.orgId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orgId: data.orgId,
      rating: data.rating,
      commentText: data.commentText || null,
      customerName: data.customerName || null,
      customerContact: data.customerContact || null,
      status: 'NEW',
      internalNotes: null,
      createdAt: new Date().toISOString(),
      orgName: org.name,
      orgSlug: org.slug,
    };

    this.reviews.push(newReview);
    return newReview;
  }

  public updateReview(id: string, updates: { status?: ReviewStatus; internalNotes?: string }): Review | undefined {
    const review = this.reviews.find((r) => r.id === id);
    if (!review) return undefined;

    if (updates.status) review.status = updates.status;
    if (updates.internalNotes !== undefined) review.internalNotes = updates.internalNotes;

    const org = this.getOrgById(review.orgId);
    return {
      ...review,
      orgName: org?.name || 'Unknown Org',
      orgSlug: org?.slug || '',
    };
  }

  // --- ANALYTICS ---
  public getBrandAnalytics(orgId: string): BrandAnalytics {
    const orgReviews = this.reviews.filter((r) => r.orgId === orgId);
    const totalReviews = orgReviews.length;
    const totalRatingSum = orgReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

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
      avgRating,
      fiveStarCount,
      fourStarCount,
      lowRatingCount,
      statusBreakdown,
    };
  }

  public getSuperadminAnalytics(): SuperadminAnalytics {
    const totalOrganizations = this.orgs.length;
    const totalReviews = this.reviews.length;
    const totalSum = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    const globalAvgRating = totalReviews > 0 ? Number((totalSum / totalReviews).toFixed(1)) : 0;
    const totalLowRatings = this.reviews.filter((r) => r.rating < 4).length;

    const orgSummaries = this.orgs.map((org) => {
      const orgRev = this.reviews.filter((r) => r.orgId === org.id);
      const count = orgRev.length;
      const sum = orgRev.reduce((s, r) => s + r.rating, 0);
      const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;
      const lowCount = orgRev.filter((r) => r.rating < 4).length;

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        reviewCount: count,
        avgRating: avg,
        lowRatingCount: lowCount,
      };
    });

    return {
      totalOrganizations,
      totalReviews,
      globalAvgRating,
      totalLowRatings,
      orgSummaries,
    };
  }
}

export const dbStore = new DatabaseStore();
