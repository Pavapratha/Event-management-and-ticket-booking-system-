import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate a PNG ticket from a DOM element
 * @param {HTMLElement} element - The element to convert to PNG
 * @param {string} filename - The filename for the download
 */
export const downloadTicketAsPNG = async (element, filename = 'ticket.png') => {
  if (!element) {
    throw new Error('Element not found');
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('PNG download error:', error);
    throw new Error('Failed to download PNG ticket');
  }
};

/**
 * Generate a PDF ticket from a DOM element
 * @param {HTMLElement} element - The element to convert to PDF
 * @param {string} filename - The filename for the download
 */
export const downloadTicketAsPDF = async (element, filename = 'ticket.pdf') => {
  if (!element) {
    throw new Error('Element not found');
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('PDF download error:', error);
    throw new Error('Failed to download PDF ticket');
  }
};

/**
 * Generate inline SVG QR code (simple implementation)
 * For production, consider using qrcode npm package
 * @param {string} text - The text to encode in QR code
 * @param {number} size - The size of the QR code in pixels
 */
export const generateSimpleQRCode = (text, size = 200) => {
  // Note: This is a placeholder. In production, use 'qrcode' npm package
  // npm install qrcode
  // Then use: import QRCode from 'qrcode';
  return text; // Will be replaced with actual QR generation
};

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: LKR)
 */
export const formatCurrency = (amount, currency = 'LKR') => {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date for display
 * @param {string|Date} date - The date to format
 * @param {string} format - The format (short, long, etc.)
 */
export const formatDate = (date, format = 'long') => {
  const dateObj = new Date(date);
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: '2-digit' },
  };
  return dateObj.toLocaleDateString('en-US', options[format] || options.long);
};
