const express = require('express');
const router = express.Router();
const { DailySchedule, ALL_TIME_SLOTS } = require('../models/DailySchedule');
const Appointment = require('../models/AppointmentSchema');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateAppointment = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^[0-9\-\+ ]+$/).withMessage('Invalid phone number'),
    body('date').notEmpty().withMessage('Date is required').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
    body('time').trim().notEmpty().withMessage('Time is required').isIn(ALL_TIME_SLOTS).withMessage('Invalid time slot'),
    body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
];

// ============================================
// ROUTE 1: GET /slots/:date - Get available slots (PUBLIC)
// URL: /api/appointments/slots/2026-02-27
// ============================================
router.get('/slots/:date', async (req, res) => {
    try {
        const { date } = req.params;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Date must be in YYYY-MM-DD format'
            });
        }

        console.log('📅 Fetching slots for date:', date);

        // 1. Check if there's a custom schedule from admin
        const schedule = await DailySchedule.findOne({ date: date });

        // 2. Get all active appointments for this date (pending or approved)
        const activeAppointments = await Appointment.find({
            date: date,
            status: { $in: ['pending', 'approved'] }
        }).select('time status');

        const bookedSlots = activeAppointments.map(app => app.time);

        // 3. Determine available slots based on schedule
        let availableSlots = [];
        let isOff = false;
        let scheduleType = 'default';

        if (schedule) {
            if (schedule.isOff) {
                // Admin marked this day as OFF
                isOff = true;
                availableSlots = [];
                scheduleType = 'off';
                console.log('   📍 Day is OFF (custom schedule)');
            } else {
                // Use admin's custom slots
                availableSlots = schedule.customSlots.filter(slot => !bookedSlots.includes(slot));
                scheduleType = 'custom';
                console.log(`   📍 Using custom schedule with ${schedule.customSlots.length} slots`);
            }
        } else {
            // No custom schedule - use default 10:00 to 18:00 slots
            const defaultSlots = ALL_TIME_SLOTS.filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour >= 10 && hour < 18;
            });
            availableSlots = defaultSlots.filter(slot => !bookedSlots.includes(slot));
            scheduleType = 'default';
            console.log(`   📍 Using default schedule (10:00-18:00)`);
        }

        // Format slots for display with time range
        const formattedSlots = availableSlots.map(slot => {
            const hour = parseInt(slot.split(':')[0]);
            const nextHour = hour + 1;
            const nextHourStr = `${nextHour.toString().padStart(2, '0')}:00`;
            return {
                time: slot,
                display: `${slot} - ${nextHourStr}`,
                available: true
            };
        });

        res.json({
            success: true,
            data: {
                date,
                availableSlots: availableSlots,
                formattedSlots,
                bookedSlots,
                totalBookings: bookedSlots.length,
                isOff,
                scheduleType,
                hasCustomSchedule: !!schedule,
                customSlotCount: schedule?.customSlots?.length || 0
            }
        });

    } catch (error) {
        console.error('❌ Error fetching time slots:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching time slots'
        });
    }
});

router.post('/book', validateAppointment, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, phone, date, time, reason, message } = req.body;

        console.log('📝 Booking appointment:', { date, time, email });

        // 1. Check if date is valid and not in past
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (date < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book appointment for past date'
            });
        }

        // 2. Check if this slot is already booked (pending or approved)
        const existingAppointment = await Appointment.findOne({
            date: date,
            time: time,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another time.'
            });
        }

        // 3. Check if date is off or has custom schedule
        const schedule = await DailySchedule.findOne({ date: date });

        if (schedule && schedule.isOff) {
            return res.status(400).json({
                success: false,
                message: 'This date is not available for appointments'
            });
        }

        if (schedule && !schedule.customSlots.includes(time)) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is not available on this date'
            });
        }

        // 4. Create new appointment (always pending by default)
        const appointment = new Appointment({
            name,
            email,
            phone,
            date,
            time,
            reason: reason || "Financial Consultation",
            message: message || '',
            status: 'pending' // Default status
        });

        await appointment.save();

        console.log('   ✅ Appointment created with status: pending');

        // ===== SEND EMAIL TO ADMIN =====
        try {
            const { sendAdminNotification } = require('../models/emailService');
            await sendAdminNotification(appointment);
            console.log('   📧 Admin notification email sent to appointment@hksinvestment.com');
        } catch (emailError) {
            console.error('   ❌ Failed to send admin notification:', emailError);
            // Don't fail the booking if email fails
        }

        // ===== NEW: SEND THANK YOU EMAIL TO USER =====
        try {
            const { sendSubmissionThankYou } = require('../models/emailService');
            await sendSubmissionThankYou(appointment);
            console.log('   📧 Thank you email sent to user');
        } catch (emailError) {
            console.error('   ❌ Failed to send thank you email:', emailError);
            // Don't fail the booking if email fails
        }
        // =========================================

        res.status(201).json({
            success: true,
            message: 'Appointment request submitted successfully! Awaiting approval.',
            data: {
                referenceId: appointment.referenceId,
                name: appointment.name,
                email: appointment.email,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status
            }
        });

    } catch (error) {
        console.error('❌ Error booking appointment:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another time.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error booking appointment'
        });
    }
});

// ============================================
// ROUTE 3: GET /check/:date/:time - Check slot availability (PUBLIC)
// URL: /api/appointments/check/2026-02-27/10:00
// ============================================
router.get('/check/:date/:time', async (req, res) => {
    try {
        const { date, time } = req.params;

        const appointment = await Appointment.findOne({
            date: date,
            time: time,
            status: { $in: ['pending', 'approved'] }
        });

        res.json({
            success: true,
            available: !appointment,
            status: appointment?.status || null
        });

    } catch (error) {
        console.error('Error checking slot:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking slot'
        });
    }
});

// ============================================
// ROUTE 4: GET /status/:referenceId - Check appointment status (PUBLIC)
// URL: /api/appointments/status/APP123456
// ============================================
router.get('/status/:referenceId', async (req, res) => {
    try {
        const { referenceId } = req.params;

        const appointment = await Appointment.findOne({ referenceId: referenceId });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: {
                referenceId: appointment.referenceId,
                name: appointment.name,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status
            }
        });

    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking appointment status'
        });
    }
});

module.exports = router;