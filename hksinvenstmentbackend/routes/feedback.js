// routes/feedback.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

// Create transporter - Updated for Hostinger
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.hostinger.com',  // Hostinger SMTP server
        port: 465,                   // SSL port (or 587 for TLS)
        secure: true,                // true for port 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,     // Your full Hostinger email
            pass: process.env.EMAIL_PASS      // Your Hostinger email password
        },
        tls: {
            rejectUnauthorized: false         // Sometimes needed for Hostinger
        }
    });
};

// Validation middleware for feedback form
const validateFeedback = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('feedback').trim().notEmpty().withMessage('Feedback is required').isLength({ min: 3 }).withMessage('Feedback must be at least 3 characters').isLength({ max: 500 }).withMessage('Feedback cannot exceed 500 characters')
];

// ============================================
// POST /feedback - Submit feedback (PUBLIC)
// ============================================
router.post('/feedback', validateFeedback, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, feedback } = req.body;

        console.log('📝 New feedback received from:', name);

        // Generate reference ID
        const referenceId = 'FB' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        // Save to database
        const newFeedback = new Feedback({
            name,
            feedback,
            referenceId,
            status: 'pending' // pending, reviewed
        });

        await newFeedback.save();
        console.log('   ✅ Feedback saved to database with ID:', referenceId);

        // ===== SEND EMAIL TO ADMIN =====
        try {
            const transporter = createTransporter();

            const mailOptions = {
                from: `"HKS Investment Website" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER, // Only admin email
                subject: `New Website Feedback - ${referenceId}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">New Feedback Received</h1>
                            <p style="color: #d9ccf3; margin-top: 10px;">Reference: ${referenceId}</p>
                        </div>
                        
                        <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #333;">Feedback Details</h2>
                            
                            <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #5e2690;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px 0; width: 120px;"><strong>From:</strong></td>
                                        <td style="padding: 10px 0;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0;"><strong>Date:</strong></td>
                                        <td style="padding: 10px 0;">${new Date().toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; vertical-align: top;"><strong>Feedback:</strong></td>
                                        <td style="padding: 10px 0;">
                                            <div style="background: #f0ebfa; padding: 15px; border-radius: 8px; font-style: italic;">
                                                "${feedback}"
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                            <p>© ${new Date().getFullYear()} HKS Investment. All rights reserved.</p>
                        </div>
                    </div>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('   📧 Admin notification email sent:', info.messageId);

        } catch (emailError) {
            console.error('   ❌ Failed to send admin email:', emailError);
            // Don't fail the request if email fails
        }

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Thank you for your feedback!',
            data: {
                referenceId,
                name,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error processing feedback:', error);

        res.status(500).json({
            success: false,
            message: 'Error submitting feedback',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// ============================================
// GET /feedback/all - Get all feedback (ADMIN ONLY)
// ============================================
router.get('/feedback/all', async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        let query = {};
        if (status) query.status = status;

        const feedbacks = await Feedback.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Feedback.countDocuments(query);

        res.json({
            success: true,
            data: feedbacks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback'
        });
    }
});

// ============================================
// GET /feedback/:id - Get single feedback (ADMIN ONLY)
// ============================================
router.get('/feedback/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback'
        });
    }
});

// ============================================
// PATCH /feedback/:id/status - Update feedback status (ADMIN ONLY)
// ============================================
router.patch('/feedback/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'reviewed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status required (pending or reviewed)'
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: feedback
        });

    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
});

// ============================================
// GET /feedback/stats/summary - Get feedback statistics (ADMIN ONLY)
// ============================================
router.get('/feedback/stats/summary', async (req, res) => {
    try {
        const total = await Feedback.countDocuments();
        const pending = await Feedback.countDocuments({ status: 'pending' });
        const reviewed = await Feedback.countDocuments({ status: 'reviewed' });

        // Get last 7 days stats
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekCount = await Feedback.countDocuments({
            createdAt: { $gte: last7Days }
        });

        res.json({
            success: true,
            data: {
                total,
                pending,
                reviewed,
                lastWeek: lastWeekCount
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// Health check endpoint
router.get('/feedback/health', (req, res) => {
    res.json({
        success: true,
        message: 'Feedback service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;