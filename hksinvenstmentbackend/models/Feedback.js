// models/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    feedback: {
        type: String,
        required: [true, 'Feedback is required'],
        trim: true,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
    },
    referenceId: {
        type: String,
        unique: true,
        default: function () {
            return 'FB' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
        }
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed'],
        default: 'pending'
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

// Index for better query performance
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ status: 1 });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;