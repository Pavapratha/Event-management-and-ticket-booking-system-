const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { displayReportPrice } = require('../utils/currency');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const ticketsSoldResult = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$ticketQuantity' } } },
    ]);
    const ticketsSold = ticketsSoldResult[0]?.total || 0;

    const revenueResult = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 })
      .limit(10);

    // Upcoming events (future events, active)
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
      status: 'active',
    })
      .sort({ date: 1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalUsers,
        totalBookings,
        ticketsSold,
        cancelledBookings,
        totalRevenue,
      },
      recentBookings,
      upcomingEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get reports data
// @route   GET /api/admin/reports
// @access  Admin
exports.getReports = async (req, res) => {
  try {
    // Bookings per event
    const bookingsPerEvent = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$eventId',
          totalBookings: { $sum: 1 },
          totalTickets: { $sum: '$ticketQuantity' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: { path: '$event', preserveNullAndEmpty: false } },
      {
        $project: {
          eventTitle: '$event.title',
          totalBookings: 1,
          totalTickets: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: { path: '$event', preserveNullAndEmpty: false } },
      {
        $group: {
          _id: '$event.category',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.json({
      success: true,
      bookingsPerEvent,
      monthlyRevenue,
      statusBreakdown,
      categoryBreakdown,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get event details for report
// @route   GET /api/admin/events/:id/report-data
// @access  Admin
exports.getEventReportData = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get booking stats for this event
    const bookings = await Booking.find({ eventId: event._id }).populate('userId', 'name email');
    const confirmedBookings = bookings.filter(b => b.status !== 'cancelled');
    
    const ticketsSold = confirmedBookings.reduce((sum, b) => sum + b.ticketQuantity, 0);
    const revenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const ticketsAvailable = event.totalSeats - ticketsSold;

    const reportData = {
      eventName: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventCategory: event.category,
      eventDescription: event.description,
      ticketPrice: event.price,
      totalSeats: event.totalSeats,
      ticketsSold,
      ticketsAvailable,
      totalRevenue: revenue,
      occupancyRate: ((ticketsSold / event.totalSeats) * 100).toFixed(2),
      bookings: confirmedBookings.map(b => ({
        bookingId: b.bookingId,
        customerName: b.userId.name,
        customerEmail: b.userId.email,
        ticketsBooked: b.ticketQuantity,
        totalAmount: b.totalAmount,
        bookingDate: b.createdAt,
        status: b.status,
      })),
      generatedDate: new Date(),
    };

    res.json({ success: true, reportData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Download event report as CSV
// @route   GET /api/admin/events/:id/download-csv
// @access  Admin
exports.downloadEventCSV = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📥 CSV DOWNLOAD STARTED');
    console.log('='.repeat(60));
    console.log('Event ID:', req.params.id);

    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log('❌ Event not found');
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    console.log('Event Found:', event.title);

    const bookings = await Booking.find({ eventId: event._id }).populate('userId', 'name email');
    const confirmedBookings = bookings.filter(b => b.status !== 'cancelled');
    
    const ticketsSold = confirmedBookings.reduce((sum, b) => sum + b.ticketQuantity, 0);
    const revenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Create CSV content
    let csv = 'Event Management System - Event Report\n\n';
    csv += `Report Generated: ${new Date().toLocaleString()}\n\n`;
    csv += '=== EVENT DETAILS ===\n';
    csv += `Event Name,${event.title}\n`;
    csv += `Event Date,${new Date(event.date).toLocaleDateString()}\n`;
    csv += `Event Time,${event.time}\n`;
    csv += `Location,${event.location}\n`;
    csv += `Category,${event.category}\n`;
    csv += `Ticket Price,LKR ${event.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    csv += `\n=== SALES SUMMARY ===\n`;
    csv += `Total Seats,${event.totalSeats}\n`;
    csv += `Tickets Sold,${ticketsSold}\n`;
    csv += `Tickets Available,${event.totalSeats - ticketsSold}\n`;
    csv += `Occupancy Rate,${((ticketsSold / event.totalSeats) * 100).toFixed(2)}%\n`;
    csv += `Total Revenue,LKR ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    csv += `\n=== BOOKING DETAILS ===\n`;
    csv += 'Booking ID,Customer Name,Email,Tickets Booked,Amount (LKR),Booking Date,Status\n';

    confirmedBookings.forEach(booking => {
      csv += `"${booking.bookingId}","${booking.userId.name}","${booking.userId.email}",${booking.ticketQuantity},"${booking.totalAmount.toFixed(2)}","${new Date(booking.createdAt).toLocaleString()}","${booking.status}"\n`;
    });

    // Set response headers for download
    const filename = `${event.title.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment;filename="${filename}"`);
    
    console.log('✅ CSV generated successfully');
    console.log('Filename:', filename);
    console.log('File size:', csv.length, 'bytes');
    console.log('='.repeat(60) + '\n');
    
    res.send(csv);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ CSV DOWNLOAD ERROR');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('='.repeat(60) + '\n');
    
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate CSV report', error: error.message });
    }
  }
};

// @desc    Download event report as PDF
// @route   GET /api/admin/events/:id/download-pdf
// @access  Admin
exports.downloadEventPDF = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📥 PDF DOWNLOAD STARTED');
    console.log('='.repeat(60));
    console.log('Event ID:', req.params.id);

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log('❌ Event not found');
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    console.log('Event Found:', event.title);

    const bookings = await Booking.find({ eventId: event._id }).populate('userId', 'name email');
    const confirmedBookings = bookings.filter(b => b.status !== 'cancelled');
    
    const ticketsSold = confirmedBookings.reduce((sum, b) => sum + b.ticketQuantity, 0);
    const revenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const occupancyRate = ((ticketsSold / event.totalSeats) * 100).toFixed(2);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const filename = `${event.title.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment;filename="${filename}"`);
    
    console.log('PDF Setup: Headers set, filename:', filename);

    // Handle errors on the response stream
    res.on('error', (err) => {
      console.error('Response stream error:', err.message);
      doc.end();
    });

    // Pipe document to response
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('EVENT REPORT', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Event Details Section
    doc.fontSize(14).font('Helvetica-Bold').text('EVENT DETAILS', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.text(`Event Name: ${event.title}`);
    doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`);
    doc.text(`Time: ${event.time}`);
    doc.text(`Location: ${event.location}`);
    doc.text(`Category: ${event.category}`);
    doc.text(`Ticket Price: LKR ${event.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    doc.moveDown();

    // Sales Summary Section
    doc.fontSize(14).font('Helvetica-Bold').text('SALES SUMMARY', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Seats: ${event.totalSeats}`);
    doc.text(`Tickets Sold: ${ticketsSold}`);
    doc.text(`Tickets Available: ${event.totalSeats - ticketsSold}`);
    doc.text(`Occupancy Rate: ${occupancyRate}%`);
    doc.text(`Total Revenue: LKR ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    doc.moveDown();

    // Bookings Table
    doc.fontSize(14).font('Helvetica-Bold').text('BOOKING DETAILS', { underline: true });
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const col1 = 50, col2 = 150, col3 = 250, col4 = 350, col5 = 420, col6 = 490;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Booking ID', col1, tableTop);
    doc.text('Customer', col2, tableTop);
    doc.text('Tickets', col3, tableTop);
    doc.text('Amount (LKR)', col4, tableTop);
    doc.text('Date', col5, tableTop);
    doc.text('Status', col6, tableTop);

    // Draw separator line
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 25;
    doc.fontSize(9).font('Helvetica');

    confirmedBookings.forEach((booking, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(booking.bookingId, col1, y);
      doc.text(booking.userId.name.substring(0, 15), col2, y);
      doc.text(booking.ticketQuantity.toString(), col3, y);
      doc.text(`${booking.totalAmount.toFixed(2)}`, col4, y);
      doc.text(new Date(booking.createdAt).toLocaleDateString(), col5, y);
      doc.text(booking.status, col6, y);

      y += 15;
    });

    // Footer
    doc.fontSize(10).font('Helvetica').text(
      '--- End of Report ---',
      { align: 'center', y: 750 }
    );

    console.log('✅ PDF Content Generated');
    console.log('Total Bookings:', confirmedBookings.length);
    console.log('='.repeat(60) + '\n');

    // End the document
    doc.end();
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ PDF DOWNLOAD ERROR');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(60) + '\n');
    
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate PDF report', error: error.message });
    } else {
      // Headers already sent, just end the response
      res.end();
    }
  }
};
