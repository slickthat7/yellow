import QRCode from 'qrcode';

export interface QROptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
  darkColor?: string;
  lightColor?: string;
}

export interface StandeeArtConfig {
  businessName: string;
  targetUrl: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: 'modern-purple' | 'gold-luxury' | 'emerald-fresh' | 'minimal-dark' | 'clean-white';
  showStars?: boolean;
  showNfcIcon?: boolean;
}

/**
 * Generate standard high-resolution QR Code PNG data URL
 */
export async function generateQrDataUrl(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const safeText = text.trim() || 'https://mastqr.com';
  try {
    const dataUrl = await QRCode.toDataURL(safeText, {
      width: options.width || 400,
      margin: options.margin !== undefined ? options.margin : 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'H',
      color: {
        dark: options.darkColor || '#4C1D95',
        light: options.lightColor || '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR Data URL:', err);
    return '';
  }
}

/**
 * Generate pure SVG vector string for QR Code (for Laser Engraving & UV Print)
 */
export async function generateQrSvgString(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const safeText = text.trim() || 'https://mastqr.com';
  try {
    const svg = await QRCode.toString(safeText, {
      type: 'svg',
      margin: options.margin !== undefined ? options.margin : 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'H',
      color: {
        dark: options.darkColor || '#4C1D95',
        light: options.lightColor || '#FFFFFF',
      },
    });
    return svg;
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return '';
  }
}

/**
 * Generate high-resolution acrylic standee artwork as pure SVG
 */
export async function generateStandeeArtworkSvg(config: StandeeArtConfig): Promise<string> {
  const primary = config.primaryColor || '#4C1D95';
  const qrSvg = await generateQrSvgString(config.targetUrl, {
    darkColor: primary,
    lightColor: '#FFFFFF',
    margin: 1,
    errorCorrectionLevel: 'H',
  });

  // Extract inner SVG content or encode as nested
  const parser = new DOMParser();
  const qrDoc = parser.parseFromString(qrSvg, 'image/svg+xml');
  const qrViewBox = qrDoc.documentElement.getAttribute('viewBox') || '0 0 100 100';
  const qrInnerContent = qrDoc.documentElement.innerHTML;

  const width = 600;
  const height = 900;
  const businessName = config.businessName || 'Business Name';
  const tagline = config.tagline || 'Review Us On Google';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="standeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primary}" />
        <stop offset="100%" stop-color="#1E1B4B" />
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.18"/>
      </filter>
    </defs>

    <!-- Acrylic Outer Frame -->
    <rect x="20" y="20" width="560" height="860" rx="36" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="4" filter="url(#cardShadow)" />
    
    <!-- Top Brand Header Banner -->
    <path d="M 20 56 Q 20 20 56 20 L 544 20 Q 580 20 580 56 L 580 180 L 20 180 Z" fill="url(#standeeGrad)" />

    <!-- Google 5 Star Badges -->
    <g transform="translate(190, 130)">
      <text x="0" y="0" font-size="28" fill="#FBBF24">★ ★ ★ ★ ★</text>
    </g>

    <!-- Business Title -->
    <text x="300" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">
      ${businessName.length > 22 ? businessName.slice(0, 20) + '...' : businessName}
    </text>

    <!-- Tagline -->
    <text x="300" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="#1E293B" text-anchor="middle">
      ${tagline}
    </text>
    <text x="300" y="272" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#64748B" text-anchor="middle">
      Tap with phone or point camera to rate
    </text>

    <!-- QR Code Center Plate -->
    <rect x="110" y="310" width="380" height="380" rx="28" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3" filter="url(#cardShadow)" />
    
    <svg x="135" y="335" width="330" height="330" viewBox="${qrViewBox}">
      ${qrInnerContent}
    </svg>

    <!-- Tap NFC Indicator Badge -->
    <rect x="180" y="720" width="240" height="44" rx="22" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2" />
    <text x="300" y="748" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#334155" text-anchor="middle">
      ⚡ TAP PHONE OR SCAN QR
    </text>

    <!-- Footer URL & Watermark -->
    <text x="300" y="810" font-family="monospace, monospace" font-size="13" font-weight="600" fill="#64748B" text-anchor="middle">
      ${config.targetUrl.replace(/^https?:\/\//, '')}
    </text>
    <text x="300" y="845" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#94A3B8" text-anchor="middle">
      POWERED BY MAST QR • SMART STANDS
    </text>
  </svg>`;
}

/**
 * Downloads high-res Standee PNG
 */
export async function generateStandeeArtworkPng(config: StandeeArtConfig): Promise<string> {
  const svgMarkup = await generateStandeeArtworkSvg(config);
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
}
