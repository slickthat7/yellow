import React, { useState } from 'react';
import {
  X,
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '../types/index.js';
import { downloadStandeePdf } from '../utils/pdfGenerator.js';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSelectedOrder(null);

    try {
      const res = await fetch(`/api/public/orders/track?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order not found');
      }

      setOrders(data.orders || []);
      if (data.orders && data.orders.length === 1) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Could not find any order with that details.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'PAID':
      case 'PDF_SENT':
        return 1;
      case 'PRINTING':
      case 'QUALITY_CHECK':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-purple-950 rounded-xl font-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Track Your MAST QR Order</h3>
              <p className="text-xs text-purple-200">
                Check standee printing, courier dispatch, and download PDF assets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Order Reference Number or Customer Email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-3 bg-[#4C1D95] hover:bg-[#3B0764] disabled:opacity-50 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results List (if multiple) */}
          {orders.length > 1 && !selectedOrder && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select an Order ({orders.length} found)
              </p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => setSelectedOrder(ord)}
                    className="w-full text-left p-4 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-black text-sm text-[#4C1D95] dark:text-purple-400">
                        {ord.orderNumber}
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {ord.businessName}
                      </p>
                      <p className="text-[11px] text-slate-500">{ord.planTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-purple-100 text-purple-900">
                        {ord.orderStatus}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">₹{ord.amount}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single Order Fulfillment Details */}
          {selectedOrder && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Banner */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                    Order Number
                  </span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedOrder.orderNumber}
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {selectedOrder.businessName} • {selectedOrder.planTitle}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-purple-900 text-amber-300 shadow-xs">
                    {selectedOrder.orderStatus.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Paid ₹{selectedOrder.amount} via Razorpay
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Fulfillment Status
                </p>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  {/* Step 1: Confirmed */}
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded-full ${
                        getStatusStep(selectedOrder.orderStatus) >= 1
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <span className="text-slate-700 dark:text-slate-300">1. Order Paid</span>
                  </div>

                  {/* Step 2: Printing */}
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded-full ${
                        getStatusStep(selectedOrder.orderStatus) >= 2
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <span className="text-slate-700 dark:text-slate-300">2. Standee UV Print</span>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded-full ${
                        getStatusStep(selectedOrder.orderStatus) >= 3
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <span className="text-slate-700 dark:text-slate-300">3. In Transit</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded-full ${
                        getStatusStep(selectedOrder.orderStatus) >= 4
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <span className="text-slate-700 dark:text-slate-300">4. Delivered</span>
                  </div>
                </div>
              </div>

              {/* Courier Tracking Box (if shipped) */}
              {selectedOrder.trackingNumber ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-400 text-slate-900 rounded-xl">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Courier: {selectedOrder.courierPartner || 'Delhivery Express'}
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                        AWB: {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.trackingUrl && (
                    <a
                      href={selectedOrder.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#4C1D95] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Track on Courier Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>
                    {selectedOrder.plan === 'BASIC'
                      ? 'Digital Standee PDF is ready for download!'
                      : 'Physical standee is in production queue. Courier tracking will update within 24 hours.'}
                  </span>
                </div>
              )}

              {/* Instant PDF Download Action */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadStandeePdf({
                      businessName: selectedOrder.businessName,
                      tagline: selectedOrder.tagline,
                      qrUrl: `${window.location.origin}/r/${selectedOrder.businessSlug}`,
                      primaryColor: selectedOrder.primaryColor,
                      orderNumber: selectedOrder.orderNumber,
                      format: 'standee-5x7',
                    })
                  }
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Standee PDF (5×7")</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadStandeePdf({
                      businessName: selectedOrder.businessName,
                      tagline: selectedOrder.tagline,
                      qrUrl: `${window.location.origin}/r/${selectedOrder.businessSlug}`,
                      primaryColor: selectedOrder.primaryColor,
                      orderNumber: selectedOrder.orderNumber,
                      format: 'a4-poster',
                    })
                  }
                  className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-purple-600" />
                  <span>Download A4 Poster</span>
                </button>
              </div>

              {orders.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full text-center text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                >
                  ← Back to search results
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
