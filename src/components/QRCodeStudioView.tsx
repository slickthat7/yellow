import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  Palette,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Star,
} from 'lucide-react';
import { Order, Organization } from '../types/index.js';
import {
  generateQrDataUrl,
  generateQrSvgString,
  generateStandeeArtworkSvg,
  generateStandeeArtworkPng,
  StandeeArtConfig,
} from '../utils/qrCodeGenerator.js';

interface QRCodeStudioViewProps {
  orders: Order[];
  orgs: Organization[];
  onRefreshData?: () => void;
  onOpenModal?: (order?: Order, org?: Organization) => void;
}

const COLOR_THEMES = [
  { name: 'MAST Signature Purple', value: '#4C1D95', text: 'text-purple-700' },
  { name: 'Midnight Charcoal', value: '#0F172A', text: 'text-slate-800' },
  { name: 'Emerald Green', value: '#059669', text: 'text-emerald-700' },
  { name: 'Royal Indigo', value: '#3730A3', text: 'text-indigo-700' },
  { name: 'Amber Luxury', value: '#D97706', text: 'text-amber-700' },
  { name: 'Crimson Bold', value: '#9F1239', text: 'text-rose-700' },
];

export const QRCodeStudioView: React.FC<QRCodeStudioViewProps> = ({
  orders,
  orgs,
  onRefreshData,
  onOpenModal,
}) => {
  // Main Studio State
  const [selectedOrgSlug, setSelectedOrgSlug] = useState<string>(orgs[0]?.slug || '');
  const [customBusinessName, setCustomBusinessName] = useState<string>(orgs[0]?.name || 'My Store');
  const [customTagline, setCustomTagline] = useState<string>('Review Us On Google');
  const [primaryColor, setPrimaryColor] = useState<string>('#4C1D95');
  const [errorCorrection, setErrorCorrection] = useState<'H' | 'Q' | 'M' | 'L'>('H');
  const [activeTab, setActiveTab] = useState<'standee' | 'qr-raw'>('standee');

  // Generated Visuals
  const [qrPngUrl, setQrPngUrl] = useState('');
  const [standeePngUrl, setStandeePngUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Batch Multi-Standee Generator State
  const [batchPrefix, setBatchPrefix] = useState('Table');
  const [batchCount, setBatchCount] = useState(6);
  const [batchItems, setBatchItems] = useState<{ label: string; url: string; qrUrl: string }[]>([]);

  // Scanner Simulator State
  const [testScanUrl, setTestScanUrl] = useState('');
  const [testResult, setTestResult] = useState<{ org?: Organization; mode: string } | null>(null);

  // Sync org selection
  const currentTargetUrl = selectedOrgSlug
    ? `${window.location.origin}/r/${selectedOrgSlug}`
    : `${window.location.origin}/r/demo-store`;

  const handleSelectOrg = (slug: string) => {
    setSelectedOrgSlug(slug);
    const matched = orgs.find((o) => o.slug === slug);
    if (matched) {
      setCustomBusinessName(matched.name);
      if (matched.primaryColor) setPrimaryColor(matched.primaryColor);
    }
  };

  // Generate Main Previews
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const config: StandeeArtConfig = {
      businessName: customBusinessName,
      targetUrl: currentTargetUrl,
      tagline: customTagline,
      primaryColor,
    };

    generateQrDataUrl(currentTargetUrl, {
      darkColor: primaryColor,
      lightColor: '#FFFFFF',
      errorCorrectionLevel: errorCorrection,
      width: 450,
    }).then((url) => {
      if (isMounted) setQrPngUrl(url);
    });

    generateStandeeArtworkPng(config).then((url) => {
      if (isMounted) {
        setStandeePngUrl(url);
        setIsGenerating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedOrgSlug, customBusinessName, customTagline, primaryColor, errorCorrection, currentTargetUrl]);

  // Generate Batch QR Stands
  useEffect(() => {
    let isMounted = true;
    const items = [];
    const baseSlug = selectedOrgSlug || 'store';

    for (let i = 1; i <= batchCount; i++) {
      const label = `${customBusinessName} - ${batchPrefix} #${i}`;
      const url = `${window.location.origin}/r/${baseSlug}?pos=${encodeURIComponent(
        `${batchPrefix}-${i}`
      )}`;
      items.push({ label, url, qrUrl: '' });
    }

    Promise.all(
      items.map(async (item) => {
        const qrUrl = await generateQrDataUrl(item.url, {
          darkColor: primaryColor,
          lightColor: '#FFFFFF',
          width: 250,
          margin: 1,
        });
        return { ...item, qrUrl };
      })
    ).then((res) => {
      if (isMounted) setBatchItems(res);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedOrgSlug, customBusinessName, batchPrefix, batchCount, primaryColor]);

  // Test scan analyzer
  const handleTestScan = (input: string) => {
    setTestScanUrl(input);
    const val = input.trim();
    if (!val) {
      setTestResult(null);
      return;
    }
    // Extract slug from URL if pasted
    const match = val.match(/\/r\/([a-zA-Z0-9_-]+)/);
    const slug = match ? match[1] : val;
    const foundOrg = orgs.find((o) => o.slug.toLowerCase() === slug.toLowerCase());

    if (foundOrg) {
      setTestResult({
        org: foundOrg,
        mode: 'Smart 5-Star Feedback Intercept Active',
      });
    } else {
      setTestResult({
        mode: 'Direct Custom Link Preview',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTargetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadStandeeSvg = async () => {
    const svgStr = await generateStandeeArtworkSvg({
      businessName: customBusinessName,
      targetUrl: currentTargetUrl,
      tagline: customTagline,
      primaryColor,
    });
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customBusinessName.replace(/[^a-zA-Z0-9_-]/g, '_')}-standee-vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadStandeePng = () => {
    if (!standeePngUrl) return;
    const a = document.createElement('a');
    a.href = standeePngUrl;
    a.download = `${customBusinessName.replace(/[^a-zA-Z0-9_-]/g, '_')}-standee-art.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadQrSvg = async () => {
    const svgStr = await generateQrSvgString(currentTargetUrl, {
      darkColor: primaryColor,
      lightColor: '#FFFFFF',
      errorCorrectionLevel: errorCorrection,
    });
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customBusinessName.replace(/[^a-zA-Z0-9_-]/g, '_')}-qr-matrix.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQrPng = () => {
    if (!qrPngUrl) return;
    const a = document.createElement('a');
    a.href = qrPngUrl;
    a.download = `${customBusinessName.replace(/[^a-zA-Z0-9_-]/g, '_')}-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-400 text-purple-950 font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart QR Standee Studio</span>
            </span>
            <span className="px-2.5 py-0.5 bg-white/10 text-purple-200 font-mono text-[11px] rounded-md">
              UV Acrylic Flatbed • Laser Vector SVG • 300 DPI
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Google Review Standee & Dynamic QR Code Studio
          </h2>
          <p className="text-xs sm:text-sm text-purple-200">
            Generate customized, print-ready acrylic counter standees, table tent QR codes, and smart review links with instant 5-star customer routing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            type="button"
            onClick={handleDownloadStandeeSvg}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-purple-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Export Standee (SVG)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive QR & Standee Designer (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Live Standee Artwork & QR Engine
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time vector rendering for UV printing & counter placement
                </p>
              </div>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('standee')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'standee'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Acrylic Standee Sign
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr-raw')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'qr-raw'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                QR Matrix Only
              </button>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Storefront / Brand Profile
              </label>
              <select
                value={selectedOrgSlug}
                onChange={(e) => handleSelectOrg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.slug}>
                    {org.name} (/r/{org.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Business Display Title
              </label>
              <input
                type="text"
                value={customBusinessName}
                onChange={(e) => setCustomBusinessName(e.target.value)}
                placeholder="e.g. Royal Cafe & Lounge"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Call To Action
              </label>
              <input
                type="text"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                placeholder="Review Us On Google"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Color Palette Preset
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setPrimaryColor(theme.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      primaryColor === theme.value
                        ? 'border-purple-600 scale-125 shadow-md ring-2 ring-purple-400/40'
                        : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: theme.value }}
                    title={theme.name}
                  />
                ))}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-6 h-6 rounded-md border border-slate-300 cursor-pointer p-0"
                  title="Custom Color Picker"
                />
              </div>
            </div>
          </div>

          {/* Live Visual Stage */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px] space-y-4">
            {activeTab === 'standee' ? (
              <div className="flex flex-col items-center">
                {standeePngUrl ? (
                  <img
                    src={standeePngUrl}
                    alt="Standee Print Preview"
                    className="max-h-80 w-auto object-contain rounded-2xl shadow-xl border border-slate-200"
                  />
                ) : (
                  <div className="py-16 text-slate-400 text-xs">Generating standee vector...</div>
                )}
                <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-500 font-bold">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>5★ Feedback Intercept Ready</span>
                  </span>
                  <span>•</span>
                  <span>{currentTargetUrl}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                {qrPngUrl ? (
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                    <img src={qrPngUrl} alt="QR Code" className="w-52 h-52 object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="py-16 text-slate-400 text-xs">Rendering QR...</div>
                )}
                <span className="font-mono text-xs text-slate-500 font-bold">{currentTargetUrl}</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy Smart Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadStandeeSvg}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs rounded-xl border border-purple-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Standee (Vector SVG)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadStandeePng}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Standee (High-Res PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>QR Only (PNG)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Table Batch Generator & Live Scan Tester (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Scanner & Review Destination Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Live QR Test Scanner
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulate phone camera scan & inspect rating flow
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Scan or Enter Storefront URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. /r/royal-cafe or full URL"
                  value={testScanUrl}
                  onChange={(e) => handleTestScan(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
                {testScanUrl && (
                  <button
                    type="button"
                    onClick={() => handleTestScan('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {testResult?.org ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                    Storefront Verified: {testResult.org.name}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-200 text-emerald-900">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Google Target:{' '}
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {testResult.org.googleReviewUrl || 'Configured via Smart Intercept'}
                  </span>
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                    ✓ 5★ redirects to Google / 1-4★ to Private Form
                  </span>
                  <a
                    href={`/r/${testResult.org.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : testScanUrl.trim() ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-xs text-slate-500 font-medium">
                Testing custom URL. Click below to launch in new tab.
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-400">
                Paste any store slug or smart review link to test routing logic.
              </div>
            )}
          </div>

          {/* Multi-Location / Multi-Table QR Batch Generator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Multi-Table Stand Batcher
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Generate numbered standees for restaurant tables or counters
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                title="Print Standee Sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Label Tag</label>
                <input
                  type="text"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  placeholder="e.g. Table, Room, Counter"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Stands Count</label>
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                >
                  <option value={4}>4 Standees</option>
                  <option value={6}>6 Standees</option>
                  <option value={8}>8 Standees</option>
                  <option value={12}>12 Standees</option>
                </select>
              </div>
            </div>

            {/* Batch Grid Preview */}
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {batchItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-2xs space-y-1.5"
                >
                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {batchPrefix} #{idx + 1}
                  </span>
                  {item.qrUrl ? (
                    <img src={item.qrUrl} alt={item.label} className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-md" />
                  )}
                  <span className="text-[9px] font-mono text-slate-400">
                    ?pos={batchPrefix.toLowerCase()}-{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
