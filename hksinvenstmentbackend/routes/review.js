// routes/review.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');

// Create transporter - Updated for Hostinger
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

// Validation middleware for review form
const validateReview = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('number').trim().notEmpty().withMessage('Phone number is required').matches(/^[0-9\-\+\(\) ]+$/).withMessage('Invalid phone number'),
    body('review').trim().notEmpty().withMessage('Review is required').isLength({ min: 3 }).withMessage('Review must be at least 3 characters').isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters')
];

// ============================================
// POST /review - Submit review (PUBLIC)
// URL: /review (because index.js uses app.use('/review', reviewRoutes))
// ============================================
router.post('/', validateReview, async (req, res) => {  // ← CHANGED: '/' not '/review'
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, number, review } = req.body;

        console.log('📝 New review received from:', name);

        // Generate reference ID
        const referenceId = 'RV' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        // Save to database
        const newReview = new Review({
            name,
            number,
            review,
            referenceId,
            status: 'pending',
            displayOnWebsite: false
        });

        await newReview.save();
        console.log('   ✅ Review saved to database with ID:', referenceId);

        // ===== SEND EMAIL TO ADMIN =====
        try {
            const transporter = createTransporter();

            const mailOptions = {
                from: `"HKS Investment Website" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `⭐ New Website Review - ${referenceId}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">New Review Received</h1>
                            <p style="color: #d9ccf3; margin-top: 10px;">Reference: ${referenceId}</p>
                        </div>
                        
                        <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #333;">Review Details</h2>
                            
                            <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #5e2690;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px 0; width: 120px;"><strong>From:</strong></td>
                                        <td style="padding: 10px 0;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0;"><strong>Phone:</strong></td>
                                        <td style="padding: 10px 0;">${number}</td>
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
                                        <td style="padding: 10px 0; vertical-align: top;"><strong>Review:</strong></td>
                                        <td style="padding: 10px 0;">
                                            <div style="background: #f0ebfa; padding: 15px; border-radius: 8px; font-style: italic;">
                                                "${review}"
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin-top: 20px; padding: 15px; background: #e6f7e6; border-radius: 10px; border: 1px solid #27ae60;">
                                <p style="margin: 0; color: #27ae60;">
                                    <strong>Status:</strong> Pending Review
                                </p>
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
            message: 'Thank you for your review! We appreciate your feedback.',
            data: {
                referenceId,
                name,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error processing review:', error);

        res.status(500).json({
            success: false,
            message: 'Error submitting review',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// ============================================
// GET /all - Get all reviews (ADMIN ONLY)
// URL: /review/all
// ============================================
router.get('/all', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, displayOnWebsite } = req.query;

        let query = {};
        if (status) query.status = status;
        if (displayOnWebsite !== undefined) query.displayOnWebsite = displayOnWebsite === 'true';

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Review.countDocuments(query);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
});

// ============================================
// GET /public - Get public reviews (display on website)
// URL: /review/public
// ============================================
router.get('/public', async (req, res) => {
    try {
        const reviews = await Review.find({
            displayOnWebsite: true,
            status: 'approved'
        })
            .sort({ createdAt: -1 })
            .select('name review createdAt');

        res.json({
            success: true,
            data: reviews
        });

    } catch (error) {
        console.error('Error fetching public reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
});

// ============================================
// GET /:id - Get single review (ADMIN ONLY)
// URL: /review/:id
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            data: review
        });

    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review'
        });
    }
});

// ============================================
// PATCH /:id/status - Update review status (ADMIN ONLY)
// URL: /review/:id/status
// ============================================
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, displayOnWebsite } = req.body;

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status required (pending, approved, or rejected)'
            });
        }

        const updateData = {
            status,
            ...(status === 'approved' && {
                approvedAt: new Date(),
                displayOnWebsite: displayOnWebsite !== undefined ? displayOnWebsite : true
            }),
            ...(status === 'rejected' && {
                displayOnWebsite: false
            })
        };

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: review
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
// GET /stats/summary - Get review statistics (ADMIN ONLY)
// URL: /review/stats/summary
// ============================================
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Review.countDocuments();
        const pending = await Review.countDocuments({ status: 'pending' });
        const approved = await Review.countDocuments({ status: 'approved' });
        const rejected = await Review.countDocuments({ status: 'rejected' });
        const displayed = await Review.countDocuments({ displayOnWebsite: true });

        // Get last 7 days stats
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekCount = await Review.countDocuments({
            createdAt: { $gte: last7Days }
        });

        res.json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected,
                displayed,
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
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Review service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;