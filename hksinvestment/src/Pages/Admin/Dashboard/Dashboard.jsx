import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
    FiCalendar,
    FiMail,
    FiBriefcase,
    FiUsers,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiTrendingUp,
    FiDownload,
    FiRefreshCw,
    FiEye,
    FiPhone,
    FiUser,
    FiMessageSquare,
    FiPieChart,
    FiBarChart2,
    FiActivity,
    FiGitMerge
} from 'react-icons/fi';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area,
    RadialBarChart, RadialBar,
    ComposedChart, Sankey
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import './Dashboard.scss';

const Dashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedType, setSelectedType] = useState(null);
    const [detailsData, setDetailsData] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // NEW COLOR PALETTE - COMPLETELY DIFFERENT COLORS
    const COLORS = {
        // APPOINTMENTS (3 different colors)
        pending: '#f39c12',      // GOLDEN YELLOW 🟡
        approved: '#2ecc71',     // EMERALD GREEN 🟢
        rejected: '#e74c3c',     // RED 🔴

        // CAREERS (4 different colors)
        contacted: '#3498db',    // BRIGHT BLUE 🔵
        hired: '#2ecc71',        // EMERALD GREEN 🟢

        // SERVICE INQUIRIES (3 different colors)
        resolved: '#8e44ad',     // DEEP PURPLE 🟣

        // GENERAL INQUIRIES (reuse colors)
        reviewed: '#3498db',     // BRIGHT BLUE 🔵
        general: '#f39c12',      // GOLDEN YELLOW 🟡
        support: '#e74c3c',      // RED 🔴
        inquiry: '#8e44ad'       // DEEP PURPLE 🟣
    }


    // Fetch all stats on component mount
    useEffect(() => {
        fetchDashboardStats();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin-portal/login');
        }
    }, [navigate]);

    // Fetch details when tab changes
    useEffect(() => {
        if (activeTab !== 'overview') {
            fetchDetails(activeTab);
        }
    }, [activeTab]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
                console.log('Dashboard stats:', data.data);
            } else {
                toast.error('Failed to load dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (type) => {
        try {
            setLoadingDetails(true);
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/${type}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setDetailsData(data.data);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            toast.error(`Failed to load ${type} details`);
        } finally {
            setLoadingDetails(false);
        }
    };

    const updateStatus = async (type, id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/${type}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Status updated successfully!');
                fetchDashboardStats();
                if (activeTab !== 'overview') {
                    fetchDetails(activeTab);
                }
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
        }
    };

    const exportToExcel = () => {
        try {
            if (activeTab === 'overview') {
                const workbook = XLSX.utils.book_new();

                const appointmentsHeaders = ['Reference ID', 'Name', 'Email', 'Phone', 'Date', 'Time', 'Status'];
                const appointmentsRows = (stats?.appointments?.recentData || []).map(item => [
                    item.referenceId || 'N/A',
                    item.name || 'N/A',
                    item.email || 'N/A',
                    item.phone || 'N/A',
                    item.date || 'N/A',
                    item.time || 'N/A',
                    item.status || 'N/A'
                ]);
                const appointmentsSheet = XLSX.utils.aoa_to_sheet([appointmentsHeaders, ...appointmentsRows]);
                XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments');

                const careersHeaders = ['Name', 'Email', 'Phone', 'LLQP License', 'Status', 'Date'];
                const careersRows = (stats?.careers?.recentData || []).map(item => [
                    `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A',
                    item.email || 'N/A',
                    item.phone || 'N/A',
                    item.llqpLicense === 'yes' ? 'Yes' : 'No',
                    item.status || 'N/A',
                    item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
                ]);
                const careersSheet = XLSX.utils.aoa_to_sheet([careersHeaders, ...careersRows]);
                XLSX.utils.book_append_sheet(workbook, careersSheet, 'Careers');

                const serviceHeaders = ['Name', 'Service', 'Email', 'Phone', 'Message', 'Status', 'Date'];
                const serviceRows = (stats?.serviceInquiries?.recentData || []).map(item => [
                    item.name || 'N/A',
                    item.service || 'N/A',
                    item.email || 'N/A',
                    item.phone || 'N/A',
                    item.message ? item.message.substring(0, 50) + '...' : 'N/A',
                    item.status || 'N/A',
                    item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
                ]);
                const serviceSheet = XLSX.utils.aoa_to_sheet([serviceHeaders, ...serviceRows]);
                XLSX.utils.book_append_sheet(workbook, serviceSheet, 'Service Inquiries');

                const generalHeaders = ['Name', 'Reason', 'Email', 'Phone', 'Message', 'Status', 'Date'];
                const generalRows = (stats?.generalInquiries?.recentData || []).map(item => [
                    item.name || 'N/A',
                    item.reason || 'N/A',
                    item.email || 'N/A',
                    item.phone || 'N/A',
                    item.message ? item.message.substring(0, 50) + '...' : 'N/A',
                    item.status || 'N/A',
                    item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
                ]);
                const generalSheet = XLSX.utils.aoa_to_sheet([generalHeaders, ...generalRows]);
                XLSX.utils.book_append_sheet(workbook, generalSheet, 'General Inquiries');

                const fileName = `all-data-${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(workbook, fileName);
                toast.success('All data exported successfully with multiple sheets!');
            } else {
                let headers = [];
                let rows = [];
                let sheetName = '';

                switch (activeTab) {
                    case 'appointments':
                        sheetName = 'Appointments';
                        headers = ['Reference ID', 'Name', 'Email', 'Phone', 'Date', 'Time', 'Status'];
                        rows = detailsData.map(item => [
                            item.referenceId || 'N/A',
                            item.name || 'N/A',
                            item.email || 'N/A',
                            item.phone || 'N/A',
                            item.date || 'N/A',
                            item.time || 'N/A',
                            item.status || 'N/A'
                        ]);
                        break;

                    case 'careers':
                        sheetName = 'Careers';
                        headers = ['Name', 'Email', 'Phone', 'LLQP License', 'Status', 'Date'];
                        rows = detailsData.map(item => [
                            `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A',
                            item.email || 'N/A',
                            item.phone || 'N/A',
                            item.llqpLicense === 'yes' ? 'Yes' : 'No',
                            item.status || 'N/A',
                            item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
                        ]);
                        break;

                    case 'service-inquiries':
                        sheetName = 'Service Inquiries';
                        headers = ['Name', 'Service', 'Email', 'Phone', 'Message', 'Status', 'Date'];
                        rows = detailsData.map(item => [
                            item.name || 'N/A',
                            item.service || 'N/A',
                            item.email || 'N/A',
                            item.phone || 'N/A',
                            item.message || 'N/A',
                            item.status || 'N/A',
                            item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
                        ]);
                        break;

                    case 'general-inquiries':
                        sheetName = 'General Inquiries';
                        headers = ['Name', 'Reason', 'Email', 'Phone', 'Message', 'Status', 'Date'];
                        rows = detailsData.map(item => [
                            item.name || 'N/A',
                            item.reason || 'N/A',
                            item.email || 'N/A',
                            item.phone || 'N/A',
                            item.message || 'N/A',
                            item.status || 'N/A',
                            item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
                        ]);
                        break;

                    default:
                        return;
                }

                const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

                const fileName = `${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(workbook, fileName);
                toast.success(`${sheetName} data exported successfully!`);
            }
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Failed to export data');
        }
    };

    // Prepare data for charts
    const prepareAppointmentData = () => {
        return [
            { name: 'Pending', value: stats?.appointments?.byStatus?.pending || 0, color: COLORS.pending },
            { name: 'Approved', value: stats?.appointments?.byStatus?.approved || 0, color: COLORS.approved },
            { name: 'Rejected', value: stats?.appointments?.byStatus?.rejected || 0, color: COLORS.rejected }
        ].filter(item => item.value > 0);
    };

    const prepareCareerData = () => {
        // 4 statuses: Pending, Contacted, Rejected, Hired
        return [
            { name: 'Pending', value: stats?.careers?.byStatus?.pending || 0, color: COLORS.pending },
            { name: 'Contacted', value: stats?.careers?.byStatus?.contacted || 0, color: COLORS.contacted },
            { name: 'Rejected', value: stats?.careers?.byStatus?.rejected || 0, color: COLORS.rejected },
            { name: 'Hired', value: stats?.careers?.byStatus?.hired || 0, color: COLORS.hired }
        ].filter(item => item.value > 0);
    };

    const prepareServiceData = () => {
        const data = [
            { name: 'Pending', value: stats?.serviceInquiries?.byStatus?.pending || 0, color: COLORS.pending },
            { name: 'Contacted', value: stats?.serviceInquiries?.byStatus?.contacted || 0, color: COLORS.contacted },
            { name: 'Resolved', value: stats?.serviceInquiries?.byStatus?.resolved || 0, color: COLORS.resolved }
        ].filter(item => item.value > 0);

        const total = data.reduce((sum, item) => sum + item.value, 0);
        return data.map(item => ({
            ...item,
            percentage: total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
        }));
    };

    const prepareGeneralData = () => {
        const reasons = stats?.generalInquiries?.byReason || [];
        return reasons.map(reason => ({
            name: reason._id,
            pending: reason.pending,
            contacted: reason.contacted,
            resolved: reason.resolved,
            total: reason.count
        }));
    };

    // Find most requested reason
    const getMostRequestedReason = () => {
        const reasons = stats?.generalInquiries?.byReason || [];
        if (reasons.length === 0) return 'N/A';

        const mostRequested = reasons.reduce((max, item) =>
            item.count > (max.count || 0) ? item : max, {});
        return mostRequested._id || 'N/A';
    };

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <div className="dashboard-loading">
                    <FiRefreshCw className="spinner" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" theme="colored" />
            <motion.div
                className="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="dashboard-header">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1>Dashboard <span>Overview</span></h1>
                        <p>Welcome back! Here's your complete overview.</p>
                    </motion.div>
                    <div className="header-actions">
                        <motion.button
                            className="refresh-btn"
                            onClick={fetchDashboardStats}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiRefreshCw className={loading ? 'spinner' : ''} /> Refresh
                        </motion.button>
                        <motion.button
                            className="export-btn"
                            onClick={exportToExcel}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiDownload /> Export
                        </motion.button>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="stats-grid">
                    <motion.div
                        className="stat-card appointments"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="stat-icon">
                            <FiCalendar />
                        </div>
                        <div className="stat-content">
                            <h3>Appointments</h3>
                            <div className="stat-numbers">
                                <span className="total">{stats?.quickStats?.appointments?.total || 0}</span>
                                <span className="badge pending">
                                    {stats?.quickStats?.appointments?.pending || 0} pending
                                </span>
                            </div>
                            <div className="stat-footer">
                                <FiClock /> {stats?.appointments?.today || 0} today
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card careers"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="stat-icon">
                            <FiBriefcase />
                        </div>
                        <div className="stat-content">
                            <h3>Careers</h3>
                            <div className="stat-numbers">
                                <span className="total">{stats?.quickStats?.careers?.total || 0}</span>
                                <span className="badge pending">
                                    {stats?.quickStats?.careers?.pending || 0} pending
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card service-inquiries"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="stat-icon">
                            <FiTrendingUp />
                        </div>
                        <div className="stat-content">
                            <h3>Service Inquiries</h3>
                            <div className="stat-numbers">
                                <span className="total">{stats?.quickStats?.serviceInquiries?.total || 0}</span>
                                <span className="badge pending">
                                    {stats?.quickStats?.serviceInquiries?.pending || 0} pending
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card general-inquiries"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="stat-icon">
                            <FiMessageSquare />
                        </div>
                        <div className="stat-content">
                            <h3>General Inquiries</h3>
                            <div className="stat-numbers">
                                <span className="total">{stats?.quickStats?.generalInquiries?.total || 0}</span>
                                <span className="badge pending">
                                    {stats?.quickStats?.generalInquiries?.pending || 0} pending
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs Navigation */}
                <div className="dashboard-tabs">
                    <motion.button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                        whileHover={{ y: -2 }}
                    >
                        <FiPieChart /> Overview
                    </motion.button>
                    <motion.button
                        className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appointments')}
                        whileHover={{ y: -2 }}
                    >
                        <FiCalendar /> Appointments
                    </motion.button>
                    <motion.button
                        className={`tab-btn ${activeTab === 'careers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('careers')}
                        whileHover={{ y: -2 }}
                    >
                        <FiBriefcase /> Careers
                    </motion.button>
                    <motion.button
                        className={`tab-btn ${activeTab === 'service-inquiries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('service-inquiries')}
                        whileHover={{ y: -2 }}
                    >
                        <FiTrendingUp /> Services
                    </motion.button>
                    <motion.button
                        className={`tab-btn ${activeTab === 'general-inquiries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general-inquiries')}
                        whileHover={{ y: -2 }}
                    >
                        <FiMessageSquare /> General
                    </motion.button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="tab-content"
                    >
                        {activeTab === 'overview' && (
                            <div className="overview-tab-new">
                                {/* 2x2 Grid Layout for Overview */}
                                <div className="analytics-grid-2x2">

                                    {/* Card 1: Appointments - Doughnut Chart */}
                                    <motion.div
                                        className="analytics-card-modern"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.5 }}
                                        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(122, 61, 184, 0.15)' }}
                                    >
                                        <div className="card-header">
                                            <div className="header-left">
                                                <FiCalendar className="card-icon" />
                                                <h3>Appointments</h3>
                                            </div>
                                            <span className="total-badge">{stats?.appointments?.total || 0}</span>
                                        </div>

                                        <div className="card-stats-mini">
                                            <div className="mini-stat">
                                                <span className="label">Today</span>
                                                <span className="value">{stats?.appointments?.today || 0}</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="label">This Week</span>
                                                <span className="value">{stats?.appointments?.thisWeek || 0}</span>
                                            </div>
                                        </div>

                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie
                                                        data={prepareAppointmentData()}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        labelLine={true}
                                                    >
                                                        {prepareAppointmentData().map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: 'white',
                                                            border: '2px solid #efe8fb',
                                                            borderRadius: '10px',
                                                            fontFamily: 'Content, serif'
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="status-legend">
                                            {prepareAppointmentData().map((item, idx) => (
                                                <div className="legend-item" key={idx}>
                                                    <span className="color-dot" style={{ background: item.color }}></span>
                                                    <span className="legend-label">{item.name}</span>
                                                    <span className="legend-value">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Card 2: Careers - Bar Chart with 4 statuses */}
                                    <motion.div
                                        className="analytics-card-modern"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.5 }}
                                        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)' }}
                                    >
                                        <div className="card-header">
                                            <div className="header-left">
                                                <FiBriefcase className="card-icon" />
                                                <h3>Careers</h3>
                                            </div>
                                            <span className="total-badge">{stats?.careers?.total || 0}</span>
                                        </div>

                                        <div className="card-stats-mini">
                                            <div className="mini-stat">
                                                <span className="label">LLQP Holders</span>
                                                <span className="value">{stats?.careers?.llqpStats?.yes || 0}</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="label">Non-LLQP</span>
                                                <span className="value">{stats?.careers?.llqpStats?.no || 0}</span>
                                            </div>
                                        </div>

                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart
                                                    data={prepareCareerData()}
                                                    layout="vertical"
                                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        width={80}
                                                        tick={{ fontFamily: 'Content, serif', fontSize: 12 }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: 'white',
                                                            border: '2px solid #efe8fb',
                                                            borderRadius: '10px',
                                                            fontFamily: 'Content, serif'
                                                        }}
                                                    />
                                                    <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                                        {prepareCareerData().map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="status-legend">
                                            {prepareCareerData().map((item, idx) => (
                                                <div className="legend-item" key={idx}>
                                                    <span className="color-dot" style={{ background: item.color }}></span>
                                                    <span className="legend-label">{item.name}</span>
                                                    <span className="legend-value">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Card 3: Service Inquiries - Composed Chart */}
                                    <motion.div
                                        className="analytics-card-modern"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.5 }}
                                        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.15)' }}
                                    >
                                        <div className="card-header">
                                            <div className="header-left">
                                                <FiTrendingUp className="card-icon" />
                                                <h3>Service Inquiries</h3>
                                            </div>
                                            <span className="total-badge">{stats?.serviceInquiries?.total || 0}</span>
                                        </div>

                                        <div className="card-stats-mini">
                                            <div className="mini-stat">
                                                <span className="label">Pending</span>
                                                <span className="value pending">{stats?.serviceInquiries?.byStatus?.pending || 0}</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="label">Contacted</span>
                                                <span className="value contacted">{stats?.serviceInquiries?.byStatus?.contacted || 0}</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="label">Resolved</span>
                                                <span className="value resolved">{stats?.serviceInquiries?.byStatus?.resolved || 0}</span>
                                            </div>
                                        </div>

                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={200}>
                                                <ComposedChart
                                                    data={prepareServiceData()}
                                                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                                >
                                                    <CartesianGrid stroke="#f5f5f5" />
                                                    <XAxis dataKey="name" scale="band" />
                                                    <YAxis />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: 'white',
                                                            border: '2px solid #efe8fb',
                                                            borderRadius: '10px',
                                                            fontFamily: 'Content, serif'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="value" barSize={30} fill={COLORS.contacted} radius={[10, 10, 0, 0]}>
                                                        {prepareServiceData().map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                    <Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="status-legend">
                                            {prepareServiceData().map((item, idx) => (
                                                <div className="legend-item" key={idx}>
                                                    <span className="color-dot" style={{ background: item.color }}></span>
                                                    <span className="legend-label">{item.name}</span>
                                                    <span className="legend-value">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Card 4: General Inquiries - Grouped Bar Chart */}
                                    <motion.div
                                        className="analytics-card-modern"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.5 }}
                                        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)' }}
                                    >
                                        <div className="card-header">
                                            <div className="header-left">
                                                <FiMessageSquare className="card-icon" />
                                                <h3>General Inquiries</h3>
                                            </div>
                                            <span className="total-badge">{stats?.generalInquiries?.total || 0}</span>
                                        </div>

                                        <div className="card-stats-mini">
                                            <div className="mini-stat">
                                                <span className="label">Most Requested</span>
                                                <span className="value">
                                                    {getMostRequestedReason()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart
                                                    data={prepareGeneralData()}
                                                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                                    layout="horizontal"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fontFamily: 'Content, serif', fontSize: 10 }}
                                                        angle={0}
                                                        textAnchor="end"
                                                    // height={60}
                                                    />
                                                    <YAxis hide />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: 'white',
                                                            border: '2px solid #efe8fb',
                                                            borderRadius: '10px',
                                                            fontFamily: 'Content, serif'
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{ fontFamily: 'Content, serif', fontSize: '10px' }}
                                                    />
                                                    <Bar dataKey="pending" name="Pending" stackId="a" fill={COLORS.pending} radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="contacted" name="Contacted" stackId="a" fill={COLORS.contacted} radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="resolved" name="Resolved" stackId="a" fill={COLORS.resolved} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="status-legend">
                                            <div className="legend-item">
                                                <span className="color-dot" style={{ background: COLORS.pending }}></span>
                                                <span className="legend-label">Pending</span>
                                                <span className="legend-value">{stats?.generalInquiries?.byStatus?.pending || 0}</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="color-dot" style={{ background: COLORS.contacted }}></span>
                                                <span className="legend-label">Contacted</span>
                                                <span className="legend-value">{stats?.generalInquiries?.byStatus?.contacted || 0}</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="color-dot" style={{ background: COLORS.resolved }}></span>
                                                <span className="legend-label">Resolved</span>
                                                <span className="legend-value">{stats?.generalInquiries?.byStatus?.resolved || 0}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {/* OTHER TABS - COMPLETELY UNCHANGED */}
                        {activeTab !== 'overview' && (
                            <div className="details-tab">
                                {loadingDetails ? (
                                    <div className="details-loading">
                                        <FiRefreshCw className="spinner" />
                                    </div>
                                ) : (
                                    <div className="details-table-container">
                                        <table className="details-table">
                                            <thead>
                                                <tr>
                                                    {activeTab === 'appointments' && (
                                                        <>
                                                            <th>Reference</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>Date</th>
                                                            <th>Time</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </>
                                                    )}
                                                    {activeTab === 'careers' && (
                                                        <>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>LLQP</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </>
                                                    )}
                                                    {activeTab === 'service-inquiries' && (
                                                        <>
                                                            <th>Name</th>
                                                            <th>Service</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </>
                                                    )}
                                                    {activeTab === 'general-inquiries' && (
                                                        <>
                                                            <th>Name</th>
                                                            <th>Reason</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailsData.map((item, index) => (
                                                    <motion.tr
                                                        key={item._id || index}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        {activeTab === 'appointments' && (
                                                            <>
                                                                <td>{item.referenceId}</td>
                                                                <td>{item.name}</td>
                                                                <td>{item.email}</td>
                                                                <td>{item.phone}</td>
                                                                <td>{item.date}</td>
                                                                <td>{item.time}</td>
                                                                <td>
                                                                    <span className={`status-badge ${item.status}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <select
                                                                        value={item.status}
                                                                        onChange={(e) => updateStatus('appointment', item._id, e.target.value)}
                                                                        className="status-select"
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="approved">Approved</option>
                                                                        <option value="rejected">Rejected</option>
                                                                    </select>
                                                                </td>
                                                            </>
                                                        )}
                                                        {activeTab === 'careers' && (
                                                            <>
                                                                <td>{item.firstName} {item.lastName}</td>
                                                                <td>{item.email}</td>
                                                                <td>{item.phone}</td>
                                                                <td>
                                                                    <span className={`llqp-badge ${item.llqpLicense}`}>
                                                                        {item.llqpLicense === 'yes' ? '✅ Yes' : '❌ No'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`status-badge ${item.status}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <select
                                                                        value={item.status}
                                                                        onChange={(e) => updateStatus('career', item._id, e.target.value)}
                                                                        className="status-select"
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="reviewed">Reviewed</option>
                                                                        <option value="contacted">Contacted</option>
                                                                        <option value="rejected">Rejected</option>
                                                                        <option value="hired">Hired</option>
                                                                    </select>
                                                                </td>
                                                            </>
                                                        )}
                                                        {activeTab === 'service-inquiries' && (
                                                            <>
                                                                <td>{item.name}</td>
                                                                <td>{item.service}</td>
                                                                <td>{item.email}</td>
                                                                <td>{item.phone}</td>
                                                                <td>
                                                                    <span className={`status-badge ${item.status}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <select
                                                                        value={item.status}
                                                                        onChange={(e) => updateStatus('service', item._id, e.target.value)}
                                                                        className="status-select"
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="contacted">Contacted</option>
                                                                        <option value="resolved">Resolved</option>
                                                                    </select>
                                                                </td>
                                                            </>
                                                        )}
                                                        {activeTab === 'general-inquiries' && (
                                                            <>
                                                                <td>{item.name}</td>
                                                                <td>{item.reason}</td>
                                                                <td>{item.email}</td>
                                                                <td>{item.phone}</td>
                                                                <td>
                                                                    <span className={`status-badge ${item.status}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <select
                                                                        value={item.status}
                                                                        onChange={(e) => updateStatus('general', item._id, e.target.value)}
                                                                        className="status-select"
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="contacted">Contacted</option>
                                                                        <option value="resolved">Resolved</option>
                                                                    </select>
                                                                </td>
                                                            </>
                                                        )}
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default Dashboard;