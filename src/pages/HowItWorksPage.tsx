import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Truck,
  Sparkles,
  Smartphone,
  Star,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Store,
  Layers,
} from 'lucide-react';
import { MastQrLogo } from '../components/MastQrLogo.js';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white py-16 lg:py-20 relative overflow-hidden text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300">
            Step-By-Step Operational Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            How MAST QR Transforms Walk-Ins Into 5-Star Reviews
          </h1>
          <p className="text-sm sm:text-base text-purple-100 max-w-2xl mx-auto">
            From checkout customizer to doorstep courier and counter placement, see exactly how your business collects verified ratings every single day.
          </p>
        </div>
      </section>

      {/* 4 Detailed Process Steps */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Step 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 bg-purple-50 dark:bg-purple-950/40 p-6 rounded-2xl border border-purple-200 dark:border-purple-800 text-center space-y-3">
            <div className="w-14 h-14 bg-[#4C1D95] text-amber-300 rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
              01
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Customization & Order</h4>
            <p className="text-xs text-slate-500">Takes less than 60 seconds</p>
          </div>
          <div className="md:col-span-8 space-y-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              1. Choose Your Plan & Input Your Business Name
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Select between Digital Starter (₹499), Standard Acrylic Standee (₹1,499), or Pro NFC Standee (₹2,999). Enter your business name, tagline, and Google Place ID / review link. Our live 3D preview displays exactly how your finished standee will look before you pay.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 bg-amber-50 dark:bg-amber-950/40 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 text-center space-y-3">
            <div className="w-14 h-14 bg-amber-400 text-purple-950 rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
              02
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Precision UV Manufacturing</h4>
            <p className="text-xs text-slate-500">3-5 days delivery in India</p>
          </div>
          <div className="md:col-span-8 space-y-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              2. Laser Cut Acrylic UV Printing & Dispatch
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our specialized print facility laser cuts your 3mm cast acrylic standee, UV cures high-density waterproof ink, and runs a comprehensive quality check. You receive automated WhatsApp tracking with AWB numbers from Delhivery or BlueDart.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 bg-purple-50 dark:bg-purple-950/40 p-6 rounded-2xl border border-purple-200 dark:border-purple-800 text-center space-y-3">
            <div className="w-14 h-14 bg-purple-700 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
              03
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Counter Placement</h4>
            <p className="text-xs text-slate-500">Unbox and place immediately</p>
          </div>
          <div className="md:col-span-8 space-y-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              3. Unbox & Place on Your Counter or Table
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              No batteries, no WiFi setup, and no wiring required! Place the self-standing acrylic display near your billing counter, receptionist desk, or dining tables. Customers easily scan it with standard iOS/Android cameras.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
              04
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Automated Review Growth</h4>
            <p className="text-xs text-slate-500">24/7 Smart Filtering</p>
          </div>
          <div className="md:col-span-8 space-y-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              4. Watch Your Google Rating & Footfall Surge
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Happy customers rate 4-5 stars and are forwarded to your official Google Review page. Unhappy customers rate 1-3 stars and their comments are routed privately to your inbox so you can resolve issues without damaging your public reputation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#4C1D95] text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-black">Get Your Custom Standee Delivered This Week</h2>
          <p className="text-sm text-purple-200 max-w-xl mx-auto">
            Join hundreds of retail stores, cafes, doctors, and salons using MAST QR to dominate local Google search.
          </p>
          <div className="pt-2">
            <Link
              to="/checkout?plan=STANDARD"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm rounded-2xl shadow-xl inline-block"
            >
              Order Acrylic Standee Now (₹1,499)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
