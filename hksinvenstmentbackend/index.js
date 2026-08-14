const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { body, validationResult } = require("express-validator");
const connectDB = require("./config/mongodb");
const Appointment = require("./models/AppointmentSchema");
const { sendAppointmentConfirmation, sendAdminNotification } = require("./models/emailService");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['https://hksinvestment.com', 'http://localhost:5173' , 'https://hksinvestment.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
connectDB();





const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const adminappointmentsRoutes = require('./routes/adminSchedule');
const adminApproveRoutes = require('./routes/adminapprove');
const contactRoutes = require('./routes/contact');
const generalInquiryRoutes = require('./routes/generalInquiry');
const serviceInquiryRoutes = require('./routes/serviceInquiry');
const careerRoutes = require('./routes/career');
const dashboardRoutes = require('./routes/dashboard');
const feedbackRoutes = require('./routes/feedback');
const reviewRoutes = require('./routes/review');




// Use auth routes
app.use('/admin', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/admin', adminappointmentsRoutes);
app.use('/admin', adminApproveRoutes);
app.use('/contact', contactRoutes);
app.use('/general-inquiry', generalInquiryRoutes);
app.use('/service-inquiry', serviceInquiryRoutes);
app.use('/career', careerRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/feed', feedbackRoutes); 
app.use('/review', reviewRoutes); 








// Test route
app.get("/", (req, res) => {
    res.send("HKS Investment Backend Running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Something went wrong!"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));