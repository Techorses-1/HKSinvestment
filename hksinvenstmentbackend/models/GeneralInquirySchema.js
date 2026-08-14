// models/GeneralInquiry.js
const mongoose = require('mongoose');

const generalInquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['General Inquiry', 'Investment Advice', 'Account Support', 'Others']
    },
    message: {
        type: String,
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'resolved'],
        default: 'pending'
    }
}, {
    timestamps: true // This gives createdAt and updatedAt automatically
});

// Index for cooldown check
generalInquirySchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('GeneralInquiry', generalInquirySchema);