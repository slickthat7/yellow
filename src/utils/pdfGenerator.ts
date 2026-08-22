import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface StandeePdfOptions {
  businessName: string;
  tagline?: string;
  qrUrl: string;
  primaryColor?: string;
  orderNumber?: string;
  planTitle?: string;
  format?: 'standee-5x7' | 'a4-poster' | 'table-tent' | 'square-sticker';
}

export async function generateStandeePdf(options: StandeePdfOptions): Promise<jsPDF> {
  const {
    businessName,
    tagline = 'Scan with your phone camera to review us on Google',
    qrUrl,
    primaryColor = '#581C87',
    orderNumber = 'MQ-STAND',
    format = 'standee-5x7',
  } = options;

  // Generate high-resolution QR Code Data URL
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 800,
    color: {
      dark: '#1E1B4B',
      light: '#FFFFFF',
    },
  });

  let doc: jsPDF;

  if (format === 'standee-5x7') {
    // 5x7 inches standard counter acrylic standee (127mm x 177.8mm)
    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [127, 178],
    });

    const w = 127;
    const h = 178;

    // Background header accent
    doc.setFillColor(88, 28, 135); // #581C87 Deep Purple
    doc.rect(0, 0, w, 38, 'F');

    // Header Stars (5 golden stars in text)
    doc.setTextColor(245, 158, 11); // Gold #F59E0B
    doc.setFontSize(22);
    doc.text('★ ★ ★ ★ ★', w / 2, 14, { align: 'center' });

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('RATE YOUR EXPERIENCE', w / 2, 24, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('ON GOOGLE REVIEWS', w / 2, 31, { align: 'center' });

    // Business Name Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, 44, w - 24, 18, 3, 3, 'F');

    doc.setTextColor(30, 27, 75);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const splitName = doc.splitTextToSize(businessName.toUpperCase(), w - 32);
    doc.text(splitName, w / 2, 54, { align: 'center' });

    // QR Code Frame
    const qrSize = 58;
    const qrX = (w - qrSize) / 2;
    const qrY = 68;

    // QR Outer shadow/border box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4, 4, 'FD');

    // Add QR Image
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Call to action below QR
    doc.setTextColor(76, 29, 149);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('POINT YOUR CAMERA TO SCAN', w / 2, 142, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const splitTag = doc.splitTextToSize(tagline, w - 24);
    doc.text(splitTag, w / 2, 148, { align: 'center' });

    // Footer divider & MAST QR verification badge
    doc.setDrawColor(203, 213, 225);
    doc.line(16, 160, w - 16, 160);

    doc.setTextColor(88, 28, 135);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('MAST QR', w / 2, 166, { align: 'center' });

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Standee • Verified Order: ${orderNumber}`, w / 2, 171, { align: 'center' });
  } else if (format === 'a4-poster') {
    // Standard A4 Poster (210mm x 297mm)
    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const w = 210;
    const h = 297;

    // Header banner
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, w, 65, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(32);
    doc.text('★ ★ ★ ★ ★', w / 2, 25, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('LOVE YOUR VISIT?', w / 2, 42, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('LEAVE US A 5-STAR REVIEW ON GOOGLE', w / 2, 53, { align: 'center' });

    // Business Name
    doc.setTextColor(30, 27, 75);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text(businessName.toUpperCase(), w / 2, 85, { align: 'center' });

    // QR Box
    const qrSize = 100;
    const qrX = (w - qrSize) / 2;
    const qrY = 105;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 6, 6, 'FD');

    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Scan CTA
    doc.setTextColor(88, 28, 135);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SCAN WITH YOUR PHONE CAMERA', w / 2, 230, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(tagline, w / 2, 240, { align: 'center' });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(25, 265, w - 25, 265);

    doc.setTextColor(88, 28, 135);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MAST QR • SCAN • RATE • IMPROVE • GROW', w / 2, 275, { align: 'center' });

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Instant Digital Print Template • Order Ref: ${orderNumber}`, w / 2, 282, { align: 'center' });
  } else {
    // Square sticker (100mm x 100mm)
    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 100],
    });

    const w = 100;
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, w, 22, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(12);
    doc.text('★ ★ ★ ★ ★', w / 2, 9, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('REVIEW US ON GOOGLE', w / 2, 16, { align: 'center' });

    doc.setTextColor(30, 27, 75);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(businessName.toUpperCase(), w / 2, 30, { align: 'center' });

    const qrSize = 42;
    const qrX = (w - qrSize) / 2;
    const qrY = 34;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    doc.setTextColor(88, 28, 135);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('MAST QR • SCAN TO RATE', w / 2, 85, { align: 'center' });
  }

  return doc;
}

export async function downloadStandeePdf(options: StandeePdfOptions) {
  const doc = await generateStandeePdf(options);
  const cleanName = options.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  doc.save(`MAST-QR-${cleanName}-${options.format || 'standee'}.pdf`);
}
