import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FiCalendar,
    FiClock,
    FiUser,
    FiMail,
    FiPhone,
    FiCheckCircle,
    FiXCircle,
    FiClock as FiPending,
    FiFilter,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiRefreshCw,
    FiEye,
    FiMessageSquare,
    FiAlertCircle,
    FiCheck,
    FiX
} from 'react-icons/fi';
import './AdminAppointments.scss';

const AdminAppointments = () => {
    // State
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: '', id: null, reason: '' });
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });
    const [dateFilter, setDateFilter] = useState({
        from: '',
        to: ''
    });
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    // Get auth token
    const getToken = () => {
        return localStorage.getItem('adminToken');
    };


    // Returns YYYY-MM-DD using the browser's LOCAL timezone
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch appointments
    const fetchAppointments = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = getToken();

            let url = `${import.meta.env.VITE_API_URL}/admin/appointments?page=${pagination.page}&limit=${pagination.limit}`;

            // Add filters
            if (filters.status !== 'all') {
                url += `&status=${filters.status}`;
            }
            if (filters.search) {
                url += `&search=${filters.search}`;
            }
            if (dateFilter.from) {
                url += `&startDate=${dateFilter.from}`;
            }
            if (dateFilter.to) {
                url += `&endDate=${dateFilter.to}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setAppointments(data.data);
                setStats(data.stats || {
                    total: data.pagination?.total || 0,
                    pending: data.data.filter(a => a.status === 'pending').length,
                    approved: data.data.filter(a => a.status === 'approved').length,
                    rejected: data.data.filter(a => a.status === 'rejected').length
                });
                setPagination(data.pagination || {
                    page: 1,
                    limit: 20,
                    total: data.data.length,
                    pages: 1
                });
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    }, [filters.status, filters.search, dateFilter.from, dateFilter.to, pagination.page]);

    // Fetch stats
    const fetchStats = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchAppointments();
        fetchStats();
    }, []);

    // Refetch when filters change
    useEffect(() => {
        fetchAppointments();
    }, [filters.status, filters.search, dateFilter.from, dateFilter.to, pagination.page]);

    // Handle approve click
    const handleApproveClick = (appointment) => {
        setConfirmAction({
            type: 'approve',
            id: appointment.id,
            name: appointment.name,
            date: appointment.date,
            time: appointment.time
        });
        setShowConfirmModal(true);
    };

    // Handle reject click
    const handleRejectClick = (appointment) => {
        setConfirmAction({
            type: 'reject',
            id: appointment.id,
            name: appointment.name,
            date: appointment.date,
            time: appointment.time
        });
        setShowRejectionInput(true);
        setShowConfirmModal(true);
    };

    // Confirm action
    const confirmActionHandler = async () => {
        if (isActionLoading) return;

        try {
            setIsActionLoading(true);
            const token = getToken();
            const url = `${import.meta.env.VITE_API_URL}/admin/appointments/${confirmAction.id}/${confirmAction.type}`;

            const body = confirmAction.type === 'reject' && rejectionReason
                ? { reason: rejectionReason }
                : {};

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                await fetchAppointments();
                await fetchStats();
            } else {
                toast.error(data.message || `Failed to ${confirmAction.type} appointment`);
            }
        } catch (error) {
            console.error(`Error ${confirmAction.type}ing appointment:`, error);
            toast.error(`Failed to ${confirmAction.type} appointment`);
        } finally {
            setIsActionLoading(false);
            setShowConfirmModal(false);
            setShowRejectionInput(false);
            setRejectionReason('');
            setConfirmAction({ type: '', id: null, reason: '' });
        }
    };

    // View details
    const handleViewDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };

    const handleQuickFilter = (type) => {
        const today = new Date();
        const fromDate = formatLocalDate(today);   // ✅ local date

        switch (type) {
            case 'today':
                setDateFilter({ from: fromDate, to: fromDate });
                setActiveFilter('today');
                break;
            case 'week':
                const weekLater = new Date(today);
                weekLater.setDate(today.getDate() + 7);
                setDateFilter({
                    from: fromDate,
                    to: formatLocalDate(weekLater)  // ✅ local date
                });
                setActiveFilter('week');
                break;
            case 'month':
                const monthLater = new Date(today);
                monthLater.setMonth(today.getMonth() + 1);
                setDateFilter({
                    from: fromDate,
                    to: formatLocalDate(monthLater)  // ✅ local date
                });
                setActiveFilter('month');
                break;
            default:
                setDateFilter({ from: '', to: '' });
                setActiveFilter('all');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time range
    const getTimeRange = (time) => {
        const hour = parseInt(time.split(':')[0]);
        const nextHour = hour + 1;
        return `${time} - ${nextHour.toString().padStart(2, '0')}:00`;
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge pending"><FiPending /> Pending</span>;
            case 'approved':
                return <span className="status-badge approved"><FiCheckCircle /> Approved</span>;
            case 'rejected':
                return <span className="status-badge rejected"><FiXCircle /> Rejected</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <>
            <ToastContainer position="top-right" theme="colored" />
            <motion.div
                className="admin-appointments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="appointments-header">
                    {/* <motion.span
                        className="appointments-pill"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Admin Panel
                    </motion.span> */}
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Appointment <span>Management</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Review and manage all appointment requests
                    </motion.p>
                </div>

                {/* Stats Cards */}
                <motion.div
                    className="stats-grid"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-card total">
                        <div className="stat-icon">
                            <FiCalendar />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-icon">
                            <FiPending />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value">{stats.pending}</span>
                        </div>
                    </div>
                    <div className="stat-card approved">
                        <div className="stat-icon">
                            <FiCheckCircle />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Approved</span>
                            <span className="stat-value">{stats.approved}</span>
                        </div>
                    </div>
                    <div className="stat-card rejected">
                        <div className="stat-icon">
                            <FiXCircle />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Rejected</span>
                            <span className="stat-value">{stats.rejected}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Filters Section */}
                <motion.div
                    className="filters-section"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="filters-header">
                        <div className="filters-title">
                            <FiFilter className="title-icon" />
                            <h3>Filters</h3>
                        </div>
                    </div>

                    <div className="filters-content">
                        {/* Row 1: Status + From Date + To Date + Search */}
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="filter-select"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>From Date</label>
                                <input
                                    type="date"
                                    value={dateFilter.from}
                                    onChange={(e) => {
                                        setDateFilter({ ...dateFilter, from: e.target.value });
                                        setActiveFilter('custom');
                                    }}
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group">
                                <label>To Date</label>
                                <input
                                    type="date"
                                    value={dateFilter.to}
                                    min={dateFilter.from}
                                    onChange={(e) => {
                                        setDateFilter({ ...dateFilter, to: e.target.value });
                                        setActiveFilter('custom');
                                    }}
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group search-group">
                                <label>Search</label>
                                <div className="search-input-wrapper">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Name, email, phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="filter-input search-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Quick Filters (Left) + Refresh (Right) */}
                        <div className="filter-row-2">
                            <div className="quick-filters-wrapper">
                                <span className="quick-filters-label">Quick:</span>
                                <div className="quick-filters">
                                    <button
                                        className={`quick-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => handleQuickFilter('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`quick-filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
                                        onClick={() => handleQuickFilter('today')}
                                    >
                                        Today
                                    </button>
                                    <button
                                        className={`quick-filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
                                        onClick={() => handleQuickFilter('week')}
                                    >
                                        This Week
                                    </button>
                                    <button
                                        className={`quick-filter-btn ${activeFilter === 'month' ? 'active' : ''}`}
                                        onClick={() => handleQuickFilter('month')}
                                    >
                                        This Month
                                    </button>
                                </div>
                            </div>

                            <button
                                className="refresh-btn"
                                onClick={fetchAppointments}
                            >
                                <FiRefreshCw className={isLoading ? 'spinner' : ''} /> Refresh
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Appointments Table */}
                <motion.div
                    className="appointments-table-section"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading appointments...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="empty-state">
                            <FiAlertCircle />
                            <p>No appointments found</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table className="appointments-table">
                                    <thead>
                                        <tr>
                                            <th>Ref ID</th>
                                            <th>Client</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td className="ref-id">{appointment.referenceId}</td>
                                                <td>
                                                    <div className="client-info">
                                                        <strong>{appointment.name}</strong>
                                                        <span>{appointment.email}</span>
                                                        <span>{appointment.phone}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="datetime-info">
                                                        <span><FiCalendar /> {formatDate(appointment.date)}</span>
                                                        <span><FiClock /> {getTimeRange(appointment.time)}</span>
                                                    </div>
                                                </td>
                                                <td>{getStatusBadge(appointment.status)}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="view-btn"
                                                            onClick={() => handleViewDetails(appointment)}
                                                            title="View Details"
                                                        >
                                                            <FiEye />
                                                        </button>
                                                        {appointment.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    className="approve-btn"
                                                                    onClick={() => handleApproveClick(appointment)}
                                                                    title="Approve"
                                                                >
                                                                    <FiCheckCircle />
                                                                </button>
                                                                <button
                                                                    className="reject-btn"
                                                                    onClick={() => handleRejectClick(appointment)}
                                                                    title="Reject"
                                                                >
                                                                    <FiXCircle />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="pagination">
                                    <button
                                        disabled={pagination.page === 1 || isLoading}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    >
                                        Previous
                                    </button>
                                    <span>Page {pagination.page} of {pagination.pages}</span>
                                    <button
                                        disabled={pagination.page === pagination.pages || isLoading}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>

                {/* Details Modal */}
                <AnimatePresence>
                    {showDetailsModal && selectedAppointment && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailsModal(false)}
                        >
                            <motion.div
                                className="modal-content details-modal"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <h3>Appointment Details</h3>
                                    <button
                                        className="close-btn"
                                        onClick={() => setShowDetailsModal(false)}
                                    >
                                        <FiX />
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="detail-section">
                                        <h4>Reference Information</h4>
                                        <div className="detail-row">
                                            <span className="detail-label">Reference ID:</span>
                                            <span className="detail-value">{selectedAppointment.referenceId}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Status:</span>
                                            <span className="detail-value">{getStatusBadge(selectedAppointment.status)}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Client Information</h4>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiUser /> Name:</span>
                                            <span className="detail-value">{selectedAppointment.name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiMail /> Email:</span>
                                            <span className="detail-value">{selectedAppointment.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiPhone /> Phone:</span>
                                            <span className="detail-value">{selectedAppointment.phone}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Appointment Details</h4>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiCalendar /> Date:</span>
                                            <span className="detail-value">{formatDate(selectedAppointment.date)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiClock /> Time:</span>
                                            <span className="detail-value">{getTimeRange(selectedAppointment.time)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Reason:</span>
                                            <span className="detail-value">{selectedAppointment.reason}</span>
                                        </div>
                                        {selectedAppointment.message && (
                                            <div className="detail-row message-row">
                                                <span className="detail-label"><FiMessageSquare /> Message:</span>
                                                <span className="detail-value message">{selectedAppointment.message}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedAppointment.reviewedBy && (
                                        <div className="detail-section">
                                            <h4>Review Information</h4>
                                            <div className="detail-row">
                                                <span className="detail-label">Reviewed By:</span>
                                                <span className="detail-value">{selectedAppointment.reviewedBy}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Reviewed At:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedAppointment.reviewedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    {selectedAppointment.status === 'pending' && (
                                        <>
                                            <button
                                                className="approve-btn"
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    handleApproveClick(selectedAppointment);
                                                }}
                                                disabled={isActionLoading}
                                            >
                                                <FiCheckCircle /> Approve
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    handleRejectClick(selectedAppointment);
                                                }}
                                                disabled={isActionLoading}
                                            >
                                                <FiXCircle /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="close-modal-btn"
                                        onClick={() => setShowDetailsModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Confirm Modal */}
                <AnimatePresence>
                    {showConfirmModal && confirmAction.id && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                if (!isActionLoading) {
                                    setShowConfirmModal(false);
                                    setShowRejectionInput(false);
                                    setRejectionReason('');
                                }
                            }}
                        >
                            <motion.div
                                className="modal-content confirm-modal"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <h3>{confirmAction.type === 'approve' ? 'Approve Appointment' : 'Reject Appointment'}</h3>
                                </div>

                                <div className="modal-body">
                                    <div className="confirm-icon">
                                        {confirmAction.type === 'approve' ? (
                                            <FiCheckCircle className="approve-icon" />
                                        ) : (
                                            <FiXCircle className="reject-icon" />
                                        )}
                                    </div>

                                    <p className="confirm-message">
                                        Are you sure you want to <strong>{confirmAction.type}</strong> the appointment for <strong>{confirmAction.name}</strong>?
                                    </p>

                                    <p className="confirm-details">
                                        {formatDate(confirmAction.date)} at {getTimeRange(confirmAction.time)}
                                    </p>

                                    {confirmAction.type === 'reject' && showRejectionInput && (
                                        <div className="rejection-reason">
                                            <label>Reason for rejection (optional):</label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Enter reason for rejection..."
                                                rows="3"
                                                disabled={isActionLoading}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => {
                                            if (!isActionLoading) {
                                                setShowConfirmModal(false);
                                                setShowRejectionInput(false);
                                                setRejectionReason('');
                                            }
                                        }}
                                        disabled={isActionLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={confirmAction.type === 'approve' ? 'confirm-approve-btn' : 'confirm-reject-btn'}
                                        onClick={confirmActionHandler}
                                        disabled={isActionLoading}
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <span className="button-spinner"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            confirmAction.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default AdminAppointments;