// routes/career.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Career = require('../models/Career');

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

// Check 1 WEEK cooldown (7 days)
const checkCooldown = async (email) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentApplication = await Career.findOne({
        email: email.toLowerCase(),
        createdAt: { $gte: oneWeekAgo }
    }).sort({ createdAt: -1 });

    if (recentApplication) {
        const daysLeft = Math.ceil((7 * 24 * 60 * 60 * 1000 - (Date.now() - recentApplication.createdAt)) / (24 * 60 * 60 * 1000));
        return {
            blocked: true,
            message: `You have already submitted a job application in the last 7 days. Please wait for our response. (${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining)`,
            lastApplication: recentApplication.createdAt
        };
    }
    return { blocked: false };
};

// Validation
const validateCareer = [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[0-9+\-\s()]*$/).withMessage('Invalid phone number'),
    body('llqpLicense').trim().notEmpty().withMessage('Please select an option').isIn(['yes', 'no']).withMessage('Invalid option')
];

// 1. POST: Submit career application
router.post('/apply', validateCareer, async (req, res) => {
    try {
        // Check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, phone, llqpLicense } = req.body;

        // Check 1 WEEK cooldown
        const cooldownCheck = await checkCooldown(email);
        if (cooldownCheck.blocked) {
            return res.status(429).json({
                success: false,
                message: cooldownCheck.message,
                cooldown: true,
                lastApplication: cooldownCheck.lastApplication
            });
        }

        // Generate reference ID
        const referenceId = 'CAREER' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        // Save to database
        const application = new Career({
            firstName,
            lastName,
            email,
            phone,
            llqpLicense,
            referenceId,
            status: 'pending'
        });

        await application.save();

        // Send emails
        try {
            const transporter = createTransporter();
            const adminEmails = getAdminEmails();

            // Admin email
            await transporter.sendMail({
                from: `"HKS Investment Careers" <${process.env.EMAIL_USER}>`,
                to: adminEmails.join(', '),
                subject: `New Job Application - ${referenceId}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">New Job Application</h1>
                        </div>
                        
                        <div style="padding: 30px; background: #f7f5fb;">
                            <h2 style="color: #333;">Candidate Details</h2>
                            
                            <div style="background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #5e2690;">
                                <p><strong>Reference ID:</strong> ${referenceId}</p>
                                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Phone:</strong> ${phone}</p>
                                <p><strong>LLQP License:</strong> ${llqpLicense === 'yes' ? '✅ Yes' : '❌ No'}</p>
                                <p><strong>Applied:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <div style="background: #e6f7e6; padding: 20px; border-radius: 10px; margin-top: 20px;">
                                <h4 style="color: #27ae60; margin-top: 0;">Next Steps:</h4>
                                <ol style="color: #555;">
                                    <li>Review application within 48 hours</li>
                                    <li>Schedule initial interview if qualified</li>
                                    <li>Update status in admin panel</li>
                                </ol>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="mailto:${email}" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">
                                    Contact Candidate
                                </a>
                            </div>
                        </div>
                    </div>
                `
            });

            // Auto-reply to applicant
            await transporter.sendMail({
                from: `"HKS Investment Careers" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Thank you for your application',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">Application Received!</h1>
                        </div>
                        
                        <div style="padding: 30px; background: #f7f5fb;">
                            <h2 style="color: #333;">Dear ${firstName} ${lastName},</h2>
                            
                            <p>Thank you for your interest in joining HKS Investment! We have received your job application and our HR team will review it shortly.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                <h3 style="color: #5e2690; margin-top: 0;">Application Summary:</h3>
                                <p><strong>Reference ID:</strong> ${referenceId}</p>
                                <p><strong>LLQP License:</strong> ${llqpLicense === 'yes' ? 'Yes' : 'No'}</p>
                                <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>
                            
                            <div style="background: #e6f7e6; padding: 20px; border-radius: 10px;">
                                <h4 style="color: #27ae60; margin-top: 0;">What's Next?</h4>
                                <ul style="color: #555;">
                                    <li>Our HR team will review your application within 5-7 business days</li>
                                    <li>If your profile matches our requirements, we'll contact you for an interview</li>
                                    <li>You can only apply once every 7 days</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 20px;">Best regards,<br><strong>HKS Investment HR Team</strong></p>
                        </div>
                    </div>
                `
            });

        } catch (emailError) {
            console.error('Email error:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully! We will review your application.',
            data: {
                referenceId,
                name: `${firstName} ${lastName}`,
                email
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
});

// 2. GET: All applications for admin
router.get('/all', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, llqpLicense, startDate, endDate } = req.query;
        
        let query = {};
        
        if (status) query.status = status;
        if (llqpLicense) query.llqpLicense = llqpLicense;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const applications = await Career.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Career.countDocuments(query);

        res.json({
            success: true,
            data: applications,
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
            message: 'Error fetching applications'
        });
    }
});

// 3. GET: Single application by ID
router.get('/:id', async (req, res) => {
    try {
        const application = await Career.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: application
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching application'
        });
    }
});

// 4. PATCH: Update application status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        
        if (!status || !['pending', 'reviewed', 'contacted', 'rejected', 'hired'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status required'
            });
        }

        const updateData = {
            status,
            ...(adminNotes && { adminNotes })
        };

        if (status === 'reviewed' || status === 'contacted' || status === 'rejected' || status === 'hired') {
            updateData.reviewedAt = new Date();
        }

        const application = await Career.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated',
            data: application
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
});

// 5. GET: Statistics for HR dashboard
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Career.countDocuments();
        const pending = await Career.countDocuments({ status: 'pending' });
        const reviewed = await Career.countDocuments({ status: 'reviewed' });
        const contacted = await Career.countDocuments({ status: 'contacted' });
        const rejected = await Career.countDocuments({ status: 'rejected' });
        const hired = await Career.countDocuments({ status: 'hired' });
        
        const licensed = await Career.countDocuments({ llqpLicense: 'yes' });
        const unlicensed = await Career.countDocuments({ llqpLicense: 'no' });

        // Last 30 days applications
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentApplications = await Career.countDocuments({
            createdAt: { $gte: last30Days }
        });

        res.json({
            success: true,
            data: {
                total,
                pending,
                reviewed,
                contacted,
                rejected,
                hired,
                licensed,
                unlicensed,
                last30Days: recentApplications
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

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Career service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;