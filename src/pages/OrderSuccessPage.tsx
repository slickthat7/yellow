import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  Truck,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Package,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Order } from '../types/index.js';
import { MastQrLogo } from '../components/MastQrLogo.js';
import { downloadStandeePdf } from '../utils/pdfGenerator.js';
import { StandeePreview } from '../components/StandeePreview.js';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4C1D95', '#F59E0B', '#10B981', '#6366F1'],
      });
    } catch (e) {
      // ignore
    }

    if (id) {
      fetch(`/api/public/orders/track?query=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orders && data.orders.length > 0) {
            setOrder(data.orders[0]);
          } else {
            setError('Order not found');
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-md space-y-4 shadow-xl">
          <p className="text-sm font-bold text-red-600">{error || 'Order record not found.'}</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-[#4C1D95] text-white text-xs font-bold rounded-xl"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPhysical = order.plan === 'STANDARD' || order.plan === 'PRO';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Header Card */}
        <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-4">
          <div className="w-16 h-16 bg-amber-400 text-purple-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300">
              Payment Successful • Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-mono">
              Order Reference: <strong className="text-white">{order.orderNumber}</strong>
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-purple-200">
            <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              Amount Paid: <strong>₹{order.amount.toLocaleString('en-IN')}</strong>
            </span>
            <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              Plan: <strong>{order.planTitle}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Fulfillment Info & Downloads (7 Cols) */}
          <div className="md:col-span-7 space-y-6">
            {/* Fulfillment Status Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
                  Fulfillment Status
                </span>
                <span className="px-3 py-1 text-[11px] font-black uppercase rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {order.orderStatus.replace('_', ' ')}
                </span>
              </div>

              {isPhysical ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>Doorstep Courier Dispatch</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Your custom standee is currently in our UV printing and quality-check queue. You will receive courier dispatch updates and tracking via WhatsApp and email within 24-48 hours.
                  </p>
                  {order.shippingAddress && (
                    <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-700">
                      <strong>Shipping to:</strong> {order.shippingAddress.fullName},{' '}
                      {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1 text-xs text-emerald-800 dark:text-emerald-300">
                  <p className="font-black">Instant Digital Delivery Ready!</p>
                  <p className="text-emerald-700 dark:text-emerald-400">
                    Your print-ready high-resolution vector PDF files are ready for download below and have also been sent to <strong>{order.customerEmail}</strong>.
                  </p>
                </div>
              )}

              {/* Instant Download Options */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Download Print-Ready Assets:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      downloadStandeePdf({
                        businessName: order.businessName,
                        tagline: order.tagline,
                        qrUrl: `${window.location.origin}/r/${order.businessSlug}`,
                        primaryColor: order.primaryColor,
                        orderNumber: order.orderNumber,
                        format: 'standee-5x7',
                      })
                    }
                    className="p-3 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-purple-600" />
                    <span>5×7" Acrylic Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      downloadStandeePdf({
                        businessName: order.businessName,
                        tagline: order.tagline,
                        qrUrl: `${window.location.origin}/r/${order.businessSlug}`,
                        primaryColor: order.primaryColor,
                        orderNumber: order.orderNumber,
                        format: 'a4-poster',
                      })
                    }
                    className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>A4 Poster Printable</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Access Information */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
                Customer Dashboard Access
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                We have initialized your customer account with email <strong>{order.customerEmail}</strong>. You can log in to view real-time scan analytics and change your target Google Review URL anytime.
              </p>
              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="w-full py-3 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Go to Customer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Live Standee Visual (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Your Standee QR
              </span>

              <StandeePreview
                businessName={order.businessName}
                tagline={order.tagline}
                qrSlugOrUrl={order.businessSlug}
                primaryColor={order.primaryColor}
                orderNumber={order.orderNumber}
                planTitle={order.planTitle}
                showDownloadButton={true}
                isNfcEnabled={order.plan === 'PRO'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
