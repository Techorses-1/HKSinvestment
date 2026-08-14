const mongoose = require('mongoose');

// All possible 1-hour slots in 24-hour format
const ALL_TIME_SLOTS = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const dailyScheduleSchema = new mongoose.Schema({
    date: {
        type: String,
        required: [true, 'Date is required'],
        unique: true,
        index: true,
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: 'Date must be in YYYY-MM-DD format'
        }
    },
    isOff: {
        type: Boolean,
        default: false
    },
    customSlots: [{
        type: String,
        enum: {
            values: ALL_TIME_SLOTS,
            message: '{VALUE} is not a valid time slot'
        }
    }],
    createdBy: {
        type: String,
        default: 'admin'
    },
    updatedBy: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for slot count
dailyScheduleSchema.virtual('slotCount').get(function() {
    return this.customSlots && this.customSlots.length ? this.customSlots.length : 0;
});

// PRE-SAVE MIDDLEWARE - NO NEXT, USE PROMISE
dailyScheduleSchema.pre('save', async function() {
    // Remove duplicate slots
    if (this.customSlots && this.customSlots.length > 0) {
        this.customSlots = [...new Set(this.customSlots)];
    }

    // Validate based on isOff status
    if (!this.isOff) {
        if (!this.customSlots || this.customSlots.length === 0) {
            throw new Error('At least 1 time slot is required when day is not off');
        }

        if (this.customSlots.length > 20) {
            throw new Error('Cannot select more than 20 time slots per day');
        }
    }
    
    // Just return - no next() needed!
    return;
});

// Index for better query performance
dailyScheduleSchema.index({ date: 1, isOff: 1 });

const DailySchedule = mongoose.model('DailySchedule', dailyScheduleSchema);

module.exports = { DailySchedule, ALL_TIME_SLOTS };