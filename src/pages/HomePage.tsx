import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  Smartphone,
  TrendingUp,
  Download,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Zap,
  Building2,
  Coffee,
  ShoppingBag,
  Stethoscope,
  Scissors,
} from 'lucide-react';
import { MastQrLogo } from '../components/MastQrLogo.js';
import { StandeePreview } from '../components/StandeePreview.js';
import { MAST_PLANS } from '../data/plans.js';

interface HomePageProps {
  onOpenTracker?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenTracker }) => {
  const [demoName, setDemoName] = useState('Cafe Coffee Day');
  const [demoTagline, setDemoTagline] = useState('Scan to rate your coffee on Google');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('STANDARD');

  return (
    <div className="flex flex-col min-h-screen">
      {/* ==========================================
          HERO SECTION
          ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Main Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                  SCAN • RATE • IMPROVE • GROW
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Turn Walk-in Customers Into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
                  5-Star Google Reviews
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-purple-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Get custom acrylic QR standees delivered to your shop counter. Smart review routing sends happy customers straight to Google while catching negative feedback privately.
              </p>

              {/* Quick Feature Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-purple-200">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant Vector PDF</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Smart 5★ Filter</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Doorstep Courier</span>
                </div>
              </div>

              {/* CTA Group */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/checkout?plan=STANDARD"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 text-sm sm:text-base font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-102 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-purple-950" />
                  <span>Order Acrylic Standee (₹1,499)</span>
                </Link>

                <Link
                  to="/checkout?plan=BASIC"
                  className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs sm:text-sm font-bold rounded-2xl backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Instant PDF Only (₹499)</span>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-purple-200">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Free Shipping in India</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Razorpay Verified</span>
                </div>
              </div>
            </div>

            {/* Right Col: Live Standee Visualizer */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full bg-white/10 p-6 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase text-amber-300">
                      Live Standee Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-200 bg-white/10 px-2 py-0.5 rounded">
                    UV Print Quality
                  </span>
                </div>

                {/* Standee Mockup Component */}
                <StandeePreview
                  businessName={demoName}
                  tagline={demoTagline}
                  qrSlugOrUrl="mast-demo"
                  planTitle="Standard Acrylic Standee"
                  showDownloadButton={false}
                />

                {/* Interactive Demo Inputs */}
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    placeholder="Type your business name..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-purple-300 focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-bold"
                  />
                  <p className="text-[10px] text-purple-300 text-center">
                    Type above to see your live standee update in real time!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SOCIAL PROOF STATS STRIP
          ========================================== */}
      <section className="bg-amber-400 text-purple-950 py-6 border-y border-amber-500 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black">50,000+</p>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-900">
                5-Star Reviews Delivered
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black">4.9 / 5.0</p>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Average Client Rating
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black">100%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Transit Damage Guarantee
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black">3-5 Days</p>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Pan-India Delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          HOW IT WORKS (3 SIMPLE STEPS)
          ========================================== */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#4C1D95] dark:text-purple-400">
              Zero Friction Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              How MAST QR Grows Your Google Ranking
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Traditional review requests get forgotten. MAST QR places a premium physical cue right where customers complete their purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-4 hover:border-purple-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-[#4C1D95] dark:text-purple-300 font-black text-lg flex items-center justify-center shadow-xs">
                01
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Place Standee on Counter
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Choose your plan and customize your brand standee. We print with UV cured gloss acrylic and ship to your shop doorstep with express courier tracking.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-4 hover:border-purple-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-lg flex items-center justify-center shadow-xs">
                02
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Customer Scans with Camera
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Customers point their phone camera (or tap via NFC on Pro). No special app download is needed. It opens your high-converting rating page in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 bg-purple-50 dark:bg-purple-950/40 rounded-3xl border border-purple-200 dark:border-purple-800 space-y-4 hover:border-purple-400 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#4C1D95] text-amber-300 font-black text-lg flex items-center justify-center shadow-md">
                03
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Smart 5★ Review Filtering
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Happy customers giving 4 or 5 stars are routed directly to Google Maps to leave a public review. Unhappy feedback (1-3 stars) is sent to your private dashboard!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          PRICING & PLANS SECTION
          ========================================== */}
      <section id="pricing" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#4C1D95] dark:text-purple-400">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Choose Your Fulfillment Plan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              One-time payment with zero hidden monthly fees. Includes lifetime dynamic QR redirection and free pan-India shipping.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {MAST_PLANS.map((plan) => {
              const isRecommended = plan.recommended;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                    isRecommended
                      ? 'bg-gradient-to-b from-purple-900 to-indigo-950 text-white shadow-2xl border-2 border-amber-400 scale-102 z-10'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-md'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span
                        className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md ${
                          isRecommended
                            ? 'bg-amber-400 text-purple-950'
                            : 'bg-slate-900 text-amber-400'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Plan Header */}
                    <div className="mb-6">
                      <h3 className="text-xl font-black">{plan.name}</h3>
                      <p
                        className={`text-xs mt-1 ${
                          isRecommended ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="mb-6 pb-6 border-b border-slate-200/20">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">₹{plan.price.toLocaleString('en-IN')}</span>
                        {plan.originalPrice && (
                          <span
                            className={`text-sm line-through ${
                              isRecommended ? 'text-purple-300' : 'text-slate-400'
                            }`}
                          >
                            ₹{plan.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] font-bold mt-1 ${
                          isRecommended ? 'text-amber-300' : 'text-purple-700 dark:text-purple-400'
                        }`}
                      >
                        Fulfillment: {plan.fulfillmentTime}
                      </p>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-3 text-xs mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isRecommended ? 'text-amber-400' : 'text-[#4C1D95] dark:text-purple-400'
                            }`}
                          />
                          <span
                            className={
                              isRecommended ? 'text-purple-100' : 'text-slate-700 dark:text-slate-300'
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Button */}
                  <div>
                    <Link
                      to={`/checkout?plan=${plan.id}`}
                      className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2 shadow-md ${
                        isRecommended
                          ? 'bg-amber-400 hover:bg-amber-300 text-purple-950 hover:shadow-lg'
                          : 'bg-[#4C1D95] hover:bg-[#3B0764] text-white hover:shadow-lg'
                      }`}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          PERFECT FOR EVERY LOCAL BUSINESS
          ========================================== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Trusted Across All Walk-In Business Types
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Designed for reception desks, billing counters, dining tables, and checkout registers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <Coffee className="w-6 h-6 text-[#4C1D95] mx-auto" />
              <p className="text-xs font-black text-slate-900 dark:text-white">Cafes & Restaurants</p>
              <p className="text-[10px] text-slate-500">Table tents & billing counters</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <Stethoscope className="w-6 h-6 text-[#4C1D95] mx-auto" />
              <p className="text-xs font-black text-slate-900 dark:text-white">Clinics & Hospitals</p>
              <p className="text-[10px] text-slate-500">Doctor reception desks</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <Scissors className="w-6 h-6 text-[#4C1D95] mx-auto" />
              <p className="text-xs font-black text-slate-900 dark:text-white">Salons & Spas</p>
              <p className="text-[10px] text-slate-500">Stylist mirror stations</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <ShoppingBag className="w-6 h-6 text-[#4C1D95] mx-auto" />
              <p className="text-xs font-black text-slate-900 dark:text-white">Retail & Boutiques</p>
              <p className="text-[10px] text-slate-500">Checkout POS counters</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <Building2 className="w-6 h-6 text-[#4C1D95] mx-auto" />
              <p className="text-xs font-black text-slate-900 dark:text-white">Hotels & Resorts</p>
              <p className="text-[10px] text-slate-500">Front desk & lobby kiosks</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          BOTTOM CTA
          ========================================== */}
      <section className="py-16 bg-[#4C1D95] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <MastQrLogo size="lg" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Dominate Google Reviews in Your City?
          </h2>
          <p className="text-sm text-purple-100 max-w-xl mx-auto">
            Order your custom acrylic standee today. Guaranteed doorstep delivery across India or instant PDF download.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/checkout?plan=STANDARD"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm rounded-2xl shadow-xl transition-all"
            >
              Order Acrylic Standee Now (₹1,499)
            </Link>
            <button
              type="button"
              onClick={onOpenTracker}
              className="px-6 py-4 bg-purple-900/60 hover:bg-purple-900 border border-purple-400/40 text-purple-200 hover:text-white text-xs font-bold rounded-2xl transition-all"
            >
              Track Existing Order
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
