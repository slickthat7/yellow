import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Star, ShieldCheck, Sparkles, Smartphone, Download, ExternalLink } from 'lucide-react';
import { MastQrLogo } from './MastQrLogo.js';
import { downloadStandeePdf } from '../utils/pdfGenerator.js';

interface StandeePreviewProps {
  businessName: string;
  tagline?: string;
  qrSlugOrUrl: string;
  primaryColor?: string;
  planTitle?: string;
  showDownloadButton?: boolean;
  orderNumber?: string;
  isNfcEnabled?: boolean;
}

export const StandeePreview: React.FC<StandeePreviewProps> = ({
  businessName,
  tagline = 'Scan with your camera to review us on Google',
  qrSlugOrUrl,
  primaryColor = '#581C87',
  planTitle = 'Standard Acrylic Standee',
  showDownloadButton = true,
  orderNumber = 'MQ-LIVE',
  isNfcEnabled = false,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeFormat, setActiveFormat] = useState<'standee-5x7' | 'a4-poster' | 'table-tent'>('standee-5x7');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute full target scan URL
  const targetScanUrl = qrSlugOrUrl.startsWith('http')
    ? qrSlugOrUrl
    : `${window.location.origin}/r/${qrSlugOrUrl.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')}`;

  useEffect(() => {
    QRCode.toDataURL(targetScanUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: '#1E1B4B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [targetScanUrl]);

  const handleDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadStandeePdf({
        businessName: businessName || 'My Business',
        tagline,
        qrUrl: targetScanUrl,
        primaryColor,
        orderNumber,
        planTitle,
        format: activeFormat,
      });
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Format Selector Pills */}
      {showDownloadButton && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFormat('standee-5x7')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFormat === 'standee-5x7'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            5×7" Acrylic Standee
          </button>
          <button
            type="button"
            onClick={() => setActiveFormat('a4-poster')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFormat === 'a4-poster'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            A4 Poster
          </button>
          <button
            type="button"
            onClick={() => setActiveFormat('table-tent')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFormat === 'table-tent'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Square Sticker
          </button>
        </div>
      )}

      {/* Realistic Acrylic Standee Card Wrapper */}
      <div className="relative w-full aspect-[1/1.4] max-w-[340px] rounded-2xl bg-gradient-to-b from-white via-slate-50 to-slate-100 p-3 shadow-2xl border-4 border-slate-900/10 flex flex-col justify-between overflow-hidden">
        {/* Glass reflection highlight */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-white/60 to-transparent pointer-events-none transform -skew-y-6" />

        {/* NFC Indicator Badge (if Pro plan) */}
        {isNfcEnabled && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-amber-600">
            <Sparkles className="w-3 h-3" />
            <span>NFC Tap Active</span>
          </div>
        )}

        {/* Top Header Banner */}
        <div className="bg-[#4C1D95] rounded-xl p-3.5 text-center text-white shadow-md relative z-10">
          {/* 5 Golden Stars */}
          <div className="flex items-center justify-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
            ))}
          </div>
          <h4 className="font-black tracking-wide text-xs sm:text-sm uppercase text-white">
            Rate Your Experience
          </h4>
          <p className="text-[10px] font-bold text-amber-300 tracking-wider">ON GOOGLE REVIEWS</p>
        </div>

        {/* Business Name Badge */}
        <div className="my-1.5 px-3 py-1.5 bg-white/90 rounded-lg border border-slate-200 text-center shadow-xs">
          <p className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase line-clamp-1">
            {businessName || 'Your Business Name'}
          </p>
        </div>

        {/* QR Code Central Box */}
        <div className="relative flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner border border-slate-200">
          {qrCodeDataUrl ? (
            <div className="relative p-1 bg-white rounded-lg shadow-sm">
              <img
                src={qrCodeDataUrl}
                alt="Google Review QR Code"
                className="w-36 h-36 object-contain rounded-md"
              />
              {/* Center Logo Mini Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 bg-white rounded-md shadow-md flex items-center justify-center border border-purple-200 p-0.5">
                  <MastQrLogo size="sm" variant="mark" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs font-mono">
              Generating QR...
            </div>
          )}

          {/* Scan CTA */}
          <div className="mt-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-black text-[#4C1D95]">
              <Smartphone className="w-3.5 h-3.5" />
              <span>POINT CAMERA TO SCAN</span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium max-w-[200px] mx-auto mt-0.5 line-clamp-1">
              {tagline}
            </p>
          </div>
        </div>

        {/* Footer Brand Seal */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between px-2">
          <div className="flex items-center gap-1">
            <MastQrLogo size="sm" variant="mark" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-[#3B0764] leading-none">MAST QR</span>
              <span className="text-[7px] text-slate-400 font-mono">VERIFIED STAND</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
            <span>Smart 5★ Filter</span>
          </div>
        </div>
      </div>

      {/* Solid Standee Base Simulation */}
      <div className="w-48 h-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-b-xl shadow-lg border-t border-amber-900/40 -mt-1 relative z-0 flex items-center justify-center">
        <span className="text-[7px] text-amber-200 font-bold uppercase tracking-widest opacity-80">
          Heavy Acrylic Base
        </span>
      </div>

      {/* Live Scan Test Link & Download PDF Button */}
      {showDownloadButton && (
        <div className="w-full mt-5 space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGeneratingPdf}
            className="w-full py-3 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating High-Res PDF...' : `Download Printable ${activeFormat.toUpperCase()} PDF`}</span>
          </button>

          <a
            href={targetScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Test Live Smart Review Routing</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
          </a>
        </div>
      )}
    </div>
  );
};
