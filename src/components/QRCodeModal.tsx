import React, { useState } from 'react';
import { X, Download, Printer, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandSlug: string;
  primaryColor?: string;
  logoUrl?: string | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  brandName,
  brandSlug,
  primaryColor = '#2563eb',
  logoUrl,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/r/${brandSlug}`;

  // Helper to build a clean SVG QR code matrix visually
  // We use Google Chart API / QR Server image for reliable high-res QR code display
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    publicUrl
  )}&color=${primaryColor.replace('#', '')}&bgcolor=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">QR Code Counter Stand</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Printable Card Area */}
        <div className="p-6 text-center space-y-5 print:p-0 print:m-0" id="printable-qr-card">
          <div
            className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50 flex flex-col items-center space-y-4 shadow-xs"
            style={{ borderColor: primaryColor }}
          >
            {/* Logo or Brand Initials */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-12 max-w-[160px] object-contain rounded-lg"
              />
            ) : (
              <div
                className="px-4 py-2 rounded-lg text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {brandName}
              </div>
            )}

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-gray-900">{brandName}</h4>
              <p className="text-sm font-medium text-gray-600">Scan to leave us a review!</p>
            </div>

            {/* QR Image */}
            <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
              <img src={qrImageUrl} alt="Review QR Code" className="w-48 h-48 object-contain" />
            </div>

            <div className="flex items-center justify-center space-x-1 text-amber-500 font-bold text-lg">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>

            <p className="text-xs text-gray-400 break-all">{publicUrl}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 print:hidden">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1 px-3 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={qrImageUrl}
                download={`${brandSlug}-review-qr.png`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Save QR Image</span>
              </a>

              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 px-4 py-2.5 text-white text-xs font-medium rounded-xl transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Page</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
