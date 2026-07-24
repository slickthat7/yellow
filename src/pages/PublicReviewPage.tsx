import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Copy, Check, ExternalLink, ShieldCheck, HeartHandshake, AlertCircle, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Yellow360Logo } from '../components/Yellow360Logo';

interface PublicOrgData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor: string;
  googlePlaceId?: string | null;
  googleReviewUrl?: string | null;
}

export const PublicReviewPage: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();

  const [org, setOrg] = useState<PublicOrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submitted Branch & Redirect State
  const [submittedBranch, setSubmittedBranch] = useState<'GOOGLE_REDIRECT' | 'PRIVATE_FEEDBACK' | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [autoRedirectStarted, setAutoRedirectStarted] = useState(false);

  const calculateTargetUrl = (data: PublicOrgData): string => {
    if (data.googleReviewUrl && data.googleReviewUrl.trim()) {
      return data.googleReviewUrl.trim();
    }
    if (data.googlePlaceId && data.googlePlaceId.trim()) {
      const pid = data.googlePlaceId.trim();
      if (pid.startsWith('http://') || pid.startsWith('https://')) {
        return pid;
      }
      return `https://search.google.com/local/writereview?placeid=${pid}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(data.name + ' reviews')}`;
  };

  useEffect(() => {
    if (!brandSlug) return;
    setLoading(true);
    setError(null);

    fetch(`/api/public/org/${brandSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Organization not found');
        return res.json();
      })
      .then((data: PublicOrgData) => {
        setOrg(data);
        setRedirectUrl(calculateTargetUrl(data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load organization review page');
        setLoading(false);
      });
  }, [brandSlug]);

  // Countdown timer effect for auto-redirect when rating > 3
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (submittedBranch === 'GOOGLE_REDIRECT' && autoRedirectStarted && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (submittedBranch === 'GOOGLE_REDIRECT' && autoRedirectStarted && countdown === 0) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
    return () => clearTimeout(timer);
  }, [submittedBranch, autoRedirectStarted, countdown, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/public/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgSlug: brandSlug,
          rating,
          commentText,
          customerName,
          customerContact,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      const targetBranch = data.branch;
      setSubmittedBranch(targetBranch);

      const isAbove3 = rating > 3;

      if (isAbove3 || targetBranch === 'GOOGLE_REDIRECT') {
        // 1. Auto-copy review text to clipboard
        if (commentText.trim()) {
          try {
            await navigator.clipboard.writeText(commentText.trim());
            setCopied(true);
          } catch (clipErr) {
            console.warn('Clipboard write failed:', clipErr);
          }
        }

        // 2. Set target URL dynamically
        const finalUrl = data.googleReviewUrl || (org ? calculateTargetUrl(org) : redirectUrl);
        if (finalUrl) setRedirectUrl(finalUrl);

        // 3. Initiate auto-redirect countdown
        setAutoRedirectStarted(true);
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyComment = () => {
    if (!commentText) return;
    navigator.clipboard.writeText(commentText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualRedirect = () => {
    if (commentText && !copied) {
      navigator.clipboard.writeText(commentText.trim());
      setCopied(true);
    }
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  const getRatingLabel = (num: number) => {
    switch (num) {
      case 1:
        return 'Terrible 😞';
      case 2:
        return 'Poor 😐';
      case 3:
        return 'Okay 🙂';
      case 4:
        return 'Good 😊';
      case 5:
        return 'Excellent! 🌟';
      default:
        return 'Select stars to rate';
    }
  };

  const primaryColor = org?.primaryColor || '#5B00FF';

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCE8] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#5B00FF] animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-[#5B00FF]">Loading Yellow 360 Flow...</p>
        </div>
      </div>
    );
  }

  // Error / 404 State
  if (error || !org) {
    return (
      <div className="min-h-screen bg-[#FEFCE8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border-2 border-slate-900 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Review Link Not Found</h2>
          <p className="text-xs text-slate-600">
            The requested feedback page <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-mono">/r/{brandSlug}</code> does not exist or has been modified.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-[#5B00FF] text-white font-black text-xs rounded-xl hover:bg-[#4C00C8] transition-colors shadow-md"
          >
            Return to Yellow 360 Home
          </Link>
        </div>
      </div>
    );
  }

  const activeStarRating = hoverRating || rating;

  return (
    <div className="min-h-screen bg-[#FEFCE8] flex flex-col justify-between p-4 sm:p-8 font-sans text-slate-900 selection:bg-[#5B00FF] selection:text-white">
      {/* Top Header with Yellow 360 Badge */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pb-6">
        <Yellow360Logo size="sm" variant="purple" />
        <div className="px-3 py-1 bg-[#FACC15] border-2 border-slate-900 rounded-full shadow-2xs flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#5B00FF] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[#5B00FF]">Verified Feedback</span>
        </div>
      </header>

      {/* Main Card with Pop Framing */}
      <div className="max-w-md w-full mx-auto my-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(91,0,255,1)] border-2 border-slate-900 overflow-hidden relative"
        >
          {/* Top Primary Color Bar */}
          <div className="h-3 w-full" style={{ backgroundColor: primaryColor }} />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Business Logo & Name */}
            <div className="text-center space-y-3">
              {org.logoUrl ? (
                <div className="inline-block p-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                  <img
                    src={org.logoUrl}
                    alt={org.name}
                    className="h-14 max-w-[180px] object-contain mx-auto"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md border-2 border-slate-900"
                  style={{ backgroundColor: primaryColor }}
                >
                  {org.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{org.name}</h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">We value your opinion. How was your experience?</p>
              </div>
            </div>

            {/* FORM VIEW (Before Submission) */}
            {!submittedBranch ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 5-Star Selector */}
                <div className="text-center space-y-3 bg-[#FEFCE8] p-5 rounded-2xl border-2 border-slate-900">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#5B00FF] block">
                    Tap a star to rate
                  </label>

                  <div className="flex items-center justify-center space-x-2 py-1">
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const isActive = starIndex <= activeStarRating;
                      return (
                        <button
                          key={starIndex}
                          type="button"
                          onMouseEnter={() => setHoverRating(starIndex)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starIndex)}
                          className="p-1 focus:outline-none transition-transform transform hover:scale-125 active:scale-95"
                          aria-label={`Rate ${starIndex} stars`}
                        >
                          <Star
                            className={`w-9 h-9 transition-colors ${
                              isActive
                                ? 'fill-[#FBBC04] text-[#FBBC04] drop-shadow-xs'
                                : 'text-slate-200 fill-slate-100'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p
                    className={`text-xs font-black uppercase tracking-wider transition-all ${
                      activeStarRating > 0 ? 'text-[#5B00FF]' : 'text-slate-400'
                    }`}
                  >
                    {getRatingLabel(activeStarRating)}
                  </p>
                </div>

                {/* Comment Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Your Review <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tell us about your visit..."
                    className="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B00FF] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Customer Contact Info */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Your Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B00FF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Email or Phone <span className="text-slate-400 font-normal lowercase">(optional for follow-up)</span>
                    </label>
                    <input
                      type="text"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B00FF] outline-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full py-4 px-6 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            ) : (
              /* BRANCHING SUCCESS SCREENS */
              <AnimatePresence mode="wait">
                {submittedBranch === 'GOOGLE_REDIRECT' || rating > 3 ? (
                  /* HIGH RATING (> 3 STARS) SCREEN WITH AUTO REDIRECT */
                  <motion.div
                    key="high-rating-redirect"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5 text-center"
                  >
                    <div className="w-16 h-16 bg-[#FACC15] text-[#5B00FF] rounded-2xl flex items-center justify-center mx-auto border-2 border-slate-900 shadow-sm">
                      <Star className="w-9 h-9 fill-[#FBBC04] text-[#FBBC04]" />
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Thank you so much!</h2>
                      <p className="text-xs text-slate-600">
                        We are thrilled you had a great visit at <strong className="text-slate-900">{org.name}</strong>.
                      </p>
                    </div>

                    {/* Auto-Redirect Alert Card */}
                    <div className="bg-purple-50 border-2 border-[#5B00FF] rounded-2xl p-4 space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#5B00FF] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Auto Redirecting to Google
                        </span>
                        <span className="px-2 py-0.5 bg-[#5B00FF] text-[#FACC15] text-[10px] font-black rounded-full">
                          {countdown}s
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        Redirecting you to Google Reviews now so you can share your rating publicly.
                      </p>
                    </div>

                    {/* Review text clipboard box */}
                    {commentText ? (
                      <div className="bg-[#FEFCE8] border-2 border-slate-900 rounded-2xl p-4 text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#5B00FF]">
                            Your Review
                          </label>
                          <button
                            onClick={handleCopyComment}
                            className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 bg-white border border-slate-900 rounded-lg text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-700" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-900 italic leading-relaxed">"{commentText}"</p>
                        {copied && (
                          <p className="text-[10px] font-black text-emerald-600">
                            ✓ Copied to clipboard! Paste on Google.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 flex items-center justify-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Rating saved securely in Yellow 360</span>
                      </div>
                    )}

                    {/* Direct Button */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleManualRedirect}
                        className="flex items-center justify-center space-x-2 w-full py-4 px-6 bg-[#5B00FF] hover:bg-[#4C00C8] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] transition-all"
                      >
                        <span>Open Google Review Page Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* LOW RATING (1-3 STARS) PRIVATE FEEDBACK SCREEN */
                  <motion.div
                    key="low-rating-private"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border-2 border-slate-900 shadow-sm">
                      <HeartHandshake className="w-9 h-9" />
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Thank you, we hear you!</h2>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                        Your feedback has been saved securely and sent directly to management.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 text-xs text-slate-700 text-left space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#5B00FF] block">
                        Internal Follow-Up Promise
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        We take every piece of feedback seriously to improve our service. If you left contact information, a manager will review your notes shortly.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center pt-6 pb-2 text-[10px] font-black tracking-widest uppercase text-slate-500 flex items-center justify-center space-x-1">
        <span>Powered by</span>
        <Yellow360Logo size="sm" variant="purple" />
      </footer>
    </div>
  );
};
