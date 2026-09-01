import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Barcode as BarcodeIcon,
  QrCode,
  Copy,
  Check,
  Sparkles,
  Printer,
  RefreshCw,
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCodeLib from 'qrcode';

interface BarcodeQrGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string;
  initialTitle?: string;
  storeSlug?: string;
  onAssignToOrder?: (barcode: string, format: string) => Promise<void>;
}

export const BarcodeQrGeneratorModal: React.FC<BarcodeQrGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialValue = '',
  initialTitle = 'MAST QR Standee Barcode',
  storeSlug = '',
  onAssignToOrder,
}) => {
  const [barcodeText, setBarcodeText] = useState(
    initialValue || `MQ-BC-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'CODE39' | 'EAN13' | 'pharmacode'>('CODE128');
  const [barcodeColor, setBarcodeColor] = useState('#000000');
  const [displayType, setDisplayType] = useState<'barcode' | 'qr' | 'both'>('both');
  const [qrUrl, setQrUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

  // Generate QR Code URL
  useEffect(() => {
    const targetUrl = storeSlug
      ? `${window.location.origin}/r/${storeSlug}`
      : `${window.location.origin}/track?q=${barcodeText}`;
    setQrUrl(targetUrl);

    QRCodeLib.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#4C1D95',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [storeSlug, barcodeText]);

  // Render Barcode via JsBarcode
  useEffect(() => {
    if (barcodeSvgRef.current && barcodeText.trim()) {
      try {
        JsBarcode(barcodeSvgRef.current, barcodeText.trim(), {
          format: barcodeFormat,
          lineColor: barcodeColor,
          width: 2,
          height: 70,
          displayValue: true,
          fontSize: 14,
          font: 'monospace',
          textMargin: 4,
          background: '#ffffff',
        });
      } catch (err) {
        console.warn('JsBarcode render notice:', err);
      }
    }
  }, [barcodeText, barcodeFormat, barcodeColor, displayType]);

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const prefix = storeSlug ? storeSlug.toUpperCase().slice(0, 6) : 'MQ-BC';
    setBarcodeText(`${prefix}-${randomNum}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(barcodeText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadBarcodeSvg = () => {
    if (!barcodeSvgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(barcodeSvgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${barcodeText}-barcode.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const downloadQrPng = () => {
    if (!qrDataUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = qrDataUrl;
    downloadLink.download = `${barcodeText}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleAssign = async () => {
    if (!onAssignToOrder) return;
    setIsAssigning(true);
    try {
      await onAssignToOrder(barcodeText, barcodeFormat);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BarcodeIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base">Custom Barcode & Standee SKU Studio</h3>
              <p className="text-xs text-purple-200">{initialTitle}</p>
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
        <div className="p-6 space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Custom Barcode / SKU Value
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={barcodeText}
                  onChange={(e) => setBarcodeText(e.target.value)}
                  placeholder="e.g. MQ-BC-908123"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  title="Generate Random Serial"
                  className="p-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 text-purple-900 dark:text-purple-300 rounded-xl text-xs font-bold"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Barcode Standard / Symbology
              </label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              >
                <option value="CODE128">Code 128 (Standard Industrial Alphanumeric)</option>
                <option value="CODE39">Code 39 (Standard Packaging SKU)</option>
                <option value="EAN13">EAN-13 (Retail Standard)</option>
                <option value="pharmacode">Pharmacode (High-Speed Scanner)</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-500">Preview:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setDisplayType('both')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  displayType === 'both'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Barcode + Standee QR
              </button>
              <button
                type="button"
                onClick={() => setDisplayType('barcode')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  displayType === 'barcode'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Barcode Only
              </button>
              <button
                type="button"
                onClick={() => setDisplayType('qr')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  displayType === 'qr'
                    ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                QR Code Only
              </button>
            </div>
          </div>

          {/* Visual Output Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-full flex flex-col sm:flex-row items-center justify-center gap-6">
              {(displayType === 'barcode' || displayType === 'both') && (
                <div className="flex flex-col items-center">
                  <div className="overflow-x-auto max-w-full p-2 bg-white rounded-lg">
                    <svg ref={barcodeSvgRef} className="max-w-full" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                    Format: {barcodeFormat} • UV Print Ready
                  </span>
                </div>
              )}

              {(displayType === 'qr' || displayType === 'both') && qrDataUrl && (
                <div className="flex flex-col items-center">
                  <img
                    src={qrDataUrl}
                    alt="Standee QR Preview"
                    className="w-32 h-32 rounded-xl border border-slate-200 shadow-xs"
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-1 text-center truncate max-w-[140px]">
                    {storeSlug ? `/r/${storeSlug}` : barcodeText}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 text-center mt-3">
              Directly vector-rendered for laser engraving, acrylic standee base plates, and package fulfillment tags.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={downloadBarcodeSvg}
                className="px-3 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-[#4C1D95] dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Barcode (SVG)</span>
              </button>

              <button
                type="button"
                onClick={downloadQrPng}
                className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR (PNG)</span>
              </button>
            </div>

            {onAssignToOrder && (
              <button
                type="button"
                onClick={handleAssign}
                disabled={isAssigning}
                className="px-4 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAssigning ? 'Assigning...' : 'Save & Assign to Order'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
