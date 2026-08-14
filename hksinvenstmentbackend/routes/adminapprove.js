const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/AppointmentSchema');
const {
    sendAppointmentConfirmation,
    sendRejectionEmail,
    sendAdminNotification
} = require('../models/emailService');

// Helper: Verify admin token
const verifyAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// ============================================
// ROUTE 1: GET /appointments - Get all appointments (with filters)
// URL: /api/admin/appointments?status=pending&date=2026-02-27
// ============================================
router.get('/appointments', verifyAdmin, async (req, res) => {
    try {
        const {
            status,
            date,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 50
        } = req.query;

        let filter = {};

        // Filter by status
        if (status) {
            filter.status = status;
        }

        // Filter by single date
        if (date) {
            filter.date = date;
        }

        // Filter by date range
        if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        }

        // Search by name, email, or phone
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { referenceId: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get total count for pagination
        const total = await Appointment.countDocuments(filter);

        // Get appointments with sorting (newest first)
        const appointments = await Appointment.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        // Format data for frontend
        const formattedAppointments = appointments.map(appt => ({
            id: appt._id,
            referenceId: appt.referenceId,
            name: appt.name,
            email: appt.email,
            phone: appt.phone,
            date: appt.date,
            time: appt.time,
            timeRange: appt.timeRange,
            reason: appt.reason,
            message: appt.message,
            status: appt.status,
            bookedByAdmin: appt.bookedByAdmin,
            createdAt: appt.createdAt,
            reviewedBy: appt.reviewedBy,
            reviewedAt: appt.reviewedAt
        }));

        // Get statistics for filters
        const stats = {
            total: await Appointment.countDocuments(),
            pending: await Appointment.countDocuments({ status: 'pending' }),
            approved: await Appointment.countDocuments({ status: 'approved' }),
            rejected: await Appointment.countDocuments({ status: 'rejected' })
        };

        res.json({
            success: true,
            data: formattedAppointments,
            stats,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments'
        });
    }
});

// ============================================
// ROUTE 2: PATCH /appointments/:id/approve - Approve appointment
// URL: /api/admin/appointments/123abc/approve
// ============================================
router.patch('/appointments/:id/approve', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // Find appointment
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if already approved
        if (appointment.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Appointment is already approved'
            });
        }

        // Check if rejected (can't approve rejected)
        if (appointment.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Cannot approve a rejected appointment'
            });
        }

        // Update status to approved
        appointment.status = 'approved';
        appointment.reviewedBy = req.admin.email || req.admin.id;
        appointment.reviewedAt = new Date();
        await appointment.save();

        console.log(`✅ Appointment ${appointment.referenceId} approved by admin`);

        // Send confirmation email to user (only if not booked by admin)
        if (!appointment.bookedByAdmin) {
            try {
                await sendAppointmentConfirmation(appointment);
                console.log(`   Confirmation email sent to ${appointment.email}`);
            } catch (emailError) {
                console.error('   Error sending confirmation email:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.json({
            success: true,
            message: 'Appointment approved successfully',
            data: {
                id: appointment._id,
                referenceId: appointment.referenceId,
                name: appointment.name,
                email: appointment.email,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status
            }
        });

    } catch (error) {
        console.error('Error approving appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving appointment'
        });
    }
});

// ============================================
// ROUTE 3: PATCH /appointments/:id/reject - Reject appointment
// URL: /api/admin/appointments/123abc/reject
// ============================================
router.patch('/appointments/:id/reject', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Find appointment
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if already rejected
        if (appointment.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Appointment is already rejected'
            });
        }

        // Check if approved (can't reject approved)
        if (appointment.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot reject an approved appointment'
            });
        }

        // Update status to rejected
        appointment.status = 'rejected';
        appointment.reviewedBy = req.admin.email || req.admin.id;
        appointment.reviewedAt = new Date();

        // Add rejection reason to message if provided
        if (reason) {
            appointment.message = appointment.message
                ? `${appointment.message}\n\nRejection Reason: ${reason}`
                : `Rejection Reason: ${reason}`;
        }

        await appointment.save();

        console.log(`❌ Appointment ${appointment.referenceId} rejected by admin`);

        // Send rejection email to user (only if not booked by admin)
        if (!appointment.bookedByAdmin) {
            try {
                await sendRejectionEmail(appointment);
                console.log(`   Rejection email sent to ${appointment.email}`);
            } catch (emailError) {
                console.error('   Error sending rejection email:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.json({
            success: true,
            message: 'Appointment rejected successfully',
            data: {
                id: appointment._id,
                referenceId: appointment.referenceId,
                name: appointment.name,
                email: appointment.email,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status
            }
        });

    } catch (error) {
        console.error('Error rejecting appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting appointment'
        });
    }
});

// ============================================
// ROUTE 4: GET /appointments/:id - Get single appointment details
// URL: /api/admin/appointments/123abc
// ============================================
router.get('/appointments/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id).select('-__v');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: appointment._id,
                referenceId: appointment.referenceId,
                name: appointment.name,
                email: appointment.email,
                phone: appointment.phone,
                date: appointment.date,
                time: appointment.time,
                timeRange: appointment.timeRange,
                reason: appointment.reason,
                message: appointment.message,
                status: appointment.status,
                bookedByAdmin: appointment.bookedByAdmin,
                createdAt: appointment.createdAt,
                reviewedBy: appointment.reviewedBy,
                reviewedAt: appointment.reviewedAt
            }
        });

    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment'
        });
    }
});

// ============================================
// ROUTE 5: GET /stats - Get appointment statistics
// URL: /api/admin/stats
// ============================================
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Get counts by status
        const pending = await Appointment.countDocuments({ status: 'pending' });
        const approved = await Appointment.countDocuments({ status: 'approved' });
        const rejected = await Appointment.countDocuments({ status: 'rejected' });
        const total = pending + approved + rejected;

        // Today's appointments
        const todayAppointments = await Appointment.countDocuments({
            date: todayStr,
            status: { $in: ['pending', 'approved'] }
        });

        // Upcoming appointments (future dates)
        const upcoming = await Appointment.countDocuments({
            date: { $gt: todayStr },
            status: { $in: ['pending', 'approved'] }
        });

        // Recent appointments (last 7 days)
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekStr = lastWeek.toISOString().split('T')[0];

        const recent = await Appointment.countDocuments({
            createdAt: { $gte: lastWeek }
        });

        res.json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected,
                today: todayAppointments,
                upcoming,
                recent
            }
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting statistics'
        });
    }
});

// ============================================
// ROUTE 6: DELETE /appointments/:id - Delete appointment (admin only)
// URL: /api/admin/appointments/123abc
// ============================================
router.delete('/appointments/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        console.log(`🗑️ Appointment ${appointment.referenceId} deleted by admin`);

        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment'
        });
    }
});

module.exports = router;