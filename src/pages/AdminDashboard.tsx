import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  Star,
  AlertTriangle,
  QrCode,
  LogOut,
  RefreshCw,
  Plus,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  Building,
  BarChart3,
  MessageSquare,
  Palette,
  Eye,
  Check,
  UserPlus,
} from 'lucide-react';
import {
  AuthSessionUser,
  Organization,
  AdminUser,
  Review,
  ReviewStatus,
  BrandAnalytics,
  SuperadminAnalytics,
} from '../types/index.js';
import { ReviewDetailsModal } from '../components/ReviewDetailsModal.js';
import { QRCodeModal } from '../components/QRCodeModal.js';
import { Yellow360Logo } from '../components/Yellow360Logo.js';

interface AdminDashboardProps {
  user: AuthSessionUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const isSuperadmin = user.role === 'SUPERADMIN';
  const [activeTab, setActiveTab] = useState<'reviews' | 'branding' | 'orgs' | 'admins'>(
    isSuperadmin ? 'orgs' : 'reviews'
  );

  // Data States
  const [analytics, setAnalytics] = useState<BrandAnalytics | SuperadminAnalytics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [myOrg, setMyOrg] = useState<Organization | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Modals for Superadmin & Brand Admin User Creation
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);

  // Form States for Org Creation
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [newOrgOwnerEmail, setNewOrgOwnerEmail] = useState('');
  const [newOrgLogoUrl, setNewOrgLogoUrl] = useState('');
  const [newOrgPrimaryColor, setNewOrgPrimaryColor] = useState('#5B00FF');
  const [newOrgGooglePlaceId, setNewOrgGooglePlaceId] = useState('');

  // Form States for Admin / Team User Creation
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('password123');
  const [newAdminOrgId, setNewAdminOrgId] = useState('');

  // Form States for Branding Editor (Brand Admin)
  const [brandingName, setBrandingName] = useState('');
  const [brandingLogoUrl, setBrandingLogoUrl] = useState('');
  const [brandingColor, setBrandingColor] = useState('#5B00FF');
  const [brandingPlaceId, setBrandingPlaceId] = useState('');
  const [brandingSaved, setBrandingSaved] = useState(false);

  const [loading, setLoading] = useState(true);

  // Safe response parser helper
  const parseJsonResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    const txt = await res.text();
    throw new Error(`Server returned non-JSON response (${res.status}): ${txt.slice(0, 80)}`);
  };

  // Fetch Core Data on Mount
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analyticsRes = await fetch('/api/admin/analytics');
      if (analyticsRes.ok && (analyticsRes.headers.get('content-type') || '').includes('application/json')) {
        const aData = await analyticsRes.json();
        setAnalytics(aData);
      }

      // 2. Fetch Reviews
      const reviewsRes = await fetch('/api/admin/reviews');
      if (reviewsRes.ok && (reviewsRes.headers.get('content-type') || '').includes('application/json')) {
        const rData = await reviewsRes.json();
        setReviews(rData.reviews || []);
      }

      // 3. Fetch Team Members / Admins (For both Superadmin and Brand Admin)
      const adminsRes = await fetch('/api/admin/admins');
      if (adminsRes.ok && (adminsRes.headers.get('content-type') || '').includes('application/json')) {
        const admData = await adminsRes.json();
        setAdminsList(admData.admins || []);
      }

      // 4. Role Specific Fetches
      if (isSuperadmin) {
        const orgsRes = await fetch('/api/admin/orgs');
        if (orgsRes.ok && (orgsRes.headers.get('content-type') || '').includes('application/json')) {
          const oData = await orgsRes.json();
          setOrgs(oData.orgs || []);
        }
      } else {
        const myOrgRes = await fetch('/api/admin/my-org');
        if (myOrgRes.ok && (myOrgRes.headers.get('content-type') || '').includes('application/json')) {
          const mData = await myOrgRes.json();
          setMyOrg(mData.org);
          setBrandingName(mData.org.name || '');
          setBrandingLogoUrl(mData.org.logoUrl || '');
          setBrandingColor(mData.org.primaryColor || '#5B00FF');
          setBrandingPlaceId(mData.org.googlePlaceId || '');
        }
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset Demo Data Handler
  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all databases to initial demo state?')) return;
    try {
      await fetch('/api/admin/reset-demo', { method: 'POST' });
      await fetchData();
      alert('Demo data successfully reset!');
    } catch (err) {
      alert('Failed to reset demo data');
    }
  };

  // Review Update Handler
  const handleReviewUpdate = async (id: string, status: ReviewStatus, notes: string) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, internalNotes: notes }),
    });
    if (!res.ok) throw new Error('Failed to update review');
    await fetchData();
  };

  // Branding Update Handler
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/my-org', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandingName,
          logoUrl: brandingLogoUrl,
          primaryColor: brandingColor,
          googlePlaceId: brandingPlaceId,
        }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to save branding');
      setMyOrg(data.org);
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 3000);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update branding settings');
    }
  };

  // Superadmin Org Creation Handler
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgSlug || !newOrgOwnerEmail) return;

    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName,
          slug: newOrgSlug,
          ownerEmail: newOrgOwnerEmail,
          logoUrl: newOrgLogoUrl,
          primaryColor: newOrgPrimaryColor,
          googlePlaceId: newOrgGooglePlaceId,
        }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to create organization');

      setIsCreateOrgModalOpen(false);
      setNewOrgName('');
      setNewOrgSlug('');
      setNewOrgOwnerEmail('');
      setNewOrgLogoUrl('');
      setNewOrgGooglePlaceId('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error creating organization');
    }
  };

  // Superadmin Admin Creation Handler
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) return;

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          role: 'BRAND_ADMIN',
          orgId: newAdminOrgId || null,
        }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');

      setIsCreateAdminModalOpen(false);
      setNewAdminEmail('');
      setNewAdminPassword('password123');
      setNewAdminOrgId('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error creating admin account');
    }
  };

  // Filter Reviews
  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (ratingFilter === 'LOW') {
      if (r.rating >= 4) return false;
    } else if (ratingFilter !== 'ALL') {
      if (r.rating !== parseInt(ratingFilter, 10)) return false;
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = r.customerName?.toLowerCase().includes(query);
      const matchComment = r.commentText?.toLowerCase().includes(query);
      const matchContact = r.customerContact?.toLowerCase().includes(query);
      const matchOrg = r.orgName?.toLowerCase().includes(query);
      return matchName || matchComment || matchContact || matchOrg;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-800 border-b border-slate-700/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <Yellow360Logo size="sm" variant="white" />
          </Link>

          <span className="hidden sm:inline-block text-slate-600">|</span>

          {/* User Org / Role Badge */}
          <div className="hidden sm:flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                isSuperadmin
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              }`}
            >
              {isSuperadmin ? 'Superadmin' : 'Brand Admin'}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {isSuperadmin ? 'All Organizations' : user.orgName || 'Brand Dashboard'}
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleResetDemoData}
            title="Reset database to initial demo state"
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700/70 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors border border-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>

          {!isSuperadmin && user.orgSlug && (
            <a
              href={`/r/${user.orgSlug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#5B00FF] hover:bg-[#4C00C8] text-white text-xs font-black rounded-lg transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">View Public Page</span>
            </a>
          )}

          <button
            onClick={onLogout}
            className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors border border-red-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Role Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {!isSuperadmin ? (
            <>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'reviews'
                    ? 'bg-[#5B00FF] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Customer Reviews</span>
                <span className="bg-slate-900/60 text-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                  {reviews.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'branding'
                    ? 'bg-[#5B00FF] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Branding & Google Link</span>
              </button>

              <button
                onClick={() => setActiveTab('admins')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'admins'
                    ? 'bg-[#5B00FF] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-[#FACC15]" />
                <span>Team & Users</span>
                <span className="bg-slate-900/60 text-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                  {adminsList.length}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('orgs')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'orgs'
                    ? 'bg-[#5B00FF] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Organizations</span>
                <span className="bg-slate-900/60 text-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                  {orgs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'reviews'
                    ? 'bg-[#5B00FF] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>All Customer Reviews</span>
                <span className="bg-slate-900/60 text-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                  {reviews.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('admins')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'admins'
                    ? 'bg-[#5B00FF] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-[#FACC15]" />
                <span>Admin Accounts</span>
                <span className="bg-slate-900/60 text-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                  {adminsList.length}
                </span>
              </button>
            </>
          )}
        </div>

        {/* ANALYTICS HEADER SUMMARY CARDS */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {!isSuperadmin ? (
              <>
                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Reviews</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {(analytics as BrandAnalytics).totalReviews}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recorded in database</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Average Score</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <p className="text-2xl font-black text-white">
                      {(analytics as BrandAnalytics).avgRating}
                    </p>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Customer satisfaction</p>
                </div>

                <div className="bg-slate-800/80 border border-amber-500/30 p-4 rounded-2xl shadow-sm bg-amber-500/5">
                  <p className="text-xs text-amber-400 font-semibold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Low Rating Alerts
                  </p>
                  <p className="text-2xl font-black text-amber-300 mt-1">
                    {(analytics as BrandAnalytics).lowRatingCount}
                  </p>
                  <p className="text-[11px] text-amber-400/80 mt-0.5">Private reviews (&lt; 4★)</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase">New Unresolved</p>
                  <p className="text-2xl font-black text-blue-400 mt-1">
                    {(analytics as BrandAnalytics).statusBreakdown.NEW}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pending internal review</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Brands</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {(analytics as SuperadminAnalytics).totalOrganizations}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active client organizations</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Global Reviews</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {(analytics as SuperadminAnalytics).totalReviews}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Across all brands</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Global Avg Rating</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <p className="text-2xl font-black text-white">
                      {(analytics as SuperadminAnalytics).globalAvgRating}
                    </p>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Network average</p>
                </div>

                <div className="bg-slate-800/80 border border-amber-500/30 p-4 rounded-2xl shadow-sm bg-amber-500/5">
                  <p className="text-xs text-amber-400 font-semibold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Total Flagged
                  </p>
                  <p className="text-2xl font-black text-amber-300 mt-1">
                    {(analytics as SuperadminAnalytics).totalLowRatings}
                  </p>
                  <p className="text-[11px] text-amber-400/80 mt-0.5">Reviews &lt; 4 stars</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 1: CUSTOMER REVIEWS TABLE */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Rating Quick Filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setRatingFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    ratingFilter === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  All Ratings
                </button>
                <button
                  onClick={() => setRatingFilter('LOW')}
                  className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    ratingFilter === 'LOW'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-900/60 text-amber-400 hover:bg-slate-700 border border-amber-500/30'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Flagged (&lt; 4★)</span>
                </button>
                <button
                  onClick={() => setRatingFilter('5')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    ratingFilter === '5'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  5★
                </button>
                <button
                  onClick={() => setRatingFilter('4')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    ratingFilter === '4'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  4★
                </button>
                <button
                  onClick={() => setRatingFilter('3')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    ratingFilter === '3'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  3★
                </button>
              </div>

              {/* Status & Search Filters */}
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>

                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search comments or customer..."
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/80">
                      <th className="py-3.5 px-4">Score</th>
                      {isSuperadmin && <th className="py-3.5 px-4">Brand</th>}
                      <th className="py-3.5 px-4">Customer & Feedback</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isSuperadmin ? 7 : 6}
                          className="py-12 text-center text-slate-400"
                        >
                          No reviews match the selected filter query.
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map((r) => {
                        const isLow = r.rating < 4;
                        return (
                          <tr
                            key={r.id}
                            className={`hover:bg-slate-700/40 transition-colors ${
                              isLow ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            {/* Score */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                <span
                                  className={`font-black text-sm ${
                                    isLow ? 'text-amber-400' : 'text-emerald-400'
                                  }`}
                                >
                                  {r.rating}★
                                </span>
                                {isLow && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Private
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Brand Name (Superadmin only) */}
                            {isSuperadmin && (
                              <td className="py-4 px-4 font-semibold text-slate-300 whitespace-nowrap">
                                {r.orgName}
                              </td>
                            )}

                            {/* Customer & Comment */}
                            <td className="py-4 px-4 max-w-md">
                              <div className="font-bold text-slate-200">
                                {r.customerName || 'Anonymous Customer'}
                              </div>
                              <p className="text-slate-400 line-clamp-2 mt-0.5 italic text-xs">
                                {r.commentText ? `"${r.commentText}"` : 'No written text'}
                              </p>
                            </td>

                            {/* Contact */}
                            <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                              {r.customerContact || 'None provided'}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  r.status === 'RESOLVED'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : r.status === 'IN_PROGRESS'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>

                            {/* Action */}
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedReview(r);
                                  setIsReviewModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl transition-colors border border-slate-600"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING & QR STAND (BRAND ADMIN) */}
        {activeTab === 'branding' && myOrg && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Branding Editor Form */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Brand Customization</h3>
                  <p className="text-xs text-slate-400">
                    Configure your public feedback landing page branding & Google Place ID
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Get QR Stand</span>
                </button>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={brandingName}
                    onChange={(e) => setBrandingName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={brandingLogoUrl}
                    onChange={(e) => setBrandingLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Brand Accent Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={brandingColor}
                      onChange={(e) => setBrandingColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandingColor}
                      onChange={(e) => setBrandingColor(e.target.value)}
                      className="w-32 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Place ID (for High Rating Redirect)
                  </label>
                  <input
                    type="text"
                    value={brandingPlaceId}
                    onChange={(e) => setBrandingPlaceId(e.target.value)}
                    placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This Place ID powers the direct "Leave it on Google" button link after 4★+ reviews.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {brandingSaved ? (
                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Branding saved!
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Updates sync in real-time</span>
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Panel */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Live Public Page Preview</h3>
                </div>

                {/* Simulated Review Card */}
                <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-2xl space-y-4">
                  <div className="h-2 w-full rounded-t-xl" style={{ backgroundColor: brandingColor }} />
                  <div className="text-center space-y-2">
                    {brandingLogoUrl ? (
                      <img
                        src={brandingLogoUrl}
                        alt="Logo"
                        className="h-10 max-w-[140px] object-contain mx-auto"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl text-white font-bold text-lg flex items-center justify-center mx-auto"
                        style={{ backgroundColor: brandingColor }}
                      >
                        {brandingName.charAt(0) || 'B'}
                      </div>
                    )}
                    <h4 className="font-bold text-gray-900 text-base">{brandingName || 'Your Brand'}</h4>
                    <p className="text-[11px] text-gray-500">How was your visit with us today?</p>
                  </div>

                  <div className="flex justify-center space-x-1.5 py-2 text-amber-400">
                    <Star className="w-6 h-6 fill-amber-400" />
                    <Star className="w-6 h-6 fill-amber-400" />
                    <Star className="w-6 h-6 fill-amber-400" />
                    <Star className="w-6 h-6 fill-amber-400" />
                    <Star className="w-6 h-6 fill-amber-400" />
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs"
                    style={{ backgroundColor: brandingColor }}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-700/60">
                <a
                  href={`/r/${myOrg.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:underline"
                >
                  <span>Open live link in new tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUPERADMIN ORGANIZATIONS MANAGER */}
        {activeTab === 'orgs' && isSuperadmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Organizations Directory</h3>
                <p className="text-xs text-slate-400">Manage client accounts and custom slugs</p>
              </div>
              <button
                onClick={() => setIsCreateOrgModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Organization</span>
              </button>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/80">
                    <th className="py-3.5 px-4">Organization</th>
                    <th className="py-3.5 px-4">Slug / Public URL</th>
                    <th className="py-3.5 px-4">Owner Email</th>
                    <th className="py-3.5 px-4">Google Place ID</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {orgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-200">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: org.primaryColor || '#2563eb' }}
                          />
                          <span>{org.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400">/r/{org.slug}</td>
                      <td className="py-4 px-4 text-slate-300">{org.ownerEmail}</td>
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {org.googlePlaceId ? (
                          <span className="text-emerald-400">Set ({org.googlePlaceId.substring(0, 8)}...)</span>
                        ) : (
                          <span className="text-amber-400">Not Configured</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <a
                          href={`/r/${org.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Page</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN / TEAM USERS DIRECTORY (SUPERADMIN & BRAND ADMIN) */}
        {activeTab === 'admins' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isSuperadmin ? 'Admin Users Directory' : 'Team Members & Users'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isSuperadmin
                    ? 'Assign brand admin access to specific organizations'
                    : 'Manage staff and user accounts for your organization'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isSuperadmin && user.orgId) {
                    setNewAdminOrgId(user.orgId);
                  }
                  setIsCreateAdminModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#5B00FF] hover:bg-[#4C00C8] text-white font-black text-xs rounded-xl shadow-md transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#FACC15]" />
                <span>{isSuperadmin ? 'Create Brand Admin' : 'Add Team Member / User'}</span>
              </button>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/80">
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Organization</th>
                    <th className="py-3.5 px-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {adminsList.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-200">{adm.email}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            adm.role === 'SUPERADMIN'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {adm.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'BRAND USER'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {adm.orgName || (isSuperadmin ? 'Global Access (Superadmin)' : user.orgName || 'Your Brand')}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(adm.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {adminsList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No team users created yet. Click "Add Team Member / User" above to invite staff.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Review Details Modal */}
      <ReviewDetailsModal
        review={selectedReview}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onUpdate={handleReviewUpdate}
      />

      {/* QR Code Stand Modal */}
      {myOrg && (
        <QRCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          brandName={myOrg.name}
          brandSlug={myOrg.slug}
          primaryColor={myOrg.primaryColor || '#2563eb'}
          logoUrl={myOrg.logoUrl}
        />
      )}

      {/* Superadmin Create Org Modal */}
      {isCreateOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => {
                    setNewOrgName(e.target.value);
                    setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Apex Dental Studio"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL Slug (/r/[slug])</label>
                <input
                  type="text"
                  required
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value)}
                  placeholder="e.g. apex-dental"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Owner Email</label>
                <input
                  type="email"
                  required
                  value={newOrgOwnerEmail}
                  onChange={(e) => setNewOrgOwnerEmail(e.target.value)}
                  placeholder="owner@brand.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Google Place ID</label>
                <input
                  type="text"
                  value={newOrgGooglePlaceId}
                  onChange={(e) => setNewOrgGooglePlaceId(e.target.value)}
                  placeholder="ChIJ..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOrgModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500"
                >
                  Create Org
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User / Admin Modal */}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {isSuperadmin ? 'Create Brand Admin Account' : 'Add Team Member / User'}
            </h3>
            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="user@brand.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-[#5B00FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono focus:border-[#5B00FF]"
                />
              </div>

              {isSuperadmin ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assign to Organization</label>
                  <select
                    value={newAdminOrgId}
                    onChange={(e) => setNewAdminOrgId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-[#5B00FF]"
                  >
                    <option value="">-- Select Organization --</option>
                    {orgs.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} (/r/{o.slug})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-slate-300">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Assigned Organization</span>
                  <span className="font-bold text-white">{user.orgName || myOrg?.name || 'Your Brand'}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5B00FF] hover:bg-[#4C00C8] text-white font-bold rounded-xl shadow-md"
                >
                  {isSuperadmin ? 'Create Admin Account' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
