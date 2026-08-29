import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  ShoppingBag,
  Truck,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { MAST_PLANS } from '../data/plans.js';
import { MastQrLogo } from '../components/MastQrLogo.js';

export const PlansPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('STANDARD');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white py-16 lg:py-20 relative overflow-hidden text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300">
            One-Time Investment • Zero Monthly Subscriptions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Plans & Acrylic Standee Formats
          </h1>
          <p className="text-sm sm:text-base text-purple-100 max-w-2xl mx-auto">
            Choose the package that fits your business. All physical plans include free pan-India courier shipping, laser-crafted acrylic standees, and lifetime smart review routing.
          </p>
        </div>
      </section>

      {/* Main Pricing Cards */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
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
                  <div className="mb-6">
                    <h3 className="text-2xl font-black">{plan.name}</h3>
                    <p
                      className={`text-xs mt-1 ${
                        isRecommended ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

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

                <div>
                  <Link
                    to={`/checkout?plan=${plan.id}`}
                    className={`w-full py-4 px-4 rounded-2xl font-black text-sm text-center transition-all flex items-center justify-center gap-2 shadow-md ${
                      isRecommended
                        ? 'bg-amber-400 hover:bg-amber-300 text-purple-950 hover:shadow-xl'
                        : 'bg-[#4C1D95] hover:bg-[#3B0764] text-white hover:shadow-xl'
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

        {/* Standee Specs Comparison Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Detailed Feature & Spec Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-black tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4">Feature / Specification</th>
                  <th className="p-4">Basic Digital (₹499)</th>
                  <th className="p-4 bg-purple-50 dark:bg-purple-950/50 text-[#4C1D95] dark:text-purple-300">
                    Standard Acrylic (₹1,499)
                  </th>
                  <th className="p-4">Pro NFC Standee (₹2,999)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-4 font-bold">Physical Standee Shipped</td>
                  <td className="p-4 text-slate-400">No (Digital PDF)</td>
                  <td className="p-4 bg-purple-50/50 dark:bg-purple-950/20 font-bold text-emerald-600">
                    1x 5×7" Gloss Acrylic
                  </td>
                  <td className="p-4 font-bold text-emerald-600">1x 5×7" Dual NFC + Acrylic</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">NFC Tap-to-Review Chip</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4 bg-purple-50/50 dark:bg-purple-950/20 text-slate-400">—</td>
                  <td className="p-4 font-bold text-emerald-600">Embedded NTAG213 Chip</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Smart 5-Star Review Filtering</td>
                  <td className="p-4 text-emerald-600 font-bold">Included</td>
                  <td className="p-4 bg-purple-50/50 dark:bg-purple-950/20 text-emerald-600 font-bold">
                    Included
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Pan-India Express Delivery</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4 bg-purple-50/50 dark:bg-purple-950/20 text-emerald-600 font-bold">
                    Free (7 Days)
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">Free (7 Days)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Dynamic URL Redirection</td>
                  <td className="p-4 text-slate-400">Static link</td>
                  <td className="p-4 bg-purple-50/50 dark:bg-purple-950/20 text-emerald-600 font-bold">
                    Lifetime Dynamic Link
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">Lifetime Dynamic Link</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Private Feedback Manager Inbox</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4 bg-purple-50/50 dark:bg-purple-950/20 text-emerald-600 font-bold">
                    Included
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom Guarantee Banner */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center shrink-0 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black">100% Transit Replacement Guarantee</h4>
              <p className="text-xs text-slate-400">
                If your standee arrives scratched or damaged in transit, we dispatch a replacement immediately for free.
              </p>
            </div>
          </div>

          <Link
            to="/checkout?plan=STANDARD"
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs rounded-xl shrink-0"
          >
            Order Standee (₹1,499)
          </Link>
        </div>
      </section>
    </div>
  );
};
