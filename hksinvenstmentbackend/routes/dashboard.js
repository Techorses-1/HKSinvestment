// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/AppointmentSchema');
const Career = require('../models/Career');
const Contact = require('../models/Contact');
const GeneralInquiry = require('../models/GeneralInquirySchema');
const ServiceInquiry = require('../models/ServiceInquiry');

// ============================================
// GET /dashboard/stats - Get ALL dashboard stats (LIVE DATA - NO DATE FILTERS)
// ============================================
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 Fetching ALL dashboard stats...');

        // ========== DEBUG LOGS ==========
        console.log('🔍 Debug: Today date string (en-CA):', new Date().toLocaleDateString('en-CA'));
        console.log('🔍 Debug: Start of week:', getStartOfWeek());
        console.log('🔍 Debug: End of week:', getEndOfWeek());

        // Sample a few appointments to see what dates are stored
        const sampleAppointments = await Appointment.find({}, { date: 1, status: 1 }).limit(5);
        console.log('🔍 Debug: Sample appointments (date & status):',
            sampleAppointments.map(a => ({ date: a.date, status: a.status }))
        );
        // =================================

        // Run all queries in parallel for better performance
        const [
            appointmentsStats,
            contactsStats,
            careersStats,
            generalInquiriesStats,
            serviceInquiriesStats,
            todayAppointments,
            weekAppointments,
            serviceBreakdown,
            generalReasonBreakdown,
            careerLicenseStats
        ] = await Promise.all([
            // 1. Appointments by status
            Appointment.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 2. Contacts by status
            Contact.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 3. Careers by status
            Career.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 4. General Inquiries by status
            GeneralInquiry.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 5. Service Inquiries by status
            ServiceInquiry.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 6. Today's appointments (LIVE)
            Appointment.countDocuments({
                date: {
                    $eq: new Date().toLocaleDateString('en-CA') // This gives YYYY-MM-DD in local timezone
                },
                status: { $in: ['pending', 'approved'] }
            }),

            // 7. This week's appointments (LIVE)
            Appointment.countDocuments({
                $and: [
                    { date: { $gte: getStartOfWeek() } },
                    { date: { $lte: getEndOfWeek() } },
                    { status: { $in: ['pending', 'approved'] } }
                ]
            }),

            // 8. Service breakdown by type
            ServiceInquiry.aggregate([
                {
                    $group: {
                        _id: '$service',
                        count: { $sum: 1 },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        },
                        contacted: {
                            $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] }
                        },
                        resolved: {
                            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                        }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // 9. General Inquiries by reason
            GeneralInquiry.aggregate([
                {
                    $group: {
                        _id: '$reason',
                        count: { $sum: 1 },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        },
                        contacted: {
                            $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] }
                        },
                        resolved: {
                            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                        }
                    }
                }
            ]),

            // 10. Career LLQP License stats
            Career.aggregate([
                {
                    $group: {
                        _id: '$llqpLicense',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Helper function to format stats
        const formatStats = (data, validStatuses) => {
            const stats = {
                total: 0
            };

            // Initialize all statuses with 0
            validStatuses.forEach(status => {
                stats[status] = 0;
            });

            // Fill in actual counts
            data.forEach(item => {
                if (item._id) {
                    stats[item._id] = item.count;
                    stats.total += item.count;
                }
            });

            return stats;
        };

        // Prepare response
        const response = {
            success: true,
            data: {
                // Quick stats cards data
                quickStats: {
                    appointments: {
                        total: appointmentsStats.reduce((sum, item) => sum + item.count, 0),
                        pending: appointmentsStats.find(s => s._id === 'pending')?.count || 0
                    },
                    contacts: {
                        total: contactsStats.reduce((sum, item) => sum + item.count, 0),
                        pending: contactsStats.find(s => s._id === 'pending')?.count || 0
                    },
                    careers: {
                        total: careersStats.reduce((sum, item) => sum + item.count, 0),
                        pending: careersStats.find(s => s._id === 'pending')?.count || 0
                    },
                    inquiries: {
                        total: (generalInquiriesStats.reduce((sum, item) => sum + item.count, 0)) +
                            (serviceInquiriesStats.reduce((sum, item) => sum + item.count, 0)),
                        pending: (generalInquiriesStats.find(s => s._id === 'pending')?.count || 0) +
                            (serviceInquiriesStats.find(s => s._id === 'pending')?.count || 0)
                    },
                    serviceInquiries: {
                        total: serviceInquiriesStats.reduce((sum, item) => sum + item.count, 0),
                        pending: serviceInquiriesStats.find(s => s._id === 'pending')?.count || 0
                    },
                    generalInquiries: {
                        total: generalInquiriesStats.reduce((sum, item) => sum + item.count, 0),
                        pending: generalInquiriesStats.find(s => s._id === 'pending')?.count || 0
                    },
                },

                // Appointments Analytics
                appointments: {
                    total: appointmentsStats.reduce((sum, item) => sum + item.count, 0),
                    byStatus: formatStats(appointmentsStats, ['pending', 'approved', 'rejected']),
                    today: todayAppointments,
                    thisWeek: weekAppointments
                },

                // Contact Forms Analytics
                contacts: {
                    total: contactsStats.reduce((sum, item) => sum + item.count, 0),
                    byStatus: formatStats(contactsStats, ['pending', 'contacted', 'resolved'])
                },

                // Career Applications
                careers: {
                    total: careersStats.reduce((sum, item) => sum + item.count, 0),
                    byStatus: formatStats(careersStats, ['pending', 'reviewed', 'contacted', 'rejected', 'hired']),
                    llqpStats: {
                        yes: careerLicenseStats.find(l => l._id === 'yes')?.count || 0,
                        no: careerLicenseStats.find(l => l._id === 'no')?.count || 0
                    }
                },

                // Service Inquiries
                serviceInquiries: {
                    total: serviceInquiriesStats.reduce((sum, item) => sum + item.count, 0),
                    byStatus: formatStats(serviceInquiriesStats, ['pending', 'contacted', 'resolved']),
                    byService: serviceBreakdown,
                    mostRequested: serviceBreakdown[0]?._id || 'None',
                    demandTrends: serviceBreakdown.map(s => ({
                        service: s._id,
                        total: s.count,
                        pending: s.pending,
                        contacted: s.contacted,
                        resolved: s.resolved
                    }))
                },

                // General Inquiries
                generalInquiries: {
                    total: generalInquiriesStats.reduce((sum, item) => sum + item.count, 0),
                    byStatus: formatStats(generalInquiriesStats, ['pending', 'contacted', 'resolved']),
                    byReason: generalReasonBreakdown,
                    reasonBreakdown: generalReasonBreakdown.map(r => ({
                        reason: r._id,
                        total: r.count,
                        pending: r.pending,
                        contacted: r.contacted,
                        resolved: r.resolved
                    }))
                }
            }
        };

        console.log('✅ Dashboard stats fetched successfully');
        res.json(response);

    } catch (error) {
        console.error('❌ Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
});
// ============================================
// GET /dashboard/appointments - Detailed appointments data
// ============================================
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .select('name email phone date time status reason referenceId createdAt');

        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments'
        });
    }
});

// ============================================
// GET /dashboard/contacts - Detailed contacts data
// ============================================
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .select('name email phone message status referenceId createdAt');

        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
});

// ============================================
// GET /dashboard/careers - Detailed careers data
// ============================================
router.get('/careers', async (req, res) => {
    try {
        const careers = await Career.find()
            .sort({ createdAt: -1 })
            .select('firstName lastName email phone llqpLicense status referenceId adminNotes createdAt');

        res.json({
            success: true,
            data: careers
        });
    } catch (error) {
        console.error('Error fetching careers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching careers'
        });
    }
});

// ============================================
// GET /dashboard/service-inquiries - Detailed service inquiries
// ============================================
router.get('/service-inquiries', async (req, res) => {
    try {
        const inquiries = await ServiceInquiry.find()
            .sort({ createdAt: -1 })
            .select('name phone email service message status createdAt');

        res.json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching service inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching service inquiries'
        });
    }
});

// ============================================
// GET /dashboard/general-inquiries - Detailed general inquiries
// ============================================
router.get('/general-inquiries', async (req, res) => {
    try {
        const inquiries = await GeneralInquiry.find()
            .sort({ createdAt: -1 })
            .select('name phone email reason message status createdAt');

        res.json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching general inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching general inquiries'
        });
    }
});

// ============================================
// PUT /dashboard/:type/:id/status - Update status
// ============================================
router.put('/:type/:id/status', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status } = req.body;

        let Model;
        switch (type) {
            case 'appointment':
                Model = Appointment;
                break;
            case 'contact':
                Model = Contact;
                break;
            case 'career':
                Model = Career;
                break;
            case 'service':
                Model = ServiceInquiry;
                break;
            case 'general':
                Model = GeneralInquiry;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid type'
                });
        }

        const updated = await Model.findByIdAndUpdate(
            id,
            {
                status,
                ...(type === 'appointment' && status === 'approved' ? { reviewedAt: new Date() } : {})
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Record not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
});

// Helper functions for week calculation - FIXED
function getStartOfWeek() {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
    // Get Monday of current week
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
}

function getEndOfWeek() {
    const today = new Date();
    const day = today.getDay();
    // Get Monday first
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    // Add 6 days to get Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
}

module.exports = router;