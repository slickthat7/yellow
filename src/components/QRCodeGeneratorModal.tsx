import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import {
  generateQrDataUrl,
  generateQrSvgString,
  generateStandeeArtworkSvg,
  generateStandeeArtworkPng,
  StandeeArtConfig,
} from '../utils/qrCodeGenerator.js';

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialTitle?: string;
  storeSlug?: string;
  businessName?: string;
  primaryColor?: string;
}

const COLOR_PRESETS = [
  { name: 'MAST Purple', value: '#4C1D95', bg: 'bg-purple-900' },
  { name: 'Midnight Black', value: '#0F172A', bg: 'bg-slate-900' },
  { name: 'Emerald Green', value: '#059669', bg: 'bg-emerald-700' },
  { name: 'Royal Blue', value: '#2563EB', bg: 'bg-blue-600' },
  { name: 'Luxury Amber', value: '#D97706', bg: 'bg-amber-600' },
  { name: 'Crimson Rose', value: '#BE123C', bg: 'bg-rose-700' },
];

export const QRCodeGeneratorModal: React.FC<QRCodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialUrl = '',
  initialTitle = 'Standee QR Code Generator',
  storeSlug = '',
  businessName = 'My Business',
  primaryColor = '#4C1D95',
}) => {
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [bName, setBName] = useState(businessName);
  const [selectedColor, setSelectedColor] = useState(primaryColor);
  const [activeTab, setActiveTab] = useState<'qr-only' | 'standee-sign'>('standee-sign');
  const [errorCorrection, setErrorCorrection] = useState<'H' | 'Q' | 'M' | 'L'>('H');
  const [tagline, setTagline] = useState('Review Us On Google');

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [standeePngUrl, setStandeePngUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultUrl = storeSlug
        ? `${window.location.origin}/r/${storeSlug}`
        : initialUrl || `${window.location.origin}/r/demo`;
      setTargetUrl(defaultUrl);
      setBName(businessName || 'Business Storefront');
      setSelectedColor(primaryColor || '#4C1D95');
    }
  }, [isOpen, initialUrl, storeSlug, businessName, primaryColor]);

  // Generate QR & Standee Previews
  useEffect(() => {
    if (!isOpen || !targetUrl.trim()) return;

    let isMounted = true;
    setIsGenerating(true);

    const config: StandeeArtConfig = {
      businessName: bName,
      targetUrl: targetUrl.trim(),
      tagline,
      primaryColor: selectedColor,
    };

    // 1. Generate standalone QR code
    generateQrDataUrl(targetUrl.trim(), {
      darkColor: selectedColor,
      lightColor: '#FFFFFF',
      errorCorrectionLevel: errorCorrection,
      width: 400,
    }).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });

    // 2. Generate full acrylic standee artwork
    generateStandeeArtworkPng(config).then((url) => {
      if (isMounted) {
        setStandeePngUrl(url);
        setIsGenerating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUrl, bName, selectedColor, errorCorrection, tagline]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${bName.replace(/[^a-zA-Z0-9_-]/g, '_')}-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadQrSvg = async () => {
    const svgStr = await generateQrSvgString(targetUrl, {
      darkColor: selectedColor,
      lightColor: '#FFFFFF',
      errorCorrectionLevel: errorCorrection,
    });
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bName.replace(/[^a-zA-Z0-9_-]/g, '_')}-qr-code.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadStandeeSvg = async () => {
    const svgStr = await generateStandeeArtworkSvg({
      businessName: bName,
      targetUrl: targetUrl.trim(),
      tagline,
      primaryColor: selectedColor,
    });
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bName.replace(/[^a-zA-Z0-9_-]/g, '_')}-standee-print.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadStandeePng = () => {
    if (!standeePngUrl) return;
    const a = document.createElement('a');
    a.href = standeePngUrl;
    a.download = `${bName.replace(/[^a-zA-Z0-9_-]/g, '_')}-standee-print.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base">Standee QR Code & Print Studio</h3>
              <p className="text-xs text-purple-200">{initialTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Controls & Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Review URL / Smart Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://.../r/mystore"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Business Title on Standee
              </label>
              <input
                type="text"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                placeholder="e.g. Royal Cafe & Lounge"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Color & Style Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Brand Palette Theme
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      selectedColor === color.value
                        ? 'border-purple-600 scale-110 shadow-md ring-2 ring-purple-400/40'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  title="Custom Hex Color"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Error Correction (UV Acrylic Damage Resistance)
              </label>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="H">Level H (30% Damage Recovery - Best for Acrylic)</option>
                <option value="Q">Level Q (25% Damage Recovery)</option>
                <option value="M">Level M (15% Standard)</option>
                <option value="L">Level L (7% High Density)</option>
              </select>
            </div>
          </div>

          {/* Mode Switch: Standee Preview vs Standalone QR */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('standee-sign')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'standee-sign'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Acrylic Standee Sign (UV Print Ready)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr-only')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'qr-only'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Isolated QR Code Matrix
              </button>
            </div>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-700 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Test Smart Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Visual Display Stage */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[260px]">
            {activeTab === 'standee-sign' ? (
              <div className="flex flex-col items-center">
                {standeePngUrl ? (
                  <img
                    src={standeePngUrl}
                    alt="Acrylic Standee Artwork"
                    className="max-h-72 w-auto object-contain rounded-2xl shadow-lg border border-slate-200"
                  />
                ) : (
                  <div className="py-12 text-slate-400 text-xs font-medium">Rendering standee vector...</div>
                )}
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  UV Flatbed Print Layout (600 × 900 Vector Ratio)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {qrDataUrl ? (
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                    <img
                      src={qrDataUrl}
                      alt="Smart QR Code"
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="py-12 text-slate-400 text-xs">Generating QR...</div>
                )}
                <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-sm">
                  {targetUrl}
                </span>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied URL' : 'Copy Smart Link'}</span>
              </button>

              {activeTab === 'standee-sign' ? (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadStandeeSvg}
                    className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-[#4C1D95] dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Standee (Vector SVG)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadStandeePng}
                    className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Standee (High-Res PNG)</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadQrSvg}
                    className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-[#4C1D95] dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>QR (Vector SVG)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadQrPng}
                    className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>QR (PNG)</span>
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Standee Sign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
