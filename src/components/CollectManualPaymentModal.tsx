import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { Order, PaymentMethod } from '../types/index.js';

interface CollectManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentCollected: (updatedOrder: Order) => void;
}

export const CollectManualPaymentModal: React.FC<CollectManualPaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentCollected,
}) => {
  const [paymentMode, setPaymentMode] = useState<'MANUAL' | 'ONLINE_LINK'>('MANUAL');
  const [paymentMethod, setManualPaymentMethod] = useState<PaymentMethod>('MANUAL_CASH');
  const [manualPaymentRef, setManualPaymentRef] = useState('');
  const [manualPaymentCollector, setManualPaymentCollector] = useState('Superadmin Operations');
  const [manualPaymentNotes, setManualPaymentNotes] = useState('');
  const [amountCollected, setAmountCollected] = useState(order ? order.amount : 1499);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !order) return null;

  const onlinePaymentLink = `${window.location.origin}/checkout?plan=${order.plan}&order=${order.orderNumber}`;

  const handleCopyPaymentLink = () => {
    navigator.clipboard.writeText(onlinePaymentLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCollectManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/collect-manual-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          manualPaymentRef: manualPaymentRef.trim() || `MANUAL-${Date.now().toString().slice(-6)}`,
          manualPaymentCollector: manualPaymentCollector.trim(),
          manualPaymentNotes: manualPaymentNotes.trim(),
          amountCollected: Number(amountCollected),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      onPaymentCollected(data.order);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording offline payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-black text-base">Collect / Record Order Payment</h4>
              <p className="text-xs text-purple-200">
                {order.orderNumber} • {order.businessName} (₹{order.amount})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setPaymentMode('MANUAL')}
              className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                paymentMode === 'MANUAL'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Record Offline Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('ONLINE_LINK')}
              className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                paymentMode === 'ONLINE_LINK'
                  ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Send Online Pay Link</span>
            </button>
          </div>

          {paymentMode === 'MANUAL' ? (
            <form onSubmit={handleCollectManualPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Collected (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amountCollected}
                    onChange={(e) => setAmountCollected(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setManualPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="MANUAL_CASH">Cash in Hand</option>
                    <option value="MANUAL_UPI">Direct UPI Transfer</option>
                    <option value="MANUAL_BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                    <option value="MANUAL_POS">POS Card Swipe</option>
                    <option value="WAIVED">Waived / Complimentary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reference # (UTR / Cheque / Receipt)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-881920192 or CASH-STORE-1"
                  value={manualPaymentRef}
                  onChange={(e) => setManualPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Collector Name
                  </label>
                  <input
                    type="text"
                    value={manualPaymentCollector}
                    onChange={(e) => setManualPaymentCollector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received at front counter"
                    value={manualPaymentNotes}
                    onChange={(e) => setManualPaymentNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Recording...' : 'Confirm Paid (Manual)'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3">
                <span className="text-xs font-black text-purple-900 dark:text-purple-200 block">
                  Online Payment Checkout Link for Customer
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={onlinePaymentLink}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPaymentLink}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Send this link to <span className="font-bold text-slate-700 dark:text-slate-300">{order.customerEmail}</span> or on WhatsApp. When paid via Razorpay/UPI, the order will auto-update to PAID in real time.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
