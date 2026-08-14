// routes/generalInquiry.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const GeneralInquiry = require('../models/GeneralInquirySchema');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Get admin emails
const getAdminEmails = () => {
    const adminEmails = [];
    if (process.env.ADMIN_EMAIL_1) adminEmails.push(process.env.ADMIN_EMAIL_1);
    if (process.env.ADMIN_EMAIL_2) adminEmails.push(process.env.ADMIN_EMAIL_2);
    if (adminEmails.length === 0) adminEmails.push(process.env.EMAIL_USER);
    return adminEmails;
};

// Check 48-hour cooldown
const checkCooldown = async (email) => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const recentInquiry = await GeneralInquiry.findOne({
        email: email.toLowerCase(),
        createdAt: { $gte: fortyEightHoursAgo }
    }).sort({ createdAt: -1 });

    if (recentInquiry) {
        const hoursLeft = Math.ceil((48 * 60 * 60 * 1000 - (Date.now() - recentInquiry.createdAt)) / (60 * 60 * 1000));
        return {
            blocked: true,
            message: `You have already submitted an inquiry in the last 48 hours. Please wait for our response. (${hoursLeft} hours remaining)`
        };
    }
    return { blocked: false };
};

// Validation
const validateInquiry = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[0-9+\-\s()]*$/).withMessage('Phone number is not valid'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('reason').trim().notEmpty().withMessage('Please select a reason').isIn(['General Inquiry', 'Investment Advice', 'Account Support', 'Others']).withMessage('Invalid reason selected'),
    body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
];

// 1. POST: Submit general inquiry
router.post('/submit', validateInquiry, async (req, res) => {
    try {
        // Check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, phone, email, reason, message } = req.body;

        // Check 48-hour cooldown
        const cooldownCheck = await checkCooldown(email);
        if (cooldownCheck.blocked) {
            return res.status(429).json({
                success: false,
                message: cooldownCheck.message
            });
        }

        // Save to database
        const inquiry = new GeneralInquiry({
            name,
            phone,
            email,
            reason,
            message: message || ''
        });

        await inquiry.save();

        // Send emails
        try {
            const transporter = createTransporter();
            const adminEmails = getAdminEmails();

            // Generate reference ID (simple)
            const referenceId = 'INQ' + Date.now().toString().slice(-8);

            // Admin email
            await transporter.sendMail({
                from: `"HKS Investment" <${process.env.EMAIL_USER}>`,
                to: adminEmails.join(', '),
                subject: `New General Inquiry - ${referenceId}`,
                html: `
                    <h2>New General Inquiry</h2>
                    <p><strong>Reference:</strong> ${referenceId}</p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                `
            });

            // Auto-reply to user
            await transporter.sendMail({
                from: `"HKS Investment" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Thank you for your inquiry',
                html: `
                    <h2>Dear ${name},</h2>
                    <p>Thank you for contacting HKS Investment. We have received your inquiry and one of our advisors will get back to you within 24 hours.</p>
                    <p><strong>Reference ID:</strong> ${referenceId}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>Best regards,<br>HKS Investment Team</p>
                `
            });
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Don't fail if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully! We will contact you soon.'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting inquiry'
        });
    }
});

// 2. GET: All inquiries for admin (with pagination)
router.get('/all', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;

        let query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const inquiries = await GeneralInquiry.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await GeneralInquiry.countDocuments(query);

        res.json({
            success: true,
            data: inquiries,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inquiries'
        });
    }
});

// 3. GET: Single inquiry by ID
router.get('/:id', async (req, res) => {
    try {
        const inquiry = await GeneralInquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.json({
            success: true,
            data: inquiry
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inquiry'
        });
    }
});

// 4. PATCH: Update inquiry status (admin only)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'contacted', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status required'
            });
        }

        const inquiry = await GeneralInquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated',
            data: inquiry
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
});

module.exports = router;