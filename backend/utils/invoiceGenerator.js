const PDFDocument = require('pdfkit');

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const formatDate = (value) => {
  if (!value) {
    return 'TBD';
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const drawLabelValue = (doc, label, value) => {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(value);
};

const buildInvoiceFilename = (booking) => {
  const invoiceRef = booking.invoiceNumber || booking.bookingId || booking._id;
  return `invoice-${invoiceRef}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const generateInvoicePdf = (booking, stream) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const event = booking.eventId || {};
  const user = booking.userId || {};

  doc.pipe(stream);

  doc
    .fillColor('#ea580c')
    .font('Helvetica-Bold')
    .fontSize(24)
    .text('BOOKING INVOICE', { align: 'center' })
    .moveDown(0.3);

  doc
    .fillColor('#475569')
    .font('Helvetica')
    .fontSize(10)
    .text(`Generated: ${formatDate(booking.invoiceGeneratedAt || new Date())}`, { align: 'center' })
    .moveDown(1.5);

  doc.roundedRect(50, doc.y, 250, 95, 10).strokeColor('#fdba74').stroke();
  doc.roundedRect(312, doc.y - 95, 250, 95, 10).strokeColor('#cbd5e1').stroke();

  doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold').text('Invoice Details', 65, doc.y - 85);
  doc.fontSize(11);
  drawLabelValue(doc, 'Invoice No', booking.invoiceNumber || 'Pending');
  drawLabelValue(doc, 'Booking ID', booking.bookingId || String(booking._id));
  drawLabelValue(doc, 'Booking Date', formatDate(booking.createdAt));

  doc.fontSize(13).font('Helvetica-Bold').text('Customer Details', 327, doc.y - 65);
  doc.fontSize(11);
  doc.text(`Name: ${user.name || 'Customer'}`, 327, doc.y - 45);
  doc.text(`Email: ${user.email || 'N/A'}`, 327);
  doc.text(`Role: ${user.role || 'user'}`, 327);
  doc.moveDown(2);

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Event Information', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  drawLabelValue(doc, 'Event Name', event.title || 'Event');
  drawLabelValue(doc, 'Event Date', formatDate(event.date));
  drawLabelValue(doc, 'Event Time', event.time || 'TBD');
  drawLabelValue(doc, 'Location', event.location || event.venue || 'TBD');
  doc.moveDown(1.2);

  const tableTop = doc.y;
  const columns = {
    item: 55,
    qty: 300,
    price: 380,
    total: 470,
  };

  doc.fontSize(14).font('Helvetica-Bold').text('Invoice Summary', { underline: true });
  doc.moveDown(0.8);
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('Item', columns.item, tableTop + 25);
  doc.text('Qty', columns.qty, tableTop + 25);
  doc.text('Price', columns.price, tableTop + 25);
  doc.text('Total', columns.total, tableTop + 25);
  doc.moveTo(50, tableTop + 42).lineTo(545, tableTop + 42).strokeColor('#cbd5e1').stroke();

  let currentY = tableTop + 55;
  doc.font('Helvetica').fontSize(10.5);

  if (Array.isArray(booking.ticketDetails) && booking.ticketDetails.length > 0) {
    booking.ticketDetails.forEach((ticket) => {
      doc.text(ticket.categoryName || 'Ticket', columns.item, currentY, { width: 220 });
      doc.text(String(ticket.quantity || 0), columns.qty, currentY);
      doc.text(formatCurrency(ticket.price), columns.price, currentY);
      doc.text(formatCurrency(ticket.subtotal), columns.total, currentY);
      currentY += 22;
    });
  } else {
    const unitPrice = booking.ticketQuantity > 0 ? booking.subtotalAmount / booking.ticketQuantity : booking.totalAmount;
    doc.text('General Admission', columns.item, currentY, { width: 220 });
    doc.text(String(booking.ticketQuantity || 0), columns.qty, currentY);
    doc.text(formatCurrency(unitPrice), columns.price, currentY);
    doc.text(formatCurrency(booking.subtotalAmount || booking.totalAmount), columns.total, currentY);
    currentY += 22;
  }

  doc.moveTo(50, currentY + 4).lineTo(545, currentY + 4).strokeColor('#e2e8f0').stroke();
  currentY += 18;

  doc.font('Helvetica').text('Subtotal', 360, currentY);
  doc.text(formatCurrency(booking.subtotalAmount), columns.total, currentY);
  currentY += 20;

  doc.text('Booking Fee', 360, currentY);
  doc.text(formatCurrency(booking.bookingFee), columns.total, currentY);
  currentY += 22;

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#ea580c').text('Total Amount', 360, currentY);
  doc.text(formatCurrency(booking.totalAmount), columns.total, currentY);
  currentY += 40;

  doc.fillColor('#0f172a').fontSize(11).font('Helvetica');
  doc.text('This invoice was generated automatically when your booking was confirmed.', 50, currentY, {
    width: 500,
    align: 'left',
  });
  doc.moveDown(0.5);
  doc.text('Please keep this invoice for your records.', { width: 500, align: 'left' });

  doc.end();
};

module.exports = {
  buildInvoiceFilename,
  generateInvoicePdf,
};