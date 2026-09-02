import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Building2,
  LogOut,
  Search,
  X,
  Plus,
  QrCode as QrCodeIcon,
  Banknote,
  Smartphone,
  CreditCard,
  Clock,
  Edit,
  Save,
  RefreshCw,
  ExternalLink,
  Sparkles,
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
import { QRCodeGeneratorModal } from '../components/QRCodeGeneratorModal.js';
import { QRCodeStudioView } from '../components/QRCodeStudioView.js';
import { CreateProfileModal } from '../components/CreateProfileModal.js';
import { CollectManualPaymentModal } from '../components/CollectManualPaymentModal.js';

interface AdminDashboardProps {
  user: AuthSessionUser;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [analytics, setAnalytics] = useState<SuperadminAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'orgs' | 'qr-studio'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // Fulfillment Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PRINTING');
  const [courierPartner, setCourierPartner] = useState('Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // New Superadmin Modals
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [qrModalProps, setQrModalProps] = useState<{
    isOpen: boolean;
    initialUrl: string;
    initialTitle: string;
    storeSlug: string;
    businessName: string;
    primaryColor?: string;
  }>({
    isOpen: false,
    initialUrl: '',
    initialTitle: '',
    storeSlug: '',
    businessName: '',
  });
  const [manualPaymentOrder, setManualPaymentOrder] = useState<Order | null>(null);

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

  const openQrStudio = (order?: Order, org?: Organization) => {
    if (order) {
      const target = order.businessSlug
        ? `${window.location.origin}/r/${order.businessSlug}`
        : `${window.location.origin}/track?q=${encodeURIComponent(order.orderNumber)}`;
      setQrModalProps({
        isOpen: true,
        initialUrl: target,
        initialTitle: `Standee QR Code: ${order.orderNumber} (${order.businessName})`,
        storeSlug: order.businessSlug,
        businessName: order.businessName,
      });
    } else if (org) {
      setQrModalProps({
        isOpen: true,
        initialUrl: `${window.location.origin}/r/${org.slug}`,
        initialTitle: `Store Standee QR: ${org.name}`,
        storeSlug: org.slug,
        businessName: org.name,
        primaryColor: org.primaryColor,
      });
    } else {
      setQrModalProps({
        isOpen: true,
        initialUrl: `${window.location.origin}/r/demo`,
        initialTitle: 'Standee QR Code & Print Studio',
        storeSlug: '',
        businessName: 'Business Storefront',
      });
    }
  };

  const handlePaymentCollected = (updatedOrder: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    fetchAdminData();
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.businessSlug && o.businessSlug.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (paymentFilter === 'PAID') {
      return o.paymentStatus === 'COMPLETED';
    }
    if (paymentFilter === 'PENDING') {
      return o.paymentStatus !== 'COMPLETED';
    }
    return true;
  });

  const getPaymentBadge = (order: Order) => {
    if (order.paymentStatus === 'COMPLETED') {
      if (order.paymentMethod === 'MANUAL_CASH') {
        return (
          <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-emerald-100 text-emerald-900 flex items-center gap-1">
            <Banknote className="w-3 h-3" />
            <span>Cash (Manual)</span>
          </span>
        );
      }
      if (order.paymentMethod === 'MANUAL_UPI') {
        return (
          <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-indigo-100 text-indigo-900 flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            <span>UPI Direct (Manual)</span>
          </span>
        );
      }
      if (order.paymentMethod === 'MANUAL_BANK_TRANSFER') {
        return (
          <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-blue-100 text-blue-900 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>NEFT / Bank (Manual)</span>
          </span>
        );
      }
      if (order.paymentMethod === 'WAIVED') {
        return (
          <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-slate-200 text-slate-800">
            Waived / Comp
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-purple-100 text-purple-900 flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          <span>Razorpay Online</span>
        </span>
      );
    }

    return (
      <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-amber-100 text-amber-900 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>Pending Payment</span>
      </span>
    );
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
                Superadmin Operations HQ
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openQrStudio()}
                className="hidden md:flex px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <QrCodeIcon className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                <span>QR Standee Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateProfileOpen(true)}
                className="px-4 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Client Profile</span>
              </button>

              <div className="text-right hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-[10px] text-slate-400">Superadmin</p>
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
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
              <span>Order Fulfillment & Payments ({orders.length})</span>
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
              <span>Client Store Profiles ({orgs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qr-studio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'qr-studio'
                  ? 'bg-[#4C1D95] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <QrCodeIcon className="w-3.5 h-3.5" />
              <span>QR Code & Standee Studio</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchAdminData}
            title="Refresh Data"
            className="p-2 text-slate-500 hover:text-purple-700 dark:hover:text-purple-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Total Revenue</span>
            <p className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-300">
              ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 font-bold">Online + Offline Paid</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {analytics?.totalOrders || orders.length}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold">
              {orders.filter((o) => o.paymentStatus === 'COMPLETED').length} Paid / Active
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Standees in Dispatch</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600">
              {orders.filter((o) => o.orderStatus === 'PRINTING' || o.orderStatus === 'SHIPPED').length}
            </p>
            <p className="text-[10px] text-slate-400 font-bold">UV Print & In-Transit</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Live Storefronts</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{orgs.length}</p>
            <p className="text-[10px] text-slate-400 font-bold">Active Profiles</p>
          </div>
        </div>

        {/* TAB 1: ORDER FULFILLMENT PIPELINE */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-150 space-y-4">
            {/* Header & Filter Bar */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Order Fulfillment & Payment Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  Manage UV print fabrication, generate high-resolution QR acrylic standees, collect offline manual payments, and dispatch couriers.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, #, slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Payments</option>
                  <option value="PAID">Paid Only (Manual/Online)</option>
                  <option value="PENDING">Pending Payment</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Order # & Standee QR</th>
                    <th className="px-6 py-4">Customer & Store</th>
                    <th className="px-6 py-4">Hardware Plan</th>
                    <th className="px-6 py-4">Payment Status & Channel</th>
                    <th className="px-6 py-4">Fulfillment Stage</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs font-medium">
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono font-black text-purple-700 dark:text-purple-400 text-xs">
                            {ord.orderNumber}
                          </p>
                          <button
                            type="button"
                            onClick={() => openQrStudio(ord)}
                            className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors"
                            title="Click to generate vector QR & UV acrylic artwork"
                          >
                            <QrCodeIcon className="w-3 h-3 text-purple-600" />
                            <span>Generate QR Artwork</span>
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-black text-slate-900 dark:text-white">{ord.businessName}</p>
                          <p className="text-[11px] text-slate-500">{ord.customerName} • {ord.customerPhone}</p>
                          <p className="text-[10px] text-slate-400">{ord.customerEmail}</p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{ord.planTitle}</p>
                          <p className="text-[11px] font-black text-purple-900 dark:text-purple-300">
                            ₹{ord.amount}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {getPaymentBadge(ord)}
                            {ord.manualPaymentRef && (
                              <p className="text-[10px] font-mono text-slate-400">Ref: {ord.manualPaymentRef}</p>
                            )}
                          </div>
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
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.paymentStatus !== 'COMPLETED' && (
                              <button
                                type="button"
                                onClick={() => setManualPaymentOrder(ord)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                                title="Collect Offline Cash / Direct UPI or Send Online Link"
                              >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Collect Pay</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => openFulfillmentModal(ord)}
                              className="px-3 py-1.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Fulfill</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT STORE PROFILES */}
        {activeTab === 'orgs' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Client Storefronts & QR Profiles
                </h3>
                <p className="text-xs text-slate-500">
                  Manage merchant profiles, generate instant acrylic QR standees, and inspect live feedback routing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateProfileOpen(true)}
                className="px-4 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Client Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{org.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">/r/{org.slug}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-purple-100 text-purple-900">
                      {org.plan || 'STANDARD'}
                    </span>
                  </div>

                  {/* QR & Standee Generation Shortcut */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCodeIcon className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Smart QR Standee</span>
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          /r/{org.slug}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openQrStudio(undefined, org)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 text-[10px] font-bold rounded-lg border border-purple-200"
                    >
                      QR Studio
                    </button>
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

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`/r/${org.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-purple-900 dark:text-purple-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Live QR Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QR CODE & UV STANDEE STUDIO */}
        {activeTab === 'qr-studio' && (
          <QRCodeStudioView
            orders={orders}
            orgs={orgs}
            onRefreshData={fetchAdminData}
            onOpenModal={openQrStudio}
          />
        )}

        {/* FULFILLMENT EDIT MODAL */}
        {editingOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-5 bg-gradient-to-r from-purple-950 to-indigo-950 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-black text-base">Fulfill Order: {editingOrder.orderNumber}</h4>
                  <p className="text-xs text-purple-200">
                    {editingOrder.businessName} • {editingOrder.planTitle}
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
                    <option value="PENDING_PAYMENT">PENDING_PAYMENT (Awaiting Cash/UPI/Online)</option>
                    <option value="PAID">PAID (Payment Confirmed)</option>
                    <option value="PRINTING">PRINTING (In UV Production Queue)</option>
                    <option value="QUALITY_CHECK">QUALITY_CHECK (Inspecting Acrylic Finish)</option>
                    <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                    <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
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

        {/* MODAL: CUSTOM QR CODE & UV STANDEE GENERATOR */}
        <QRCodeGeneratorModal
          isOpen={qrModalProps.isOpen}
          onClose={() => setQrModalProps((prev) => ({ ...prev, isOpen: false }))}
          initialUrl={qrModalProps.initialUrl}
          initialTitle={qrModalProps.initialTitle}
          storeSlug={qrModalProps.storeSlug}
          businessName={qrModalProps.businessName}
          primaryColor={qrModalProps.primaryColor}
        />

        {/* MODAL: CREATE PROFILE VIA BACKEND */}
        <CreateProfileModal
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          onProfileCreated={fetchAdminData}
        />

        {/* MODAL: COLLECT MANUAL PAYMENT */}
        <CollectManualPaymentModal
          isOpen={Boolean(manualPaymentOrder)}
          onClose={() => setManualPaymentOrder(null)}
          order={manualPaymentOrder}
          onPaymentCollected={handlePaymentCollected}
        />
      </div>
    </div>
  );
};
