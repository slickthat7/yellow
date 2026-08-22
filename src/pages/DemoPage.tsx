import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Star,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { MastQrLogo } from '../components/MastQrLogo.js';

export const DemoPage: React.FC = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [demoFeedback, setDemoFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [managerInbox, setManagerInbox] = useState<Array<{ id: string; rating: number; text: string; time: string }>>([
    {
      id: '1',
      rating: 2,
      text: 'The cold brew took 15 mins to arrive today. Please speed up order queue.',
      time: '10 mins ago',
    },
  ]);

  const handleSelectStar = (rating: number) => {
    setSelectedRating(rating);
    setFeedbackSent(false);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoFeedback.trim() || selectedRating === null) return;

    const newEntry = {
      id: Date.now().toString(),
      rating: selectedRating,
      text: demoFeedback.trim(),
      time: 'Just now',
    };

    setManagerInbox([newEntry, ...managerInbox]);
    setFeedbackSent(true);
    setDemoFeedback('');
  };

  const handleReset = () => {
    setSelectedRating(null);
    setHoverRating(null);
    setFeedbackSent(false);
    setDemoFeedback('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white py-12 lg:py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300">
            Live Dual Simulator
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Try the Smart Review Filter in Action
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto">
            Test the live customer smartphone experience on the left and see how your private store manager inbox captures negative ratings in real time on the right.
          </p>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Col: Customer Smartphone Screen (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[#4C1D95] dark:text-purple-400">
                <Smartphone className="w-4 h-4" />
                <span>Customer Smartphone View</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-500 hover:text-purple-700 flex items-center gap-1 font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>

            {/* Mobile Device Mockup Frame */}
            <div className="max-w-sm mx-auto bg-slate-900 p-4 rounded-[40px] shadow-2xl border-4 border-slate-800">
              <div className="bg-white rounded-[32px] p-6 text-center space-y-5 min-h-[460px] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 mx-auto flex items-center justify-center font-black text-purple-900 text-base shadow-xs">
                    ☕
                  </div>
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                    The Royal Bistro
                  </h3>
                  <p className="text-xs text-slate-500">How was your coffee & dining experience today?</p>
                </div>

                {/* Rating State Handler */}
                {selectedRating === null && (
                  <div className="space-y-4 my-auto py-6">
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => handleSelectStar(star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-9 h-9 ${
                              (hoverRating || 0) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-100 text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tap a star to test
                    </p>
                  </div>
                )}

                {/* 4 or 5 Stars: Google Redirect Notice */}
                {selectedRating !== null && selectedRating >= 4 && (
                  <div className="space-y-4 my-auto py-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 fill-amber-400 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-base">
                        Thank you for the {selectedRating}★ Rating!
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        In live mode, happy customers are automatically forwarded in 1.5s to your official Google Review page!
                      </p>
                    </div>
                    <a
                      href="https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-[#4C1D95] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Proceed to Google Maps (Live)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    </a>
                  </div>
                )}

                {/* 1, 2, or 3 Stars: Private Manager Feedback Form */}
                {selectedRating !== null && selectedRating <= 3 && (
                  <div className="space-y-4 text-left my-auto animate-in fade-in duration-150">
                    {feedbackSent ? (
                      <div className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-slate-900 text-sm">
                          Feedback Sent Directly to Store Manager!
                        </h4>
                        <p className="text-xs text-slate-500">
                          Notice how Google Maps was never touched — your public rating remains 5.0!
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendFeedback} className="space-y-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
                          <p className="text-[11px] font-bold text-amber-900">
                            We're sorry! How can we make your next visit better?
                          </p>
                        </div>
                        <textarea
                          required
                          rows={2}
                          value={demoFeedback}
                          onChange={(e) => setDemoFeedback(e.target.value)}
                          placeholder="Tell management what went wrong..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Send Private Note to Manager
                        </button>
                      </form>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                  Powered by MAST QR Verified Standee
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Store Manager Dashboard Telemetry (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 dark:text-slate-300">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>Manager Private Feedback Inbox (Live)</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Intercepted Private Complaints</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-red-100 text-red-800">
                  {managerInbox.length} Complaints Blocked from Google
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                {managerInbox.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      "{item.text}"
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/checkout?plan=STANDARD"
                  className="w-full py-3.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <span>Order Your Standee & Get This System (₹1,499)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
