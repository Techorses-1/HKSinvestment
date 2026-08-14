const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { DailySchedule, ALL_TIME_SLOTS } = require('../models/DailySchedule');

// Helper: Verify admin token
const verifyAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// ============================================
// ROUTE 1: GET /schedule - Fetch schedules
// ============================================
router.get('/schedule', verifyAdmin, async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;

        let query = {};

        if (date) {
            // Single date query - exact string match
            query.date = date;
            console.log('📅 Fetching schedule for date:', date);

        } else if (startDate && endDate) {
            // Date range query - string comparison works naturally with YYYY-MM-DD
            query.date = { 
                $gte: startDate, 
                $lte: endDate 
            };
            console.log('📅 Fetching schedules from', startDate, 'to', endDate);
        }

        const schedules = await DailySchedule.find(query).sort({ date: 1 });

        console.log(`   Found ${schedules.length} schedules`);

        // Format for frontend
        const formattedSchedules = schedules.map(schedule => ({
            id: schedule._id,
            date: schedule.date,
            isOff: schedule.isOff,
            customSlots: schedule.customSlots,
            slotCount: schedule.customSlots?.length || 0,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt
        }));

        res.json({
            success: true,
            data: formattedSchedules
        });

    } catch (error) {
        console.error('❌ Error fetching schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching schedules'
        });
    }
});

// ============================================
// ROUTE 2: POST /schedule - Create or update schedule
// ============================================
router.post('/schedule', verifyAdmin, async (req, res) => {
    try {
        const { date, isOff, customSlots } = req.body;

        // Validation
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Date must be in YYYY-MM-DD format'
            });
        }

        console.log('📝 Saving schedule for date:', date);
        console.log('   isOff:', isOff);
        console.log('   customSlots:', customSlots);

        // Validate customSlots
        if (!isOff) {
            if (!customSlots || !Array.isArray(customSlots) || customSlots.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least 1 time slot is required when day is not off'
                });
            }

            if (customSlots.length > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot select more than 20 time slots per day'
                });
            }

            // Validate each slot exists in ALL_TIME_SLOTS
            const invalidSlots = customSlots.filter(slot => !ALL_TIME_SLOTS.includes(slot));
            if (invalidSlots.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid time slots: ${invalidSlots.join(', ')}`
                });
            }
        }

        // Find by exact date string match
        let schedule = await DailySchedule.findOne({ date: date });

        if (schedule) {
            // UPDATE existing schedule
            console.log('   Found existing schedule with ID:', schedule._id);

            schedule.isOff = isOff || false;
            schedule.customSlots = isOff ? [] : [...new Set(customSlots)];
            schedule.updatedBy = req.admin.email || req.admin.id || 'admin';
            await schedule.save();

            console.log('   ✅ Schedule updated successfully');

            res.json({
                success: true,
                message: 'Schedule updated successfully',
                data: {
                    id: schedule._id,
                    date: schedule.date,
                    isOff: schedule.isOff,
                    customSlots: schedule.customSlots,
                    slotCount: schedule.customSlots?.length || 0
                }
            });
        } else {
            // CREATE new schedule
            console.log('   No existing schedule found, creating new');

            schedule = new DailySchedule({
                date: date,
                isOff: isOff || false,
                customSlots: isOff ? [] : [...new Set(customSlots)],
                createdBy: req.admin.email || req.admin.id || 'admin',
                updatedBy: req.admin.email || req.admin.id || 'admin'
            });

            await schedule.save();

            console.log('   ✅ New schedule created with ID:', schedule._id);

            res.status(201).json({
                success: true,
                message: 'Schedule created successfully',
                data: {
                    id: schedule._id,
                    date: schedule.date,
                    isOff: schedule.isOff,
                    customSlots: schedule.customSlots,
                    slotCount: schedule.customSlots?.length || 0
                }
            });
        }

    } catch (error) {
        console.error('❌ Error saving schedule:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Schedule for this date already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error saving schedule'
        });
    }
});

// ============================================
// ROUTE 3: DELETE /schedule/:date - Delete schedule
// ============================================
router.delete('/schedule/:date', verifyAdmin, async (req, res) => {
    try {
        const { date } = req.params;

        console.log('🗑️ Deleting schedule for date:', date);

        // Delete by exact date string
        const result = await DailySchedule.deleteOne({ date: date });

        if (result.deletedCount === 0) {
            console.log('   ❌ Schedule not found');
            return res.status(404).json({
                success: false,
                message: 'Schedule not found for this date'
            });
        }

        console.log('   ✅ Schedule deleted successfully');

        res.json({
            success: true,
            message: 'Schedule deleted successfully. This date will now use default slots (10:00-18:00).'
        });

    } catch (error) {
        console.error('❌ Error deleting schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting schedule'
        });
    }
});

// ============================================
// ROUTE 4: GET /all-time-slots - Get all available slots
// ============================================
router.get('/all-time-slots', verifyAdmin, (req, res) => {
    res.json({
        success: true,
        data: ALL_TIME_SLOTS
    });
});

// ============================================
// ROUTE 5: GET /check/:date - Check if schedule exists
// ============================================
router.get('/check/:date', verifyAdmin, async (req, res) => {
    try {
        const { date } = req.params;

        const schedule = await DailySchedule.findOne({ date: date });

        res.json({
            success: true,
            exists: !!schedule,
            data: schedule ? {
                id: schedule._id,
                isOff: schedule.isOff,
                customSlots: schedule.customSlots
            } : null
        });

    } catch (error) {
        console.error('Error checking schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking schedule'
        });
    }
});

// ============================================
// ROUTE 6: GET /stats - Get schedule statistics
// ============================================
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const totalSchedules = await DailySchedule.countDocuments();
        const offDays = await DailySchedule.countDocuments({ isOff: true });
        const customDays = await DailySchedule.countDocuments({ isOff: false });

        // Get upcoming schedules (next 30 days)
        const today = new Date();
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);

        const todayStr = today.toISOString().split('T')[0];
        const thirtyDaysStr = thirtyDaysLater.toISOString().split('T')[0];

        const upcomingSchedules = await DailySchedule.countDocuments({
            date: { $gte: todayStr, $lte: thirtyDaysStr }
        });

        res.json({
            success: true,
            data: {
                total: totalSchedules,
                offDays,
                customDays,
                upcoming: upcomingSchedules
            }
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting statistics'
        });
    }
});

module.exports = router;