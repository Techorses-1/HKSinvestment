// routes/contact.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

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

// Get admin emails from environment variables
const getAdminEmails = () => {
    const adminEmails = [];

    if (process.env.ADMIN_EMAIL_1) {
        adminEmails.push(process.env.ADMIN_EMAIL_1);
    }

    if (process.env.ADMIN_EMAIL_2) {
        adminEmails.push(process.env.ADMIN_EMAIL_2);
    }

    if (adminEmails.length === 0) {
        adminEmails.push(process.env.EMAIL_USER);
    }

    return adminEmails;
};

// Check 48-hour cooldown
const checkCooldown = async (email) => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const recentContact = await Contact.findOne({
        email: email.toLowerCase(),
        createdAt: { $gte: fortyEightHoursAgo }
    }).sort({ createdAt: -1 });

    if (recentContact) {
        const hoursLeft = Math.ceil((48 * 60 * 60 * 1000 - (Date.now() - recentContact.createdAt)) / (60 * 60 * 1000));
        return {
            blocked: true,
            message: `You have already contacted us in the last 48 hours. Please wait for our response. (${hoursLeft} hours remaining)`,
            lastContact: recentContact.createdAt
        };
    }

    return { blocked: false };
};

// Validation middleware for contact form
const validateContact = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[0-9+\-\s()]*$/).withMessage('Invalid phone number'),
    body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
];

// Contact form submission
router.post('/contact', validateContact, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, phone, message } = req.body;

        // Check 48-hour cooldown
        const cooldownCheck = await checkCooldown(email);
        if (cooldownCheck.blocked) {
            return res.status(429).json({
                success: false,
                message: cooldownCheck.message,
                cooldown: true,
                lastContact: cooldownCheck.lastContact
            });
        }

        // Generate reference ID
        const referenceId = 'CONT' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        // Save to database
        const contact = new Contact({
            name,
            email,
            phone,
            message: message || '',
            referenceId,
            status: 'pending'
        });

        await contact.save();

        // Get admin emails
        const adminEmails = getAdminEmails();

        // Create email content
        const transporter = createTransporter();

        // Send email to admin
        const mailOptions = {
            from: `"HKS Investment Website" <${process.env.EMAIL_USER}>`,
            to: adminEmails.join(', '),
            subject: `New Contact Form Submission - ${referenceId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Lead Information</h2>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #5e2690;">
                            <h3 style="color: #5e2690; margin-top: 0;">Contact Details:</h3>
                            <p style="margin: 10px 0;"><strong>Reference ID:</strong> ${referenceId}</p>
                            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>
                            ${message ? `<p style="margin: 10px 0;"><strong>Message:</strong> ${message}</p>` : ''}
                            <p style="margin: 10px 0;"><strong>Submitted On:</strong> ${new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                        </div>
                        
                        <div style="background: #e6f7e6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #2ecc71;">
                            <h4 style="color: #27ae60; margin-top: 0;">Action Required:</h4>
                            <ol style="color: #555; padding-left: 20px;">
                                <li>Contact the lead within 24 hours</li>
                                <li>Add to CRM/lead management system</li>
                                <li>Schedule follow-up if needed</li>
                                <li>Update lead status after contact</li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:${email}" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 0 10px;">
                                Contact ${name}
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} HKS Investment. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Contact form email sent:', info.messageId);

        // Send auto-reply to user
        try {
            const userMailOptions = {
                from: `"HKS Investment" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Thank you for contacting HKS Investment`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">Thank You!</h1>
                        </div>
                        
                        <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #333;">Dear ${name},</h2>
                            
                            <p style="color: #555; line-height: 1.6;">
                                Thank you for contacting HKS Investment. We have received your inquiry and one of our advisors will get back to you within 24 hours.
                            </p>
                            
                            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e6dcf7;">
                                <h3 style="color: #5e2690; margin-top: 0;">Your Inquiry Details:</h3>
                                <p style="margin: 10px 0;"><strong>Reference ID:</strong> ${referenceId}</p>
                                <p style="margin: 10px 0;"><strong>Submitted On:</strong> ${new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
                            </div>
                            
                            <div style="background: #e6f7e6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #2ecc71;">
                                <h4 style="color: #27ae60; margin-top: 0;">What's Next?</h4>
                                <ul style="color: #555;">
                                    <li>Our advisor will contact you within 24 hours</li>
                                    <li>Prepare any questions you may have</li>
                                    <li>Have your financial goals ready to discuss</li>
                                </ul>
                            </div>
                            
                            <p style="color: #555; line-height: 1.6;">
                                <strong>Our Contact Information:</strong><br>
                                Email: hk.sangani80@gmail.com<br>
                                Phone: +358 415737082<br>
                                Address: Uomarinne 1 B 20 Vantaa 01600 Uusimaa Finland
                            </p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="mailto:hk.sangani80@gmail.com" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
                                    Contact Support
                                </a>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                            <p>© ${new Date().getFullYear()} HKS Investment. All rights reserved.</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(userMailOptions);
            console.log('Auto-reply email sent to user');

        } catch (userEmailError) {
            console.error('Error sending auto-reply to user:', userEmailError);
            // Don't fail the main request if auto-reply fails
        }

        res.status(200).json({
            success: true,
            message: 'Thank you for your message! We will contact you soon.',
            data: {
                referenceId,
                name,
                email,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error processing contact form:', error);

        res.status(500).json({
            success: false,
            message: 'Error submitting contact form',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET: All contacts for admin
router.get('/all', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;

        let query = {};

        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            data: contacts,
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
            message: 'Error fetching contacts'
        });
    }
});

// GET: Single contact by ID
router.get('/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact'
        });
    }
});

// PATCH: Update contact status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'contacted', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status required'
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated',
            data: contact
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
});

// GET: Contact statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Contact.countDocuments();
        const pending = await Contact.countDocuments({ status: 'pending' });
        const contacted = await Contact.countDocuments({ status: 'contacted' });
        const resolved = await Contact.countDocuments({ status: 'resolved' });

        // Get last 7 days stats
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekCount = await Contact.countDocuments({
            createdAt: { $gte: last7Days }
        });

        res.json({
            success: true,
            data: {
                total,
                pending,
                contacted,
                resolved,
                lastWeek: lastWeekCount
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

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Contact service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;