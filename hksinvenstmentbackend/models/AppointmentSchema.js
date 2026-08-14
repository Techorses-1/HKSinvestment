const mongoose = require('mongoose');
const { ALL_TIME_SLOTS } = require('./DailySchedule');

const AppointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    date: {
        type: String, // Store as YYYY-MM-DD string to match DailySchedule
        required: [true, 'Date is required'],
        validate: {
            validator: function (value) {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                return value >= todayStr;
            },
            message: 'Date cannot be in the past'
        }
    },
    time: {
        type: String,
        required: [true, 'Time slot is required'],
        enum: ALL_TIME_SLOTS,
        trim: true
    },
    reason: {
        type: String,
        default: "Financial Consultation"
    },
    message: {
        type: String,
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    bookedByAdmin: {
        type: Boolean,
        default: false
    },
    adminEmail: {
        type: String,
        trim: true
    },
    referenceId: {
        type: String,
        unique: true,
        default: function () {
            return 'APP' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
        }
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

// Index for date and time to prevent double bookings (only for non-rejected)
AppointmentSchema.index({ date: 1, time: 1, status: { $ne: 'rejected' } }, {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'approved'] } }
});

// Virtual for formatted time range
AppointmentSchema.virtual('timeRange').get(function () {
    if (!this.time) return '';
    const hour = parseInt(this.time.split(':')[0]);
    const nextHour = hour + 1;
    const nextHourStr = `${nextHour.toString().padStart(2, '0')}:00`;
    return `${this.time} - ${nextHourStr}`;
});

// Method to check if slot is available
AppointmentSchema.methods.isActive = function () {
    return ['pending', 'approved'].includes(this.status);
};

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;