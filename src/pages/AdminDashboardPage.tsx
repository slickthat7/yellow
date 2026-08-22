import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  Save,
  LogOut,
  Building2,
  Users,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  AuthSessionUser,
  Order,
  Organization,
  SuperadminAnalytics,
  OrderStatus,
} from '../types/index.js';
import { MastQrLogo } from '../components/MastQrLogo.js';
import { COURIER_PARTNERS } from '../data/plans.js';

interface AdminDashboardProps {
  user: AuthSessionUser;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [analytics, setAnalytics] = useState<SuperadminAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'orgs' | 'overview'>('orders');

  // Fulfillment Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PRINTING');
  const [courierPartner, setCourierPartner] = useState('Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAdminData = async () => {
    try {
      // Analytics
      const anRes = await fetch('/api/admin/analytics');
      if (anRes.ok) {
        const anData = await anRes.json();
        setAnalytics(anData);
      }

      // Orders
      const ordRes = await fetch('/api/admin/orders');
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }

      // Orgs
      const orgRes = await fetch('/api/admin/orgs');
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrgs(orgData.orgs || []);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openFulfillmentModal = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.orderStatus);
    setCourierPartner(order.courierPartner || 'Delhivery Express');
    setTrackingNumber(order.trackingNumber || '');
    setTrackingUrl(order.trackingUrl || '');
    setEstimatedDelivery(order.estimatedDelivery || '');
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}/fulfillment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          courierPartner,
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || `https://www.delhivery.com/track/package/${trackingNumber.trim()}`,
          estimatedDelivery,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? data.order : o)));
        setEditingOrder(null);
      }
    } catch (e) {
      console.error('Error updating fulfillment:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/">
                <MastQrLogo size="sm" variant="horizontal" />
              </Link>
              <span className="text-xs font-black text-amber-900 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-lg uppercase">
                Superadmin Lead
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-[10px] text-slate-400">MAST QR Operations HQ</p>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#4C1D95] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Order Fulfillment Pipeline ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orgs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orgs'
                ? 'bg-[#4C1D95] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Client Stores ({orgs.length})</span>
          </button>
        </div>

        {/* Global Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold">Via Razorpay Gateway</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#4C1D95] dark:text-purple-400">
              {orders.length}
            </p>
            <p className="text-[10px] text-purple-600 font-bold">Standee & Digital Starter</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Shipments
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-500">
              {orders.filter((o) => o.orderStatus === 'PRINTING' || o.orderStatus === 'QUALITY_CHECK').length}
            </p>
            <p className="text-[10px] text-amber-600 font-bold">In UV Printing Queue</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Standee QRs
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{orgs.length}</p>
            <p className="text-[10px] text-slate-400 font-bold">Pan-India Businesses</p>
          </div>
        </div>

        {/* TAB 1: ORDER FULFILLMENT PIPELINE */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-150">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Order Fulfillment & Courier Dispatch
                </h3>
                <p className="text-xs text-slate-500">
                  Update printing stage, assign courier partner, and log AWB tracking numbers.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">Customer & Store</th>
                    <th className="px-6 py-4">Plan & Amount</th>
                    <th className="px-6 py-4">Shipping Destination</th>
                    <th className="px-6 py-4">Fulfillment Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-purple-700 dark:text-purple-400">
                        {ord.orderNumber}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 dark:text-white">{ord.businessName}</p>
                        <p className="text-[11px] text-slate-500">{ord.customerName} • {ord.customerPhone}</p>
                        <p className="text-[10px] text-slate-400">{ord.customerEmail}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{ord.planTitle}</p>
                        <p className="text-[11px] font-black text-emerald-600">₹{ord.amount} (Paid)</p>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        {ord.shippingAddress ? (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                            {ord.shippingAddress.street}, {ord.shippingAddress.city} - {ord.shippingAddress.pincode}
                          </p>
                        ) : (
                          <span className="text-[10px] text-slate-400">Digital Delivery (PDF)</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full inline-block ${
                              ord.orderStatus === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'SHIPPED'
                                ? 'bg-purple-100 text-purple-900'
                                : ord.orderStatus === 'PRINTING'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {ord.orderStatus.replace('_', ' ')}
                          </span>
                          {ord.trackingNumber && (
                            <p className="text-[10px] font-mono text-purple-600 font-bold">
                              AWB: {ord.trackingNumber}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openFulfillmentModal(ord)}
                          className="px-3 py-1.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 ml-auto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Fulfill</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT STORES */}
        {activeTab === 'orgs' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              All Client Storefronts & QR Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{org.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">/r/{org.slug}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-purple-100 text-purple-900">
                      {org.plan || 'BASIC'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{org.totalScans || 0}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Total Scans</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-amber-500">{org.fiveStarRedirects || 0}</p>
                      <p className="text-[10px] text-slate-400 font-bold">5★ Redirects</p>
                    </div>
                  </div>

                  <a
                    href={`/r/${org.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-purple-900 dark:text-purple-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-center flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Open Live QR Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fulfillment Update Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-950 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h4 className="font-black text-base">Update Order Fulfillment</h4>
                <p className="text-xs text-purple-200">
                  {editingOrder.orderNumber} • {editingOrder.businessName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFulfillment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                >
                  <option value="PAID">PAID (Order Confirmed)</option>
                  <option value="PRINTING">PRINTING (In UV Production Queue)</option>
                  <option value="QUALITY_CHECK">QUALITY_CHECK (Inspecting Acrylic Finish)</option>
                  <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                  <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Courier Partner
                </label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                >
                  {COURIER_PARTNERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  AWB Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEL-8892104912"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Tracking URL
                </label>
                <input
                  type="text"
                  placeholder="https://www.delhivery.com/track/package/..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Update Fulfillment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
