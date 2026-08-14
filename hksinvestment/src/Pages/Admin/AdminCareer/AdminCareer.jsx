import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiBriefcase,
    FiCheckCircle,
    FiXCircle,
    FiFilter,
    FiDownload,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiInbox,
    FiAward,
    FiClock,
    FiX
} from 'react-icons/fi';
import './AdminCareer.scss';
import * as XLSX from 'xlsx';

const AdminCareer = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });
    const [filters, setFilters] = useState({
        status: '',
        llqpLicense: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'https://hksinvenstmentbackend.onrender.com/api';

    // Check admin authentication
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin-portal/login');
        }
    }, [navigate]);

    // Fetch data
    useEffect(() => {
        fetchData();
    }, [pagination.page, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');

            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filters.status && { status: filters.status }),
                ...(filters.llqpLicense && { llqpLicense: filters.llqpLicense }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            });

            const response = await fetch(`${API_URL}/career/all?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin-portal/login');
                return;
            }

            const result = await response.json();

            if (result.success) {
                setData(result.data);
                if (result.pagination) {
                    setPagination(result.pagination);
                }
            } else {
                toast.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${API_URL}/career/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin-portal/login');
                return;
            }

            const result = await response.json();

            if (result.success) {
                toast.success('Status updated successfully');
                setData(prevData =>
                    prevData.map(item =>
                        item._id === id ? { ...item, status: newStatus } : item
                    )
                );
                if (selectedItem && selectedItem._id === id) {
                    setSelectedItem({ ...selectedItem, status: newStatus });
                }
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Something went wrong');
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const resetFilters = () => {
        setFilters({
            status: '',
            llqpLicense: '',
            startDate: '',
            endDate: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const exportToExcel = () => {
        const headers = ['Name', 'Email', 'Phone', 'LLQP License', 'Status', 'Date'];
        const rows = data.map(item => [
            `${item.firstName} ${item.lastName}`,
            item.email,
            item.phone,
            item.llqpLicense === 'yes' ? 'Yes' : 'No',
            item.status,
            new Date(item.createdAt).toLocaleDateString()
        ]);

        const worksheetData = [headers, ...rows];
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

        const fileName = `career-applications-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success('Excel file downloaded successfully');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge pending"><FiClock /> Pending</span>;
            case 'reviewed':
                return <span className="status-badge reviewed"><FiCheckCircle /> Reviewed</span>;
            case 'contacted':
                return <span className="status-badge contacted"><FiPhone /> Contacted</span>;
            case 'rejected':
                return <span className="status-badge rejected"><FiXCircle /> Rejected</span>;
            case 'hired':
                return <span className="status-badge hired"><FiAward /> Hired</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'pending';
            case 'reviewed': return 'reviewed';
            case 'contacted': return 'contacted';
            case 'rejected': return 'rejected';
            case 'hired': return 'hired';
            default: return '';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <>
            <ToastContainer position="top-right" theme="colored" />
            <motion.div
                className="admin-career"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div className="career-header" variants={itemVariants}>
                    {/* <motion.span
                        className="career-pill"
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
                        Career <span>Applications</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Manage all job applications and candidate status
                    </motion.p>
                </motion.div>

                {/* Controls Bar */}
                <motion.div className="controls-bar" variants={itemVariants}>
                    <div className="left-controls">
                        <button
                            className={`filter-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        <button className="export-btn" onClick={exportToExcel}>
                            <FiDownload /> Export Excel
                        </button>
                    </div>
                    <div className="right-controls">
                        <button className="refresh-btn" onClick={fetchData}>
                            <FiRefreshCw className={loading ? 'spinner' : ''} /> Refresh
                        </button>
                    </div>
                </motion.div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            className="filters-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="filters-row">
                                <div className="filter-group">
                                    <label>Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="hired">Hired</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>LLQP License</label>
                                    <select
                                        value={filters.llqpLicense}
                                        onChange={(e) => setFilters(prev => ({ ...prev, llqpLicense: e.target.value, page: 1 }))}
                                    >
                                        <option value="">All</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                                    />
                                </div>
                                <div className="filter-group filter-actions">
                                    <button className="reset-filters-btn" onClick={resetFilters}>
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table Title */}
                <motion.div className="table-title" variants={itemVariants}>
                    <h2>Job Applications</h2>
                    <span className="total-count">Total: {pagination.total}</span>
                </motion.div>

                {/* Table */}
                <motion.div className="table-section" variants={itemVariants}>
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading data...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="empty-state">
                            <FiInbox className="empty-icon" />
                            <h3>No applications found</h3>
                            <p>No job applications match your criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table className="career-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>LLQP License</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, index) => (
                                            <motion.tr
                                                key={item._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={updatingId === item._id ? 'updating' : ''}
                                            >
                                                <td className="name-cell">
                                                    <FiUser className="cell-icon" />
                                                    {item.firstName} {item.lastName}
                                                </td>
                                                <td className="email-cell">
                                                    <FiMail className="cell-icon" />
                                                    {item.email}
                                                </td>
                                                <td className="phone-cell">
                                                    <FiPhone className="cell-icon" />
                                                    {item.phone}
                                                </td>
                                                <td>
                                                    <span className={`license-badge ${item.llqpLicense === 'yes' ? 'license-yes' : 'license-no'}`}>
                                                        {item.llqpLicense === 'yes' ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {getStatusBadge(item.status)}
                                                </td>
                                                <td className="date-cell">
                                                    <FiCalendar className="cell-icon" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setShowDetails(true);
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!loading && data.length > 0 && pagination.pages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="page-btn"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                    >
                                        <FiChevronLeft /> Previous
                                    </button>
                                    <span className="page-info">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        className="page-btn"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                    >
                                        Next <FiChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>

                {/* Details Modal */}
                <AnimatePresence>
                    {showDetails && selectedItem && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetails(false)}
                        >
                            <motion.div
                                className="modal-content details-modal"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <h3>Application Details</h3>
                                    <button 
                                        className="close-btn"
                                        onClick={() => setShowDetails(false)}
                                    >
                                        <FiX />
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="detail-section">
                                        <h4>Personal Information</h4>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiUser /> Name:</span>
                                            <span className="detail-value">{selectedItem.firstName} {selectedItem.lastName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiMail /> Email:</span>
                                            <span className="detail-value">{selectedItem.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label"><FiPhone /> Phone:</span>
                                            <span className="detail-value">{selectedItem.phone}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Application Details</h4>
                                        <div className="detail-row">
                                            <span className="detail-label">LLQP License:</span>
                                            <span className="detail-value">
                                                <span className={`license-badge ${selectedItem.llqpLicense === 'yes' ? 'license-yes' : 'license-no'}`}>
                                                    {selectedItem.llqpLicense === 'yes' ? 'Yes' : 'No'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Reference ID:</span>
                                            <span className="detail-value reference-id">{selectedItem.referenceId}</span>
                                        </div>
                                    </div>

                                    {selectedItem.adminNotes && (
                                        <div className="detail-section">
                                            <h4>Admin Notes</h4>
                                            <div className="detail-row">
                                                <span className="detail-value message">{selectedItem.adminNotes}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="detail-section">
                                        <h4>Status & Timeline</h4>
                                        <div className="detail-row">
                                            <span className="detail-label">Status:</span>
                                            <span className="detail-value">{getStatusBadge(selectedItem.status)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Applied:</span>
                                            <span className="detail-value">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Last Updated:</span>
                                            <span className="detail-value">{new Date(selectedItem.updatedAt).toLocaleString()}</span>
                                        </div>
                                        {selectedItem.reviewedAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Reviewed At:</span>
                                                <span className="detail-value">{new Date(selectedItem.reviewedAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <select
                                        className={`status-select ${getStatusColor(selectedItem.status)}`}
                                        value={selectedItem.status}
                                        onChange={(e) => {
                                            handleStatusUpdate(selectedItem._id, e.target.value);
                                            setSelectedItem({ ...selectedItem, status: e.target.value });
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="hired">Hired</option>
                                    </select>
                                    <button
                                        className="close-modal-btn"
                                        onClick={() => setShowDetails(false)}
                                    >
                                        Close
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

export default AdminCareer;