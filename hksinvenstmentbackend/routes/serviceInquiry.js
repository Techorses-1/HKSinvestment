// routes/serviceInquiry.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const ServiceInquiry = require('../models/ServiceInquiry');

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

// Service options list (matching frontend)
const serviceOptions = [
    "Financial Advising",
    "Systematic Investment Plan",
    "Market-Based Research Plan",
    "Registered Retirement Saving Plan",
    "Wealth Account Management",
    "Tax Optimization"
];

// Check 48-hour cooldown
const checkCooldown = async (email) => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const recentInquiry = await ServiceInquiry.findOne({
        email: email.toLowerCase(),
        createdAt: { $gte: fortyEightHoursAgo }
    }).sort({ createdAt: -1 });

    if (recentInquiry) {
        const hoursLeft = Math.ceil((48 * 60 * 60 * 1000 - (Date.now() - recentInquiry.createdAt)) / (60 * 60 * 1000));
        return {
            blocked: true,
            message: `You have already submitted a service inquiry in the last 48 hours. Please wait for our response. (${hoursLeft} hours remaining)`
        };
    }
    return { blocked: false };
};

// Validation
const validateInquiry = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[0-9+\-\s()]*$/).withMessage('Phone number is not valid'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('service').trim().notEmpty().withMessage('Please select a service').isIn(serviceOptions).withMessage('Invalid service selected'),
    body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
];

// 1. POST: Submit service inquiry
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

        const { name, phone, email, service, message } = req.body;

        // Check 48-hour cooldown
        const cooldownCheck = await checkCooldown(email);
        if (cooldownCheck.blocked) {
            return res.status(429).json({
                success: false,
                message: cooldownCheck.message
            });
        }

        // Save to database
        const inquiry = new ServiceInquiry({
            name,
            phone,
            email,
            service,
            message: message || ''
        });

        await inquiry.save();

        // Send emails
        try {
            const transporter = createTransporter();
            const adminEmails = getAdminEmails();

            // Generate reference ID
            const referenceId = 'SVC' + Date.now().toString().slice(-8);

            // Admin email
            await transporter.sendMail({
                from: `"HKS Investment" <${process.env.EMAIL_USER}>`,
                to: adminEmails.join(', '),
                subject: `New Service Inquiry - ${referenceId} - ${service}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">New Service Inquiry</h1>
                        </div>
                        
                        <div style="padding: 30px; background: #f7f5fb;">
                            <h2 style="color: #333;">Service Inquiry Details</h2>
                            
                            <div style="background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #5e2690;">
                                <p><strong>Reference:</strong> ${referenceId}</p>
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Phone:</strong> ${phone}</p>
                                <p><strong>Service:</strong> ${service}</p>
                                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                `
            });

            // Auto-reply to user
            await transporter.sendMail({
                from: `"HKS Investment" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Thank you for your interest in ${service}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">Thank You!</h1>
                        </div>
                        
                        <div style="padding: 30px; background: #f7f5fb;">
                            <h2 style="color: #333;">Dear ${name},</h2>
                            
                            <p>Thank you for your interest in <strong>${service}</strong>. We have received your inquiry and one of our specialists will contact you within 24 hours.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                <h3 style="color: #5e2690; margin-top: 0;">Inquiry Summary:</h3>
                                <p><strong>Reference ID:</strong> ${referenceId}</p>
                                <p><strong>Service:</strong> ${service}</p>
                                <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>
                            
                            <p>Best regards,<br><strong>HKS Investment Team</strong></p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Don't fail if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Service inquiry submitted successfully! We will contact you soon.'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting service inquiry'
        });
    }
});

// 2. GET: All service inquiries for admin
router.get('/all', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, service, startDate, endDate } = req.query;
        
        let query = {};
        
        if (status) query.status = status;
        if (service) query.service = service;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const inquiries = await ServiceInquiry.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await ServiceInquiry.countDocuments(query);

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
            message: 'Error fetching service inquiries'
        });
    }
});

// 3. GET: Single inquiry by ID
router.get('/:id', async (req, res) => {
    try {
        const inquiry = await ServiceInquiry.findById(req.params.id);
        
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

// 4. PATCH: Update inquiry status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['pending', 'contacted', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status required'
            });
        }

        const inquiry = await ServiceInquiry.findByIdAndUpdate(
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

// 5. GET: Service statistics for admin dashboard
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await ServiceInquiry.countDocuments();
        const pending = await ServiceInquiry.countDocuments({ status: 'pending' });
        const contacted = await ServiceInquiry.countDocuments({ status: 'contacted' });
        const resolved = await ServiceInquiry.countDocuments({ status: 'resolved' });
        
        // Get count by service type
        const serviceCounts = await ServiceInquiry.aggregate([
            { $group: { _id: '$service', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                total,
                pending,
                contacted,
                resolved,
                byService: serviceCounts
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;