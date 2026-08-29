import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Smartphone,
  X,
} from 'lucide-react';
import { MAST_PLANS } from '../data/plans.js';
import { PlanType, PlanDetails, Order } from '../types/index.js';
import { StandeePreview } from '../components/StandeePreview.js';
import { MastQrLogo } from '../components/MastQrLogo.js';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planParam = (searchParams.get('plan') as PlanType) || 'STANDARD';
  const [selectedPlanId, setSelectedPlanId] = useState<PlanType>(
    ['BASIC', 'STANDARD', 'PRO'].includes(planParam) ? planParam : 'STANDARD'
  );

  // Business Form State
  const [businessName, setBusinessName] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [tagline, setTagline] = useState('Scan to rate us 5 stars on Google');
  const [primaryColor, setPrimaryColor] = useState('#581C87');

  // Customer Contact State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Shipping Address State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  // Payment Link & Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifyingLinkPayment, setIsVerifyingLinkPayment] = useState(false);

  const RAZORPAY_ME_LINK = 'https://razorpay.me/@yellow3609773';
  const RAZORPAY_MERCHANT_HANDLE = '@yellow3609773';
  const RAZORPAY_UPI_ID = 'yellow3609773@razorpay';

  const selectedPlan: PlanDetails =
    MAST_PLANS.find((p) => p.id === selectedPlanId) || MAST_PLANS[1];

  const isPhysicalPlan = selectedPlanId === 'STANDARD' || selectedPlanId === 'PRO';

  const previewSlug = businessName
    ? businessName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')
    : 'your-business';

  const copyUpiId = () => {
    navigator.clipboard.writeText(RAZORPAY_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!businessName.trim()) {
      setErrorMessage('Please enter your business name for the QR Standee.');
      return;
    }
    if (!googleReviewUrl.trim()) {
      setErrorMessage('Please enter your Google Review link or Google Business name.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Please enter your full name, email, and phone number.');
      return;
    }
    if (isPhysicalPlan) {
      if (!street.trim() || !city.trim() || !pincode.trim()) {
        setErrorMessage('Please provide your complete shipping address for standee delivery.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on server
      const payload = {
        plan: selectedPlanId,
        businessName: businessName.trim(),
        businessSlug: previewSlug,
        googleReviewUrl: googleReviewUrl.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        tagline: tagline.trim(),
        primaryColor,
        shippingAddress: isPhysicalPlan
          ? {
              fullName: customerName.trim(),
              phone: customerPhone.trim(),
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              pincode: pincode.trim(),
              country: 'India',
            }
          : null,
      };

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not initiate checkout order');
      }

      const { order, razorpayOrderId, keyId, amount, currency } = data;
      setPendingOrder(order);

      // 2. If Razorpay inline keys are configured and available, launch Razorpay Checkout Modal
      if (keyId && razorpayOrderId && window.Razorpay) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'MAST QR Fulfillment',
          description: `${selectedPlan.name} Standee Order (${order.orderNumber})`,
          image: '/mast-qr-logo.svg',
          order_id: razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#4C1D95',
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: order.id,
                  razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || 'Payment verification failed');
              }

              navigate(`/order-success/${order.id}`);
            } catch (err: any) {
              setErrorMessage(err.message || 'Payment verification error');
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          setErrorMessage(`Payment failed: ${response.error.description}`);
          setIsSubmitting(false);
        });
        rzp.open();
      } else {
        // Open the Razorpay Payment Link Modal
        setIsSubmitting(false);
        setShowPaymentModal(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleConfirmLinkPayment = async () => {
    if (!pendingOrder) return;
    setIsVerifyingLinkPayment(true);
    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pendingOrder.id,
          razorpayPaymentId: paymentReference.trim() || `pay_rzplink_${Date.now()}`,
          razorpaySignature: 'rzp_direct_link_verified',
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        setShowPaymentModal(false);
        navigate(`/order-success/${pendingOrder.id}`);
      } else {
        throw new Error(verifyData.error || 'Could not verify payment');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment confirmation error. Please try again.');
      setIsVerifyingLinkPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/" className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline">
              ← Back to Overview
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Complete Your MAST QR Order
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Razorpay Protected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Plan */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
                  Step 1: Choose Standee Plan
                </span>
                <span className="text-xs font-bold text-slate-500">All prices include GST</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MAST_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                        isSelected
                          ? 'border-[#4C1D95] bg-purple-50/50 dark:bg-purple-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2.5 right-2 px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-400 text-purple-950 shadow-xs">
                          {plan.badge}
                        </span>
                      )}
                      <p className="font-black text-xs text-slate-900 dark:text-white">{plan.name}</p>
                      <p className="text-lg font-black text-[#4C1D95] dark:text-purple-400 mt-1">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{plan.standeeType}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Step 2: Standee Branding Details */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
                  Step 2: Business & Standee Branding
                </span>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business / Store Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blue Tokai Coffee Roasters"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Printed prominently on your acrylic standee.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Google Review Link or Google Place ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://g.page/r/your-google-review-link"
                      value={googleReviewUrl}
                      onChange={(e) => setGoogleReviewUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Happy customers (4-5★) will be instantly routed to this Google URL. You can update this anytime in your dashboard without re-printing!
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Standee Tagline / Call to Action
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scan to rate your coffee on Google"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Customer Contact */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
                  Step 3: Contact & Dashboard Login Info
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohan Verma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rohan@mybusiness.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Used for PDF delivery and customer dashboard login.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      For courier delivery updates and SMS tracking.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Shipping Address (Physical Plans Only) */}
              {isPhysicalPlan && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
                      Step 4: Doorstep Shipping Address
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Free Courier Delivery</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Shop / Flat / Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Shop #12, Ground Floor, Phoenix Marketcity, Kurla West"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Maharashtra"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="400070"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-black text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>
                  {isSubmitting
                    ? 'Creating Order & Connecting Razorpay...'
                    : `Pay ₹${selectedPlan.price.toLocaleString('en-IN')} via Razorpay`}
                </span>
              </button>

              {/* Razorpay Trust & Payment Methods Banner */}
              <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Verified Razorpay Gateway
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">
                    {RAZORPAY_MERCHANT_HANDLE}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-purple-100/60 dark:border-purple-900/40">
                  <span>UPI (GPay, PhonePe, Paytm, BHIM), Cards & NetBanking</span>
                  <a
                    href={RAZORPAY_ME_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 dark:text-purple-300 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>razorpay.me</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Secure 256-Bit SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>100% Replacement Guarantee</span>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Standee Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Live Standee Preview Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Custom Standee Preview
                </span>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                  Live Render
                </span>
              </div>

              <StandeePreview
                businessName={businessName || 'Your Business Name'}
                tagline={tagline}
                qrSlugOrUrl={previewSlug}
                primaryColor={primaryColor}
                planTitle={selectedPlan.name}
                showDownloadButton={false}
                isNfcEnabled={selectedPlanId === 'PRO'}
              />
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Order Summary
              </span>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <div className="flex justify-between">
                  <span>{selectedPlan.name}</span>
                  <span className="font-bold">₹{selectedPlan.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-bold text-slate-400">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Shipping (Pan-India)</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-black text-slate-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-[#4C1D95] dark:text-purple-400">
                    ₹{selectedPlan.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY PAYMENT MODAL */}
      {showPaymentModal && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Razorpay Verified Merchant
                </span>
                <span className="text-purple-200 text-xs font-mono">{RAZORPAY_MERCHANT_HANDLE}</span>
              </div>
              <h3 className="text-xl font-black text-white">Complete Payment on Razorpay</h3>
              <p className="text-xs text-purple-200 mt-1">
                Order #{pendingOrder.orderNumber} • {pendingOrder.businessName}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Amount Highlight */}
              <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-100 dark:border-purple-900 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Amount Payable</p>
                  <p className="text-2xl font-black text-[#4C1D95] dark:text-purple-300">
                    ₹{pendingOrder.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-1 rounded">
                    Instant Activation
                  </span>
                </div>
              </div>

              {/* Step 1: Open Razorpay Link CTA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Step 1: Pay via Razorpay Link / UPI
                  </span>
                  <span className="text-[11px] text-slate-400">Any UPI app or Cards</span>
                </div>

                <a
                  href={RAZORPAY_ME_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Razorpay Payment Page ({RAZORPAY_ME_LINK.replace('https://', '')})</span>
                </a>

                {/* Direct UPI ID Box */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Direct UPI VPA ID</p>
                      <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {RAZORPAY_UPI_ID}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 hover:bg-slate-50"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Confirm Payment */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 2: Confirm Payment & Begin Delivery
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Razorpay Payment ID / UPI Ref / UTR (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. pay_XXXXX or 12-digit UPI UTR"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Found in your SMS / UPI receipt or on Razorpay success screen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmLinkPayment}
                  disabled={isVerifyingLinkPayment}
                  className="w-full py-3.5 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>
                    {isVerifyingLinkPayment
                      ? 'Verifying & Setting Up Dashboard...'
                      : 'I Have Paid • Confirm Order & Track Standee'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
