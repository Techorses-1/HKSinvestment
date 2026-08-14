// models/Career.js
const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
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
    phone: {
        type: String,
        required: true,
        trim: true
    },
    llqpLicense: {
        type: String,
        required: true,
        enum: ['yes', 'no']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'contacted', 'rejected', 'hired'],
        default: 'pending'
    },
    referenceId: {
        type: String,
        unique: true,
        required: true
    },
    adminNotes: {
        type: String,
        trim: true
    },
    reviewedBy: {
        type: String,
        trim: true
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for cooldown check (1 week = 7 days)
careerSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Career', careerSchema);