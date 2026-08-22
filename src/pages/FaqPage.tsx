import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { MastQrLogo } from '../components/MastQrLogo.js';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Hardware & Delivery',
    question: 'How long does delivery take within India?',
    answer: 'Standard Acrylic Standees are manufactured, UV printed, and dispatched within 24-48 hours. Express courier delivery takes 3 to 5 business days anywhere across India (Delhivery, BlueDart, or DTDC). You will receive SMS & WhatsApp tracking notifications.',
  },
  {
    category: 'Hardware & Delivery',
    question: 'What happens if the standee gets damaged during transit?',
    answer: 'We provide a 100% Free Replacement Guarantee. If your acrylic standee arrives cracked, scratched, or damaged, simply send a photo to our support team and we will dispatch a brand new replacement immediately with zero questions asked.',
  },
  {
    category: 'Technology & Google Reviews',
    question: 'How does the smart 5-star review filtering work?',
    answer: 'When a customer scans your standee with their phone, they see a rating screen. If they tap 4 or 5 stars, they are automatically forwarded to your official Google Maps Review page. If they tap 1, 2, or 3 stars, they are prompted to submit private feedback directly to your store manager inbox, saving your public Google score.',
  },
  {
    category: 'Technology & Google Reviews',
    question: 'Can I change my Google Review link or business details later?',
    answer: 'Yes! All MAST QR physical standees use dynamic cloud redirection. You can log into your Client Dashboard anytime to update your Google Place ID, store name, or destination URL without ever needing to reprint the acrylic standee.',
  },
  {
    category: 'Billing & Pricing',
    question: 'Are there any recurring monthly subscription fees?',
    answer: 'No! All MAST QR plans are one-time payments. Once purchased, your dynamic QR redirection, cloud review filtering, and standee hardware remain active for lifetime without hidden monthly charges.',
  },
  {
    category: 'NFC Technology',
    question: 'How does the Pro NFC Standee work?',
    answer: 'The Pro NFC standee contains an embedded NTAG213 high-frequency RFID microchip beneath the acrylic surface. Customers with NFC-enabled smartphones (iPhone and modern Android devices) can simply tap their phone against the standee to open the review page without opening their camera.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-300">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto">
            Everything you need to know about acrylic standees, delivery timelines, smart 5-star routing, and client dashboards.
          </p>
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 dark:text-white text-sm hover:text-purple-700 transition-colors"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-purple-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}

        {/* Support Callout */}
        <div className="mt-12 p-8 bg-purple-50 dark:bg-purple-950/40 rounded-3xl border border-purple-200 dark:border-purple-800 text-center space-y-4">
          <h3 className="font-black text-slate-900 dark:text-white text-lg">
            Have a custom bulk order or specific question?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Our merchant fulfillment team is on standby Mon-Sat 9AM - 8PM IST.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md"
            >
              Contact Support
            </Link>
            <Link
              to="/checkout?plan=STANDARD"
              className="px-6 py-3 bg-amber-400 text-purple-950 font-black text-xs rounded-xl shadow-md"
            >
              Order Standee (₹1,499)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
