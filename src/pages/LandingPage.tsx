import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Star,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Zap,
  ChevronRight,
  ShieldAlert,
  Users,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Yellow360Logo } from '../components/Yellow360Logo';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FEFCE8] text-slate-900 font-sans selection:bg-[#5B00FF] selection:text-white">
      {/* Top Navbar in Yellow 360 Style */}
      <nav className="border-b border-purple-900/10 bg-[#FEFCE8]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Yellow360Logo size="md" variant="purple" />
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2.5 text-xs font-black text-[#5B00FF] hover:bg-purple-100/60 rounded-full transition-colors border border-purple-900/10"
            >
              Sign In
            </Link>
            <Link
              to="/admin"
              className="px-5 py-2.5 text-xs font-black bg-[#5B00FF] hover:bg-[#4C00C8] text-white rounded-full shadow-md shadow-purple-900/20 transition-all border border-purple-900/20"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section in Yellow 360 Aesthetic */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Floating Creative Badge Pills inspired by Yellow 360 UI */}
        <div className="hidden md:block absolute top-12 left-10 transform -rotate-12 bg-[#5B00FF] text-[#FACC15] px-4 py-1.5 rounded-full font-black text-xs shadow-lg border-2 border-slate-900">
          ★ Timeless
        </div>
        <div className="hidden md:block absolute top-20 right-16 transform rotate-12 bg-[#FACC15] text-[#5B00FF] px-4 py-1.5 rounded-full font-black text-xs shadow-lg border-2 border-slate-900">
          ⚡ Edgy & Automated
        </div>
        <div className="hidden md:block absolute bottom-16 right-32 transform -rotate-6 bg-[#5B00FF] text-white px-4 py-1.5 rounded-full font-black text-xs shadow-lg border-2 border-slate-900">
          🎯 Creative Flow
        </div>

        <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#FACC15] text-[#5B00FF] border-2 border-slate-900 font-black text-xs uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-[#5B00FF]" />
            <span>Yellow 360 Reputation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#5B00FF] tracking-tight leading-none uppercase">
            Because 'review maang liya' <br />
            <span className="text-slate-900 underline decoration-[#FACC15] decoration-wavy decoration-4">
              is not marketing!
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-800 font-medium max-w-2xl mx-auto leading-relaxed">
            Yellow 360 converts everyday happy clients into glowing 5-star Google reviews. Ratings above 3 stars are automatically copied to clipboard and routed to Google, while private feedback shields your public score.
          </p>

          {/* Call To Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/admin"
              className="px-8 py-4 bg-[#FACC15] hover:bg-yellow-400 text-slate-900 border-2 border-slate-900 font-black text-sm rounded-2xl shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] transition-all flex items-center space-x-2"
            >
              <span>Inquire & Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/r/yellow-360"
              target="_blank"
              className="px-8 py-4 bg-[#5B00FF] hover:bg-[#4C00C8] text-white border-2 border-slate-900 font-black text-sm rounded-2xl shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] transition-all flex items-center space-x-2"
            >
              <span>Try Demo Client Flow (/r/yellow-360)</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Yellow 360 Central Interactive Feature Card */}
        <div className="mt-14 max-w-3xl mx-auto bg-white border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(91,0,255,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#FACC15] text-[#5B00FF] rounded-2xl border-2 border-slate-900 flex items-center justify-center font-black text-xl">
                Y360
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">Custom Google Review URL Routing</h3>
                <p className="text-xs text-slate-600 font-medium">Each business sets their own unique Google Review Place ID</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#5B00FF] text-[#FACC15] font-black text-[10px] rounded-full uppercase tracking-wider">
              Multi-Tenant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#FEFCE8] border-2 border-slate-900 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#5B00FF] tracking-widest block">
                ★ ★ ★ ★ ★ High Rating (&gt; 3 Stars)
              </span>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                Review text auto-copied to clipboard + instant auto-redirect to your business's Google Review page.
              </p>
            </div>

            <div className="bg-purple-50 border-2 border-slate-900 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#5B00FF] tracking-widest block">
                ★ ★ ★ Private Feedback (&le; 3 Stars)
              </span>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                Routed privately to internal dashboard for management follow-up, shielding public Google scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Loaded Demo Organizations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-l-4 border-[#5B00FF] pl-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Client Demo Flows</h2>
              <p className="text-xs font-black uppercase tracking-wider text-[#5B00FF]">
                Experience customized brand review interfaces
              </p>
            </div>
            <Link
              to="/admin"
              className="text-xs font-black text-[#5B00FF] hover:underline flex items-center gap-1"
            >
              <span>Manage Brands in Admin</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/r/yellow-360"
              target="_blank"
              className="bg-white border-2 border-slate-900 p-6 rounded-2xl space-y-3 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-full bg-[#FACC15] border border-slate-900" />
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#5B00FF] transition-colors" />
              </div>
              <h3 className="font-black text-slate-900 text-lg group-hover:text-[#5B00FF] transition-colors">
                Yellow 360
              </h3>
              <p className="text-xs font-mono font-bold text-[#5B00FF]">/r/yellow-360</p>
              <p className="text-xs text-slate-600 font-medium">Yellow 360 Google Review Backlink</p>
            </Link>

            <Link
              to="/r/apex-dental"
              target="_blank"
              className="bg-white border-2 border-slate-900 p-6 rounded-2xl space-y-3 shadow-[4px_4px_0px_0px_rgba(91,0,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-full bg-[#5B00FF]" />
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#5B00FF] transition-colors" />
              </div>
              <h3 className="font-black text-slate-900 text-lg group-hover:text-[#5B00FF] transition-colors">
                Apex Dental Studio
              </h3>
              <p className="text-xs font-mono font-bold text-slate-500">/r/apex-dental</p>
              <p className="text-xs text-slate-600 font-medium">Royal Blue theme • Healthcare flow</p>
            </Link>

            <Link
              to="/r/gourmet-bistro"
              target="_blank"
              className="bg-white border-2 border-slate-900 p-6 rounded-2xl space-y-3 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-full bg-red-600" />
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
              </div>
              <h3 className="font-black text-slate-900 text-lg group-hover:text-red-600 transition-colors">
                Gourmet Bistro & Grill
              </h3>
              <p className="text-xs font-mono font-bold text-slate-500">/r/gourmet-bistro</p>
              <p className="text-xs text-slate-600 font-medium">Deep Red theme • Restaurant flow</p>
            </Link>

            <Link
              to="/r/urban-auto"
              target="_blank"
              className="bg-white border-2 border-slate-900 p-6 rounded-2xl space-y-3 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded-full bg-emerald-600" />
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h3 className="font-black text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
                Urban Auto Care
              </h3>
              <p className="text-xs font-mono font-bold text-slate-500">/r/urban-auto</p>
              <p className="text-xs text-slate-600 font-medium">Emerald theme • Automotive flow</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Compliance & Security Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#5B00FF] border-2 border-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FACC15] text-[#5B00FF] flex items-center justify-center font-black flex-shrink-0 border border-slate-900">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[#FACC15] uppercase tracking-wider">100% Policy Compliant</h4>
              <p className="text-xs text-purple-100">
                User-initiated Google review redirect with clipboard auto-copy. No automated spam or policy violations.
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="px-5 py-2.5 bg-[#FACC15] text-slate-900 font-black text-xs rounded-xl shadow-xs hover:bg-yellow-400 transition-all flex-shrink-0"
          >
            Access Admin Portal
          </Link>
        </div>
      </section>

      {/* Yellow 360 Footer */}
      <footer className="border-t border-purple-900/10 py-10 text-center bg-[#FAF8EE]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4">
          <Yellow360Logo size="sm" variant="purple" />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Yellow 360 Review Management • Multi-Tenant Enterprise Engine
          </p>
        </div>
      </footer>
    </div>
  );
};
