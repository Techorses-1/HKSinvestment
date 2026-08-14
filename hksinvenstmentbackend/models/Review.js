// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    number: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    review: {
        type: String,
        required: [true, 'Review is required'],
        trim: true,
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    referenceId: {
        type: String,
        unique: true,
        default: function () {
            return 'RV' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: String,
        trim: true
    },
    approvedAt: {
        type: Date
    },
    displayOnWebsite: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ displayOnWebsite: 1 });

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;