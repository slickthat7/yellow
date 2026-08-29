import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, Star, Mail, Phone, Lock, HelpCircle, MessageSquare } from 'lucide-react';
import { MastQrLogo } from './MastQrLogo.js';

interface FooterProps {
  onOpenTracker?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTracker }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
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

          {/* Quick Navigation Pages */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Explore & Features</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/features" className="hover:text-amber-400 transition-colors">
                  Why MAST QR & Hardware Specs
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-amber-400 transition-colors">
                  Plans & Standee Formats
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-amber-400 transition-colors">
                  How It Works (Setup Guide)
                </Link>
              </li>
              <li>
                <Link to="/demo" className="hover:text-purple-400 transition-colors flex items-center gap-1 font-bold text-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Live Review Simulator Demo</span>
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-amber-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Order Standees & Tracking */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Orders & Support</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/track" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-bold text-purple-300">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Track Courier Shipment</span>
                </Link>
              </li>
              <li>
                <Link to="/checkout?plan=STANDARD" className="hover:text-amber-400 transition-colors">
                  Order Standard Acrylic Standee (₹1,499)
                </Link>
              </li>
              <li>
                <Link to="/checkout?plan=PRO" className="hover:text-amber-400 transition-colors">
                  Order Pro NFC Standee (₹2,999)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Merchant Support
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Client & Admin Dashboard Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Razorpay & Security Guarantee */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Security & Guarantee</h5>
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Razorpay Verified</span>
                </div>
                <a
                  href="https://razorpay.me/@yellow3609773"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60 hover:text-white hover:border-purple-600 transition-colors"
                >
                  @yellow3609773
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                UPI (GPay, PhonePe, Paytm, BHIM), Cards & NetBanking powered by Razorpay.
              </p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>100% Replacement Guarantee on Transit Damage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MAST QR Inc. All rights reserved. SCAN • RATE • IMPROVE • GROW.</p>
          <div className="flex items-center gap-4">
            <Link to="/faq" className="hover:text-slate-300">FAQ</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
            <span className="flex items-center gap-1 text-slate-400">
              <span>Made in India</span>
              <span className="text-red-500">❤️</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
