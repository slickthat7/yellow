export type Role = 'SUPERADMIN' | 'BRAND_ADMIN';

export type ReviewStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  googlePlaceId?: string | null;
  ownerEmail: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  orgId?: string | null;
  createdAt: string;
  orgName?: string | null;
}

export interface Review {
  id: string;
  orgId: string;
  rating: number;
  commentText?: string | null;
  customerName?: string | null;
  customerContact?: string | null;
  status: ReviewStatus;
  internalNotes?: string | null;
  createdAt: string;
  orgName?: string;
  orgSlug?: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  role: Role;
  orgId?: string | null;
  orgName?: string | null;
  orgSlug?: string | null;
}

export interface BrandAnalytics {
  totalReviews: number;
  avgRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  lowRatingCount: number; // < 4 stars
  statusBreakdown: {
    NEW: number;
    IN_PROGRESS: number;
    RESOLVED: number;
  };
}

export interface SuperadminAnalytics {
  totalOrganizations: number;
  totalReviews: number;
  globalAvgRating: number;
  totalLowRatings: number;
  orgSummaries: Array<{
    id: string;
    name: string;
    slug: string;
    reviewCount: number;
    avgRating: number;
    lowRatingCount: number;
  }>;
}
