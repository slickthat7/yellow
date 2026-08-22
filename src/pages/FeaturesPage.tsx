import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  TrendingUp,
  Truck,
  Smartphone,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Eye,
  BarChart3,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { MastQrLogo } from '../components/MastQrLogo.js';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-300">
              Technology & Hardware Deep Dive
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto">
            Engineered to Make Your Business the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
              #1 Ranked Local Spot
            </span>
          </h1>

          <p className="text-base sm:text-lg text-purple-100 max-w-2xl mx-auto">
            Explore the smart routing logic, premium UV acrylic hardware, and real-time dashboard that give you an unfair advantage on Google Maps.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/checkout?plan=STANDARD"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm rounded-2xl shadow-xl transition-all flex items-center gap-2"
            >
              <span>Order Acrylic Standee (₹1,499)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/demo"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md transition-all"
            >
              Try Interactive Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Core Pillar 1: Smart Routing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center font-black">
              <Star className="w-6 h-6 fill-purple-600 text-purple-600" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
              Smart Review Gatekeeper
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Filter Negative Ratings Before They Reach Google Maps
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When customers scan your counter standee, they rate their visit with 1 to 5 stars. Happy customers (4–5★) are instantly forwarded to your Google Review page. Customers who had an issue (1–3★) are presented with a private feedback form that alerts you directly.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Protects your Google Maps rating from spur-of-the-moment 1-star complaints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Captures constructive customer feedback directly to management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Maximizes high-converting public reviews to boost local SEO</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  4 - 5 Stars Tapped
                </span>
              </div>
              <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full">
                Auto-Redirect to Google
              </span>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 text-slate-300" />
                  <Star className="w-4 h-4 text-slate-300" />
                  <Star className="w-4 h-4 text-slate-300" />
                </div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  1 - 3 Stars Tapped
                </span>
              </div>
              <span className="text-[11px] font-black uppercase text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-1 rounded-full">
                Private Manager Inbox
              </span>
            </div>
          </div>
        </div>

        {/* Core Pillar 2: Premium Hardware */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-gradient-to-br from-purple-950 to-indigo-950 text-white p-8 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Commercial Grade Quality</span>
            </div>
            <h3 className="text-xl font-black">3mm Cast Acrylic with Diamond Polished Bevels</h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Standard paper printouts look cheap and curl over time. MAST QR standees are manufactured using 3mm high-density acrylic sheet, precision laser cut with rounded safety edges and coated with high-gloss scratch-resistant UV cured ink.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="font-bold text-amber-300">Waterproof</p>
                <p className="text-[11px] text-purple-200">Safe against cafe spills & wipes</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="font-bold text-amber-300">UV-Resistant</p>
                <p className="text-[11px] text-purple-200">Never fades under direct sunlight</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
              Hardware Precision
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Built to Stand on Countertops for Years
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every standee comes with a sturdy self-standing angled base designed specifically for POS billing counters, receptionist desks, cafe tables, and salon mirror stations.
            </p>
            <div className="pt-2">
              <Link
                to="/plans"
                className="inline-flex items-center gap-2 text-xs font-black text-[#4C1D95] dark:text-purple-400 hover:underline"
              >
                <span>View Standee Formats & Specs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Core Pillar 3: Dynamic Cloud URLs & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-black">
              <RefreshCw className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#4C1D95] dark:text-purple-400">
              Future Proof Cloud Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Never Reprint: Change Your Destination URL Anytime
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Static QR codes become worthless if you change your Google Place ID or move store locations. With MAST QR's dynamic routing engine, your physical acrylic standee stays permanent while you can redirect the URL in 1-click from your dashboard.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Live scan analytics: Count customer reviews by day, week, and month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>One-click Google Place ID synchronization</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                Live Scan Telemetry
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Active 24/7
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-2xl font-black text-[#4C1D95] dark:text-purple-300">1,248</p>
                <p className="text-[10px] font-bold text-slate-500">Total Scans</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
                <p className="text-2xl font-black text-amber-600">1,192</p>
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300">5★ Google Boosts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#4C1D95] text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <MastQrLogo size="md" />
          <h2 className="text-3xl font-black">Ready to Upgrade Your Storefront?</h2>
          <p className="text-sm text-purple-200 max-w-xl mx-auto">
            Order your customized acrylic standee today with free delivery anywhere in India.
          </p>
          <div className="pt-2">
            <Link
              to="/checkout?plan=STANDARD"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm rounded-2xl shadow-xl inline-block"
            >
              Order Standee (₹1,499)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
