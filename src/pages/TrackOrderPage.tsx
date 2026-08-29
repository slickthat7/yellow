import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Search,
  PackageCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { MastQrLogo } from '../components/MastQrLogo.js';

export const TrackOrderPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || searchQuery;
    if (!query.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (res.ok && data.order) {
        setOrderResult(data.order);
      } else {
        setOrderResult(null);
        setErrorMessage(data.error || 'No matching order found. Please check your reference ID or phone number.');
      }
    } catch (err: any) {
      setErrorMessage('Could not connect to tracking server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-300">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Track Standee Courier Shipment
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto">
            Enter your MAST QR Order Reference Number or your 10-digit registered mobile phone number.
          </p>
        </div>
      </section>

      {/* Main Tracking Section */}
      <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6 w-full space-y-8">
        {/* Search Bar Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <form onSubmit={(e) => handleSearch(e)} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order Reference Number or 10-Digit Mobile"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600 font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4 text-amber-400" />}
              <span>{loading ? 'Searching...' : 'Track Package'}</span>
            </button>
          </form>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tracking Result Card */}
        {orderResult && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  Order Details
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {orderResult.businessName}
                </h3>
                <p className="text-xs text-slate-500">
                  Ref: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{orderResult.id}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full uppercase">
                  {orderResult.fulfillmentStatus}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Plan: {orderResult.planTitle || orderResult.planId}
                </p>
              </div>
            </div>

            {/* Courier & AWB Details */}
            {orderResult.courierPartner && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200">
                    Courier Partner: <span className="text-[#4C1D95] dark:text-purple-300">{orderResult.courierPartner}</span>
                  </p>
                  <p className="font-mono text-slate-500">
                    AWB Tracking No: <span className="font-bold text-slate-800 dark:text-slate-200">{orderResult.awbNumber || 'Generating...'}</span>
                  </p>
                </div>
                {orderResult.trackingUrl && (
                  <a
                    href={orderResult.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <span>Open Live Courier Map</span>
                    <ExternalLink className="w-3 h-3 text-amber-300" />
                  </a>
                )}
              </div>
            )}

            {/* Shipping Address */}
            {orderResult.shippingAddress && (
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  <span>Delivery Address</span>
                </p>
                <p className="text-slate-800 dark:text-slate-200 pl-4.5">
                  {orderResult.shippingAddress.line1}, {orderResult.shippingAddress.city}, {orderResult.shippingAddress.state} - {orderResult.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
