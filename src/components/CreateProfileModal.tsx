import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  CreditCard,
  Barcode as BarcodeIcon,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Banknote,
  Smartphone,
  Landmark,
} from 'lucide-react';
import { PlanType, PaymentMethod, Organization, AdminUser, Order } from '../types/index.js';
import { MAST_PLANS } from '../data/plans.js';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: () => void;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
}) => {
  // Form State
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<PlanType>('STANDARD');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#581C87');
  const [customBarcode, setCustomBarcode] = useState('');
  const [customSku, setCustomSku] = useState('');

  // Shipping Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment Option State
  const [paymentOption, setPaymentOption] = useState<'MANUAL' | 'ONLINE' | 'NONE'>('MANUAL');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<PaymentMethod>('MANUAL_CASH');
  const [manualPaymentRef, setManualPaymentRef] = useState('');
  const [manualPaymentCollector, setManualPaymentCollector] = useState('Superadmin Operations Lead');
  const [manualPaymentNotes, setManualPaymentNotes] = useState('');

  // Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdResult, setCreatedResult] = useState<{
    org: Organization;
    adminUser: AdminUser;
    order: Order | null;
    loginCredentials: { email: string; temporaryPassword: string };
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAutoSlug = (name: string) => {
    setBusinessName(name);
    if (!slug || slug === businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      const generated = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setSlug(generated);
      if (!customBarcode) {
        setCustomBarcode(`MQ-BC-${Math.floor(100000 + Math.random() * 900000)}`);
      }
      if (!customSku) {
        setCustomSku(`SKU-${generated.toUpperCase().slice(0, 6) || 'MAST'}`);
      }
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!businessName.trim()) {
      setErrorMsg('Please enter a business or store name');
      return;
    }
    if (!ownerEmail.trim()) {
      setErrorMsg('Please enter the client account email');
      return;
    }
    if (!googleReviewUrl.trim()) {
      setErrorMsg('Please enter the Google Review or Place URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        businessName: businessName.trim(),
        slug: slug.trim() || undefined,
        ownerEmail: ownerEmail.trim(),
        ownerPassword: ownerPassword.trim() || undefined,
        ownerName: ownerName.trim() || undefined,
        phone: phone.trim() || undefined,
        plan,
        googleReviewUrl: googleReviewUrl.trim(),
        googlePlaceId: googlePlaceId.trim() || undefined,
        primaryColor,
        customBarcode: customBarcode.trim() || undefined,
        customSku: customSku.trim() || undefined,
        createOrder: paymentOption !== 'NONE',
        paymentOption,
        manualPaymentMethod,
        manualPaymentRef: manualPaymentRef.trim() || undefined,
        manualPaymentCollector: manualPaymentCollector.trim() || undefined,
        manualPaymentNotes: manualPaymentNotes.trim() || undefined,
        shippingAddress:
          street || city || pincode
            ? {
                fullName: ownerName.trim() || businessName.trim(),
                phone: phone.trim() || '+91 9081232224',
                street: street.trim(),
                city: city.trim() || 'Mumbai',
                state: state.trim() || 'Maharashtra',
                pincode: pincode.trim() || '400001',
                country: 'India',
              }
            : null,
      };

      const res = await fetch('/api/admin/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      setCreatedResult({
        org: data.org,
        adminUser: data.adminUser,
        order: data.order,
        loginCredentials: data.loginCredentials,
      });

      onProfileCreated();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating the profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanData = MAST_PLANS.find((p) => p.id === plan) || MAST_PLANS[1];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base">Backend Client Profile & Store Generator</h3>
              <p className="text-xs text-purple-200">
                Create brand storefront, assign custom barcode, and collect manual/online payment
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

        {/* Modal Body */}
        {createdResult ? (
          /* SUCCESS STATE */
          <div className="p-8 space-y-6">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                Client Profile Successfully Created!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                Storefront <span className="font-bold font-mono">/r/{createdResult.org.slug}</span> is live. Login credentials and barcode have been generated.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Client Dashboard Login Credentials
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Login Email</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {createdResult.loginCredentials.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdResult.loginCredentials.email, 'email')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                  >
                    {copiedKey === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Password</span>
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                      {createdResult.loginCredentials.temporaryPassword}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdResult.loginCredentials.temporaryPassword, 'pass')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                  >
                    {copiedKey === 'pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Standee & Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Barcode</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                  {createdResult.org.customBarcode || 'Auto-generated'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Ready for UV print standee base</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Payment Status</span>
                <span className="font-bold text-sm text-emerald-600">
                  {createdResult.order?.paymentStatus === 'COMPLETED' ? 'PAID (Manual Logged)' : 'Pending Online'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">₹{createdResult.order?.amount || selectedPlanData.price}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Order Reference</span>
                <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-sm">
                  {createdResult.order?.orderNumber || 'N/A'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Status: {createdResult.order?.orderStatus || 'ACTIVE'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <a
                href={`/r/${createdResult.org.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <span>View Live QR Review Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* SECTION 1: BUSINESS & ROUTING */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-900 dark:text-purple-400 tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>1. Storefront & Google Routing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Store / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blue Tokai Coffee Roasters"
                    value={businessName}
                    onChange={(e) => handleAutoSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Store Slug / QR URL
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700">
                      /r/
                    </span>
                    <input
                      type="text"
                      placeholder="blue-tokai"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-r-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Google Review URL or Place ID * (5-Star Redirect Target)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://search.google.com/local/writereview?placeid=... or ChIJ..."
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Can be updated anytime without changing the physical standee QR code.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: OWNER ACCOUNT & LOGIN */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-900 dark:text-purple-400 tracking-wider">
                <User className="w-4 h-4" />
                <span>2. Brand Owner Account & Login Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Email (Login ID) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@store.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password (Optional — defaults to <span className="font-mono text-purple-600">welcome@mastqr</span>)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for standard initial password or specify custom"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: PLAN & CUSTOM BARCODE */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-900 dark:text-purple-400 tracking-wider">
                <BarcodeIcon className="w-4 h-4" />
                <span>3. Hardware Plan & Custom Barcode / Standee SKU</span>
              </div>

              {/* Plan Selection Radio Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MAST_PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      plan === p.id
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    {plan === p.id && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                    <span className="font-black text-xs text-slate-900 dark:text-white block">{p.name}</span>
                    <span className="text-base font-black text-purple-700 dark:text-purple-300 block">₹{p.price}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">{p.standeeType}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Barcode / Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MQ-BC-908123"
                    value={customBarcode}
                    onChange={(e) => setCustomBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Printed as Code 128 on acrylic standee plate</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warehouse SKU / Batch Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-MAST-BLUETK"
                    value={customSku}
                    onChange={(e) => setCustomSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              {plan !== 'BASIC' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Physical Delivery Address (Courier Dispatch)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Shop / Building Address & Landmark"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City (e.g. Mumbai)"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="6-Digit PIN Code"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: PAYMENT COLLECTION OPTIONS */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-900 dark:text-purple-400 tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>4. Payment Collection Mode</span>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('MANUAL')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    paymentOption === 'MANUAL'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-slate-900 dark:text-white block">
                      Collect Manual Payment (Offline / Cash / Direct)
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Mark as PAID immediately via Cash, Direct UPI, NEFT Bank Transfer, POS swipe, or Comp.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('ONLINE')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    paymentOption === 'ONLINE'
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-slate-900 dark:text-white block">
                      Generate Online Payment Link
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Generate a live Razorpay/UPI link for customer to pay online.
                    </span>
                  </div>
                </button>
              </div>

              {/* Manual Offline Payment Fields */}
              {paymentOption === 'MANUAL' && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Manual Offline Payment Details
                    </span>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900 px-2.5 py-1 rounded-lg">
                      Amount: ₹{selectedPlanData.price}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Channel / Method *
                      </label>
                      <select
                        value={manualPaymentMethod}
                        onChange={(e) => setManualPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      >
                        <option value="MANUAL_CASH">Cash in Hand (Counter Payment)</option>
                        <option value="MANUAL_UPI">Direct UPI Transfer (GPay / PhonePe / QR)</option>
                        <option value="MANUAL_BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                        <option value="MANUAL_POS">Credit/Debit Card (Store POS Machine)</option>
                        <option value="WAIVED">Waived / Complimentary Lead</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        UTR / Cheque / Cash Receipt Reference #
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UTR-9821049281 or RCPT-102"
                        value={manualPaymentRef}
                        onChange={(e) => setManualPaymentRef(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Collecting Staff / Representative Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Superadmin Lead"
                        value={manualPaymentCollector}
                        onChange={(e) => setManualPaymentCollector(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Payment & Accounting Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paid in cash at showroom / Direct transfer confirmed"
                        value={manualPaymentNotes}
                        onChange={(e) => setManualPaymentNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating Profile...' : 'Create Client Profile & Setup'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
