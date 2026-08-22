export type Role = 'SUPERADMIN' | 'BRAND_ADMIN' | 'CUSTOMER';

export type ReviewStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export type PlanType = 'BASIC' | 'STANDARD' | 'PRO';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PRINTING'
  | 'QUALITY_CHECK'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. MQ-8492
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  plan: PlanType;
  planTitle: string;
  amount: number; // in INR e.g. 499, 1499, 2999
  currency: string;
  businessName: string;
  businessSlug: string;
  googleReviewUrl: string;
  googlePlaceId?: string | null;
  tagline?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  standeeMaterial?: string; // 'Digital PDF' | 'Premium Acrylic Standee' | 'Dual NFC + Acrylic Standee'
  shippingAddress?: ShippingAddress | null;
  
  // Razorpay transaction fields
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentError?: string | null;

  // Fulfillment and tracking
  orderStatus: OrderStatus;
  courierPartner?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  pdfGenerated: boolean;
  emailSent: boolean;

  orgId: string;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  googlePlaceId?: string | null;
  googleReviewUrl?: string | null;
  ownerEmail: string;
  phone?: string | null;
  plan?: PlanType;
  totalScans: number;
  fiveStarRedirects: number;
  privateFeedbacks: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
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
  name?: string;
  orgId?: string | null;
  orgName?: string | null;
  orgSlug?: string | null;
}

export interface PlanDetails {
  id: PlanType;
  name: string;
  badge?: string;
  price: number; // in INR
  originalPrice: number;
  description: string;
  standeeType: string;
  fulfillmentTime: string;
  features: string[];
  recommended?: boolean;
}

export interface BrandAnalytics {
  totalReviews: number;
  totalScans: number;
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
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  globalAvgRating: number;
  totalLowRatings: number;
  pendingShipments: number;
  orgSummaries: Array<{
    id: string;
    name: string;
    slug: string;
    reviewCount: number;
    avgRating: number;
    lowRatingCount: number;
    totalScans: number;
  }>;
}
