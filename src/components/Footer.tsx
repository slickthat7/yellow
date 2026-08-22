import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, Star, Mail, Phone, Lock } from 'lucide-react';
import { MastQrLogo } from './MastQrLogo.js';

interface FooterProps {
  onOpenTracker?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTracker }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
              <MastQrLogo size="md" variant="horizontal" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier smart Google Review collection platform. Turn every walk-in customer into a verified 5-star Google review while filtering private feedback safely.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Over 50,000+ Reviews Generated</span>
            </div>
          </div>

          {/* Standees & Plans */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Standees & Plans</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/checkout?plan=BASIC" className="hover:text-amber-400 transition-colors">
                  Basic Digital Starter (Instant PDF) - ₹499
                </Link>
              </li>
              <li>
                <Link to="/checkout?plan=STANDARD" className="hover:text-amber-400 transition-colors">
                  Standard Acrylic Standee + Dashboard - ₹1,499
                </Link>
              </li>
              <li>
                <Link to="/checkout?plan=PRO" className="hover:text-amber-400 transition-colors">
                  Pro NFC Tap + Acrylic Standee - ₹2,999
                </Link>
              </li>
              <li>
                <Link to="/r/mast-demo" target="_blank" className="hover:text-purple-400 transition-colors flex items-center gap-1">
                  <span>Live Smart QR Demo</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Customer Support</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenTracker}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Track Courier Shipment</span>
                </button>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Client Dashboard Login
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Email: fulfillment@mastqr.com</span>
              </li>
              <li>
                <span className="text-slate-500">Support Hours: Mon-Sat 9AM - 8PM IST</span>
              </li>
            </ul>
          </div>

          {/* Razorpay & Security Guarantee */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Security & Guarantee</h5>
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Razorpay Payment</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Production-grade server-side verification. UPI, Credit/Debit Cards, NetBanking supported.
              </p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Replacement Guarantee on Transit Damage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MAST QR Inc. All rights reserved. SCAN • RATE • IMPROVE • GROW.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <span>Made for Indian Businesses with</span>
              <span className="text-red-500">❤️</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
