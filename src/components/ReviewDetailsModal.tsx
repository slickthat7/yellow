import React, { useState } from 'react';
import { X, Star, AlertTriangle, CheckCircle, Clock, Save, User, Mail, Phone, Building } from 'lucide-react';
import { Review, ReviewStatus } from '../types/index.js';

interface ReviewDetailsModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: ReviewStatus, notes: string) => Promise<void>;
}

export const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  review,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!isOpen || !review) return null;

  const [status, setStatus] = useState<ReviewStatus>(review.status);
  const [internalNotes, setInternalNotes] = useState(review.internalNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isLowRating = review.rating < 4;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(review.id, status, internalNotes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update review:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">Review Details</span>
            {isLowRating && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs Follow-Up
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Rating Header */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium">Customer Score</p>
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="font-bold text-gray-900 text-lg ml-2">{review.rating} / 5</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Submitted</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">
                {new Date(review.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Org Name if superadmin */}
          {review.orgName && (
            <div className="flex items-center space-x-2 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              <Building className="w-4 h-4 text-blue-600" />
              <span>
                Organization: <strong className="text-gray-900">{review.orgName}</strong>
              </span>
            </div>
          )}

          {/* Customer Feedback Comment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Customer Feedback
            </label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm italic leading-relaxed">
              {review.commentText ? `"${review.commentText}"` : 'No written text provided.'}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="space-y-1">
              <span className="text-gray-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Customer Name
              </span>
              <p className="font-semibold text-gray-800">
                {review.customerName || 'Anonymous User'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Contact Details
              </span>
              <p className="font-semibold text-gray-800 break-all">
                {review.customerContact || 'None provided'}
              </p>
            </div>
          </div>

          {/* Status & Notes Management */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Internal Workflow Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['NEW', 'IN_PROGRESS', 'RESOLVED'] as ReviewStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      status === s
                        ? s === 'RESOLVED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : s === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'NEW' && 'New'}
                    {s === 'IN_PROGRESS' && 'In Progress'}
                    {s === 'RESOLVED' && 'Resolved'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Internal Manager Notes
              </label>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Log internal follow-up actions, customer response notes, or root cause fixes..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {saveSuccess ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Updated successfully
                </span>
              ) : (
                'Changes saved to server DB'
              )}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
