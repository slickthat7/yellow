import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Truck,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { MastQrLogo } from './MastQrLogo.js';

interface NavbarProps {
  onOpenTracker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTracker }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isCheckout = location.pathname.startsWith('/checkout');
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <MastQrLogo size="md" variant="horizontal" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-700">
            <Link
              to="/#features"
              className="hover:text-purple-700 transition-colors flex items-center gap-1"
            >
              <span>Why MAST QR</span>
            </Link>
            <Link
              to="/#pricing"
              className="hover:text-purple-700 transition-colors flex items-center gap-1"
            >
              <span>Plans & Standees</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 rounded-full">
                ₹499
              </span>
            </Link>
            <Link
              to="/#how-it-works"
              className="hover:text-purple-700 transition-colors"
            >
              How It Works
            </Link>

            <button
              type="button"
              onClick={onOpenTracker}
              className="hover:text-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-600"
            >
              <Truck className="w-4 h-4 text-purple-600" />
              <span>Track Order</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-purple-900 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-purple-50"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>Client Login</span>
            </Link>

            <Link
              to="/checkout?plan=STANDARD"
              className="px-5 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs sm:text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Order QR Standee</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-purple-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            to="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-slate-700 hover:text-purple-800"
          >
            Why MAST QR
          </Link>
          <Link
            to="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-slate-700 hover:text-purple-800"
          >
            Plans & Standees (from ₹499)
          </Link>
          <Link
            to="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-slate-700 hover:text-purple-800"
          >
            How It Works
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTracker?.();
            }}
            className="w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-purple-800 flex items-center gap-2"
          >
            <Truck className="w-4 h-4 text-purple-700" />
            <span>Track Order & Delivery Status</span>
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-4 text-center font-bold text-xs text-slate-700 border border-slate-300 rounded-xl"
            >
              Client / Admin Login
            </Link>
            <Link
              to="/checkout?plan=STANDARD"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 text-center font-black text-xs text-white bg-[#4C1D95] rounded-xl shadow-md"
            >
              Order QR Standee Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
