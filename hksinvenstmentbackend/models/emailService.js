const nodemailer = require('nodemailer');

// Create transporter - Updated for Hostinger (For main system)
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

// Create transporter specifically for APPOINTMENT emails
const createAppointmentTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.hostinger.com',  // Hostinger SMTP server
        port: 465,                   // SSL port (or 587 for TLS)
        secure: true,                // true for port 465, false for 587
        auth: {
            user: process.env.APPOINTMENT_EMAIL_USER,     // Appointment email
            pass: process.env.APPOINTMENT_EMAIL_PASS      // Appointment password
        },
        tls: {
            rejectUnauthorized: false         // Sometimes needed for Hostinger
        }
    });
};

// Get admin email from env (NOW USING APPOINTMENT EMAIL)
const getAdminEmail = () => {
    return process.env.APPOINTMENT_EMAIL_USER;  // ← CHANGED: Now sends to appointment email
};

// Base URL for the website
const BASE_URL = 'https://hksinvestment.com';

// ============================================
// EMAIL 1: Send notification to admin for new appointment
// ============================================
exports.sendAdminNotification = async (appointment) => {
    try {
        const transporter = createAppointmentTransporter();
        const adminEmail = getAdminEmail();  // Now gets appointment email

        const mailOptions = {
            from: `"HKS Investment" <${process.env.APPOINTMENT_EMAIL_USER}>`,
            to: adminEmail,  // ← CHANGED: Now sends to appointment@hksinvestment.com
            subject: `📅 New Appointment Request - ${appointment.referenceId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">New Appointment Request</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Appointment Details:</h2>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #5e2690;">
                            <p style="margin: 10px 0;"><strong>Reference ID:</strong> ${appointment.referenceId}</p>
                            <p style="margin: 10px 0;"><strong>Name:</strong> ${appointment.name}</p>
                            <p style="margin: 10px 0;"><strong>Email:</strong> ${appointment.email}</p>
                            <p style="margin: 10px 0;"><strong>Phone:</strong> ${appointment.phone}</p>
                            <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="margin: 10px 0;"><strong>Time:</strong> ${appointment.time} - ${parseInt(appointment.time.split(':')[0]) + 1}:00</p>
                            <p style="margin: 10px 0;"><strong>Status:</strong> <span style="background: #f39c12; color: white; padding: 4px 12px; border-radius: 20px;">PENDING</span></p>
                            ${appointment.message ? `<p style="margin: 10px 0;"><strong>Message:</strong> ${appointment.message}</p>` : ''}
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${BASE_URL}/admin/appointments" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 0 10px;">
                                View in Dashboard
                            </a>
                            <a href="mailto:${appointment.email}" style="background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 0 10px;">
                                Contact Client
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} HKS Investment. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Admin notification sent: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending admin notification: ', error);
        throw error;
    }
};

// ============================================
// EMAIL 2: Send confirmation email to user (when approved)
// ============================================
exports.sendAppointmentConfirmation = async (appointment) => {
    try {
        const transporter = createAppointmentTransporter();

        const mailOptions = {
            from: `"HKS Investment" <${process.env.APPOINTMENT_EMAIL_USER}>`,
            to: appointment.email,
            subject: `✅ Appointment Confirmed - ${appointment.referenceId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #27ae60, #2ecc71); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Appointment Confirmed!</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Dear ${appointment.name},</h2>
                        
                        <p style="color: #555; line-height: 1.6;">
                            Great news! Your appointment with HKS Investment has been <strong style="color: #27ae60;">confirmed</strong>.
                        </p>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #27ae60;">
                            <h3 style="color: #27ae60; margin-top: 0;">Appointment Details:</h3>
                            <p style="margin: 10px 0;"><strong>Reference ID:</strong> ${appointment.referenceId}</p>
                            <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="margin: 10px 0;"><strong>Time:</strong> ${appointment.time} - ${parseInt(appointment.time.split(':')[0]) + 1}:00</p>
                            <p style="margin: 10px 0;"><strong>Duration:</strong> 1 hour</p>
                        </div>
                        
                        <div style="background: #e6f7e6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #2ecc71;">
                            <h4 style="color: #27ae60; margin-top: 0;">📋 What to Prepare:</h4>
                            <ul style="color: #555;">
                                <li>Any financial documents you'd like to discuss</li>
                                <li>Questions about investments or planning</li>
                                <li>Notepad for taking notes</li>
                            </ul>
                        </div>
                        
                        <p style="color: #555; line-height: 1.6;">
                            <strong>📍 Location:</strong><br>
                            Halifax, NS, Canada
                        </p>
                        
                        <p style="color: #555; line-height: 1.6;">
                            <strong>📞 Contact:</strong><br>
                            Phone: +1 782-882-8102<br>
                            Email: ${process.env.APPOINTMENT_EMAIL_USER}
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:${process.env.APPOINTMENT_EMAIL_USER}" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
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

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Confirmation email sent to user: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending confirmation email: ', error);
        throw error;
    }
};

// ============================================
// EMAIL 3: Send rejection email to user (when rejected)
// ============================================
exports.sendRejectionEmail = async (appointment) => {
    try {
        const transporter = createAppointmentTransporter();

        const mailOptions = {
            from: `"HKS Investment" <${process.env.APPOINTMENT_EMAIL_USER}>`,
            to: appointment.email,
            subject: `❌ Appointment Update - ${appointment.referenceId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #e74c3c, #c0392b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Appointment Update</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #fef5f5; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Dear ${appointment.name},</h2>
                        
                        <p style="color: #555; line-height: 1.6;">
                            Thank you for your interest in HKS Investment. Unfortunately, we are unable to schedule your requested appointment at this time.
                        </p>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #e74c3c;">
                            <h3 style="color: #e74c3c; margin-top: 0;">Appointment Details:</h3>
                            <p style="margin: 10px 0;"><strong>Reference ID:</strong> ${appointment.referenceId}</p>
                            <p style="margin: 10px 0;"><strong>Requested Date:</strong> ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="margin: 10px 0;"><strong>Requested Time:</strong> ${appointment.time} - ${parseInt(appointment.time.split(':')[0]) + 1}:00</p>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #ffc107;">
                            <h4 style="color: #856404; margin-top: 0;">📅 What's Next:</h4>
                            <ul style="color: #555;">
                                <li>Your time slot is now available for other clients</li>
                                <li>You can book a different time slot</li>
                                <li>Contact us if you need assistance</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${BASE_URL}/contact" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 0 10px;">
                                Book New Time
                            </a>
                            <a href="mailto:${process.env.APPOINTMENT_EMAIL_USER}" style="background: #7a3db8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 0 10px;">
                                Contact Us
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} HKS Investment. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Rejection email sent to user: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending rejection email: ', error);
        throw error;
    }
};

// ============================================
// EMAIL 4: Send reminder email (24h before appointment)
// ============================================
exports.sendReminderEmail = async (appointment) => {
    try {
        const transporter = createAppointmentTransporter();

        const mailOptions = {
            from: `"HKS Investment" <${process.env.APPOINTMENT_EMAIL_USER}>`,
            to: appointment.email,
            subject: `⏰ Appointment Reminder - ${appointment.referenceId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #f39c12, #e67e22); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Appointment Reminder</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Dear ${appointment.name},</h2>
                        
                        <p style="color: #555; line-height: 1.6;">
                            This is a friendly reminder about your appointment <strong>tomorrow</strong> with HKS Investment.
                        </p>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #f39c12;">
                            <h3 style="color: #f39c12; margin-top: 0;">Appointment Details:</h3>
                            <p style="margin: 10px 0;"><strong>Reference ID:</strong> ${appointment.referenceId}</p>
                            <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="margin: 10px 0;"><strong>Time:</strong> ${appointment.time} - ${parseInt(appointment.time.split(':')[0]) + 1}:00</p>
                            <p style="margin: 10px 0;"><strong>Location:</strong> Halifax, NS, Canada</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:${process.env.APPOINTMENT_EMAIL_USER}" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
                                Need to Reschedule?
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} HKS Investment. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Reminder email sent: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending reminder email: ', error);
        throw error;
    }
};

// ============================================
// EMAIL 5: NEW - Send thank you email to user on submission
// ============================================
exports.sendSubmissionThankYou = async (appointment) => {
    try {
        const transporter = createAppointmentTransporter();

        const mailOptions = {
            from: `"HKS Investment" <${process.env.APPOINTMENT_EMAIL_USER}>`,
            to: appointment.email,
            subject: `🙏 Thank You for Your Appointment Request - ${appointment.referenceId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #5e2690, #7a3db8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Thank You for Your Request!</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f7f5fb; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Dear ${appointment.name},</h2>
                        
                        <p style="color: #555; line-height: 1.6;">
                            Thank you for scheduling an appointment with <strong>HKS Investment</strong>.
                        </p>
                        
                        <p style="color: #555; line-height: 1.6;">
                            We have received your appointment request. Our team will review and confirm your appointment shortly.
                        </p>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #5e2690;">
                            <h3 style="color: #5e2690; margin-top: 0;">📋 Your Appointment Details:</h3>
                            <p style="margin: 10px 0;"><strong>Reference ID:</strong> ${appointment.referenceId}</p>
                            <p style="margin: 10px 0;"><strong>Name:</strong> ${appointment.name}</p>
                            <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="margin: 10px 0;"><strong>Time:</strong> ${appointment.time} - ${parseInt(appointment.time.split(':')[0]) + 1}:00</p>
                            <p style="margin: 10px 0;"><strong>Status:</strong> <span style="background: #f39c12; color: white; padding: 4px 12px; border-radius: 20px;">PENDING REVIEW</span></p>
                        </div>
                        
                        <div style="background: #f0e6f6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #5e2690;">
                            <h4 style="color: #5e2690; margin-top: 0;">📌 What Happens Next?</h4>
                            <ul style="color: #555;">
                                <li>Our team will review your request</li>
                                <li>You will receive a confirmation email with final details</li>
                                <li>If you need to make changes, contact us using the details below</li>
                            </ul>
                        </div>
                        
                        <p style="color: #555; line-height: 1.6;">
                            <strong>📍 Location:</strong><br>
                            Halifax, NS, Canada
                        </p>
                        
                        <p style="color: #555; line-height: 1.6;">
                            <strong>📞 Contact:</strong><br>
                            Phone: +1 782-882-8102<br>
                            Email: ${process.env.APPOINTMENT_EMAIL_USER}
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:${process.env.APPOINTMENT_EMAIL_USER}" style="background: #5e2690; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
                                Contact Support
                            </a>
                        </div>
                        
                        <p style="color: #888; font-size: 14px; text-align: center; margin-top: 20px;">
                            This is an automated confirmation. Please do not reply to this email.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} HKS Investment. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Thank you email sent to user: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending thank you email: ', error);
        throw error;
    }
};