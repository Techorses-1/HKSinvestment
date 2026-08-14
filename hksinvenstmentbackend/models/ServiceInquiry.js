// models/ServiceInquiry.js
const mongoose = require('mongoose');

const serviceInquirySchema = new mongoose.Schema({
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
    service: {
        type: String,
        required: true,
        enum: [
            "Financial Advising",
            "Systematic Investment Plan",
            "Market-Based Research Plan",
            "Registered Retirement Saving Plan",
            "Wealth Account Management",
            "Tax Optimization"
        ]
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
    timestamps: true
});

// Index for cooldown check
serviceInquirySchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceInquiry', serviceInquirySchema);