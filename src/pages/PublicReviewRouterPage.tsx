import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { MastQrLogo } from '../components/MastQrLogo.js';

interface OrgPublicData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  googleReviewUrl?: string;
}

export const PublicReviewRouterPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [org, setOrg] = useState<OrgPublicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rating State
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Private Feedback Form State
  const [commentText, setCommentText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Redirect State for 4-5 Stars
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(2);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/public/org/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Standee QR or business not found');
        return res.json();
      })
      .then((data) => {
        setOrg(data);
      })
      .catch((err) => {
        setError(err.message || 'Could not load business details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  // Handle rating selection
  const handleRatingClick = async (rating: number) => {
    setSelectedRating(rating);
    if (!org) return;

    try {
      const res = await fetch('/api/public/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgSlug: org.slug,
          rating,
        }),
      });

      const data = await res.json();

      if (rating >= 4 && data.googleReviewUrl) {
        setRedirectUrl(data.googleReviewUrl);

        // Immediate automatic redirection
        const timer = setTimeout(() => {
          window.location.href = data.googleReviewUrl;
        }, 1500);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error('Error submitting rating:', e);
    }
  };

  // Submit negative feedback form
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || selectedRating === null) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgSlug: org.slug,
          rating: selectedRating,
          commentText,
          customerName,
          customerContact,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      setFeedbackSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Connecting to standee...</p>
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-sm space-y-4 shadow-xl">
          <MastQrLogo size="md" />
          <p className="text-sm font-bold text-slate-700">{error || 'Business QR not found'}</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-[#4C1D95] text-white text-xs font-bold rounded-xl"
          >
            Go to MAST QR
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto my-auto py-8">
        {/* Brand Container Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 text-center space-y-6 relative overflow-hidden">
          {/* Top Decorative Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-purple-800 via-amber-400 to-purple-800" />

          {/* Business Logo & Name */}
          <div className="space-y-3 pt-2">
            {org.logoUrl && (
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                <img
                  src={org.logoUrl}
                  alt={org.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                {org.name}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                How was your experience today?
              </p>
            </div>
          </div>

          {/* STATE 1: High Rating (4-5★) - Redirecting to Google */}
          {selectedRating && selectedRating >= 4 ? (
            <div className="py-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8 fill-amber-400 text-amber-500 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">
                  Thank You for the {selectedRating}★ Rating!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Redirecting you directly to our official Google Review page to share your thoughts...
                </p>
              </div>

              {redirectUrl && (
                <div className="pt-2">
                  <a
                    href={redirectUrl}
                    className="w-full py-3.5 px-6 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Click Here if Not Redirected</span>
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                  </a>
                </div>
              )}
            </div>
          ) : selectedRating && selectedRating <= 3 ? (
            /* STATE 2: Low Rating (1-3★) - Private Internal Feedback Form */
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              {feedbackSubmitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Thank You for Your Valuable Feedback!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    Your message has been sent directly to the store manager. We are committed to making your next visit exceptional.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <p className="text-xs font-bold text-amber-900">
                      We're sorry we fell short. How can we improve?
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Comments / Suggestions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell the management what went wrong so we can fix it immediately..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Rohan"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Phone or Email (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98765..."
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="w-full py-3 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Send Private Feedback to Manager'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STATE 0: Initial Rating Stars (1 to 5) */
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || 0) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRatingClick(star)}
                      className="p-1 sm:p-2 transition-transform hover:scale-125 focus:outline-hidden"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                            : 'fill-slate-100 text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tap a star to rate your visit
              </p>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Powered by MAST QR Verified Standee</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center py-2">
        <Link to="/" className="inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          <MastQrLogo size="sm" variant="mark" />
          <span className="text-[10px] font-black text-slate-600 tracking-wider">MAST QR</span>
        </Link>
      </div>
    </div>
  );
};
