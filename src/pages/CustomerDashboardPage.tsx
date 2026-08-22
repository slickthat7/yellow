import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Star,
  QrCode,
  Truck,
  TrendingUp,
  Download,
  Settings,
  MessageSquare,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  LogOut,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  AuthSessionUser,
  Organization,
  Review,
  Order,
  BrandAnalytics,
  ReviewStatus,
} from '../types/index.js';
import { MastQrLogo } from '../components/MastQrLogo.js';
import { StandeePreview } from '../components/StandeePreview.js';
import { downloadStandeePdf } from '../utils/pdfGenerator.js';

interface CustomerDashboardProps {
  user: AuthSessionUser;
  onLogout: () => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const [org, setOrg] = useState<Organization | null>(null);
  const [analytics, setAnalytics] = useState<BrandAnalytics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'standee' | 'orders' | 'settings'>('overview');

  // Org Settings Edit State
  const [businessName, setBusinessName] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#581C87');
  const [phone, setPhone] = useState('');
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Review Status Update State
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);
  const [reviewNoteText, setReviewNoteText] = useState('');

  const fetchDashboardData = async () => {
    try {
      // Fetch Org
      const orgRes = await fetch('/api/admin/my-org');
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrg(orgData.org);
        setBusinessName(orgData.org.name);
        setGoogleReviewUrl(orgData.org.googleReviewUrl || orgData.org.googlePlaceId || '');
        setPrimaryColor(orgData.org.primaryColor || '#581C87');
        setPhone(orgData.org.phone || '');
      }

      // Fetch Analytics
      const analyticsRes = await fetch('/api/admin/analytics');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      // Fetch Reviews
      const revRes = await fetch('/api/admin/reviews');
      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
      }

      // Fetch Orders
      const ordRes = await fetch('/api/customer/orders');
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveOrgSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOrg(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/my-org', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          googleReviewUrl,
          primaryColor,
          phone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrg(data.org);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleUpdateReviewStatus = async (reviewId: string, status: ReviewStatus, notes?: string) => {
    setUpdatingReviewId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          internalNotes: notes,
        }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status, internalNotes: notes || r.internalNotes } : r))
        );
      }
    } catch (e) {
      console.error('Error updating review:', e);
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const activeSlug = org?.slug || 'mast-demo';
  const qrScanUrl = `${window.location.origin}/r/${activeSlug}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top App Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/">
                <MastQrLogo size="sm" variant="horizontal" />
              </Link>
              <span className="hidden sm:inline text-xs font-black text-purple-700 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-lg">
                Client Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-[10px] text-slate-400">{org?.name || user.email}</p>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#4C1D95] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Overview & Stats
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'bg-[#4C1D95] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Private Feedback Inbox</span>
            {reviews.filter((r) => r.status === 'NEW').length > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] bg-red-500 text-white rounded-full font-black">
                {reviews.filter((r) => r.status === 'NEW').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('standee')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'standee'
                ? 'bg-[#4C1D95] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Standee & PDF Downloads</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#4C1D95] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Orders & Courier Tracking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#4C1D95] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>QR Destination Link</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Standee Scans
                </span>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {org?.totalScans || analytics?.totalScans || 0}
                </p>
                <p className="text-[10px] text-purple-600 font-bold">Live Counter & Table Scans</p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  5★ Google Redirects
                </span>
                <p className="text-3xl font-black text-amber-500">
                  {org?.fiveStarRedirects || 0}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">Sent directly to Google Maps</p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Private Feedbacks Intercepted
                </span>
                <p className="text-3xl font-black text-purple-700 dark:text-purple-400">
                  {org?.privateFeedbacks || reviews.length || 0}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">Saved from public negative rating</p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Positive Satisfaction Rate
                </span>
                <p className="text-3xl font-black text-emerald-600">
                  {org?.totalScans && org.totalScans > 0
                    ? `${Math.round(((org.fiveStarRedirects || 0) / org.totalScans) * 100)}%`
                    : '98%'}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">Google Maps Optimized</p>
              </div>
            </div>

            {/* Quick Link & Standee Banner */}
            <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                  Live Dynamic Smart URL
                </span>
                <h3 className="text-xl font-black">{org?.name || 'Your Business'} Standee Link</h3>
                <p className="text-xs text-purple-200 font-mono break-all">{qrScanUrl}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <a
                  href={qrScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Test Live QR Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setActiveTab('standee')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDFs</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INBOX (PRIVATE REVIEWS) */}
        {activeTab === 'inbox' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Private Customer Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Customers who rated 1-3 stars on your standee submitted these private notes directly to you.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No negative customer complaints logged!
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your standee is successfully routing happy customers directly to Google Reviews.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {rev.customerName || 'Anonymous Customer'}
                          </span>
                          {rev.customerContact && (
                            <span className="text-[11px] font-mono text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                              {rev.customerContact}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          "{rev.commentText || 'No comment text provided'}"
                        </p>
                      </div>

                      {/* Status pill */}
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full shrink-0 ${
                          rev.status === 'NEW'
                            ? 'bg-red-100 text-red-800'
                            : rev.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rev.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Internal Notes & Quick Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Received: {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Mark Status:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateReviewStatus(rev.id, 'IN_PROGRESS')}
                          className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[10px] font-bold"
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateReviewStatus(rev.id, 'RESOLVED')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-bold"
                        >
                          Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STANDEE & PDF DOWNLOADS */}
        {activeTab === 'standee' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-150">
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  High-Resolution Vector PDF Generator
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate print-ready PDFs formatted for your storefront. These files maintain ultra-crisp vector sharpness for local digital printers, acrylic workshops, and tabletop displays.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-950 dark:text-purple-200">
                        5×7" Counter Acrylic Standee
                      </p>
                      <p className="text-[10px] text-purple-700 dark:text-purple-400">
                        Standard countertop & POS register display
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        downloadStandeePdf({
                          businessName: org?.name || 'My Business',
                          qrUrl: qrScanUrl,
                          format: 'standee-5x7',
                        })
                      }
                      className="px-3.5 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        A4 Wall & Window Poster
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Large entrance, waiting room & mirror poster
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        downloadStandeePdf({
                          businessName: org?.name || 'My Business',
                          qrUrl: qrScanUrl,
                          format: 'a4-poster',
                        })
                      }
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <StandeePreview
                businessName={org?.name || 'My Business'}
                qrSlugOrUrl={activeSlug}
                primaryColor={org?.primaryColor || '#581C87'}
                showDownloadButton={true}
              />
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & COURIER TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Your Orders & Standee Shipments
            </h3>

            {orders.length === 0 ? (
              <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No orders linked to this session
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-black text-purple-700 dark:text-purple-400">
                          {ord.orderNumber}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {ord.planTitle}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Ordered on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-purple-100 text-purple-900">
                          {ord.orderStatus.replace('_', ' ')}
                        </span>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                          ₹{ord.amount} (Paid)
                        </p>
                      </div>
                    </div>

                    {ord.trackingNumber && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-purple-700" />
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Courier: {ord.courierPartner || 'Delhivery Express'}
                            </p>
                            <p className="text-xs font-mono font-bold text-purple-900 dark:text-purple-300">
                              AWB: {ord.trackingNumber}
                            </p>
                          </div>
                        </div>
                        {ord.trackingUrl && (
                          <a
                            href={ord.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-[#4C1D95] text-white text-xs font-bold rounded-xl flex items-center gap-1"
                          >
                            <span>Live Track</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: QR SETTINGS & GOOGLE DESTINATION */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Update Target Google Review Link
              </h3>
              <p className="text-xs text-slate-500">
                You can change where your Standee QR points anytime. Your physical acrylic standee never becomes obsolete!
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Destination settings saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveOrgSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Google Review URL
                </label>
                <input
                  type="text"
                  required
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When 4 or 5 stars are tapped on your standee, customers immediately land here.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingOrg}
                className="py-3 px-6 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingOrg ? 'Saving Changes...' : 'Save QR Destination'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
