import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiHome, 
    FiMail, 
    FiBriefcase, 
    FiLogOut, 
    FiMenu, 
    FiChevronLeft, 
    FiX,
    FiCalendar,
    FiClock,
    FiUsers
} from 'react-icons/fi';
import './AdminSidebar.scss';

const AdminSidebar = ({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen, isMobile }) => {
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-portal/login';
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Mobile version – slide‑in overlay
    if (isMobile) {
        return (
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            className="mobile-sidebar-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                        />
                        <motion.div
                            className="admin-sidebar mobile"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                        >
                            <div className="sidebar-header">
                                <h2>Admin Panel</h2>
                                <button className="close-btn" onClick={closeMobileMenu}>
                                    <FiX />
                                </button>
                            </div>
                            <nav className="sidebar-nav">
                                <NavLink to="/admin-portal/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
                                    <FiHome className="nav-icon" />
                                    <span>Dashboard</span>
                                </NavLink>
                                <NavLink to="/admin-portal/forms" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
                                    <FiMail className="nav-icon" />
                                    <span>Forms</span>
                                </NavLink>
                                <NavLink to="/admin-portal/career" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
                                    <FiBriefcase className="nav-icon" />
                                    <span>Career</span>
                                </NavLink>
                                <NavLink to="/admin-portal/schedule" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
                                    <FiClock className="nav-icon" />
                                    <span>Schedule</span>
                                </NavLink>
                                <NavLink to="/admin-portal/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMobileMenu}>
                                    <FiCalendar className="nav-icon" />
                                    <span>Appointments</span>
                                </NavLink>
                            </nav>
                            <div className="sidebar-footer">
                                <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="logout-btn">
                                    <FiLogOut className="nav-icon" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        );
    }

    // Desktop version – fixed, collapsible
    return (
        <motion.div
            className={`admin-sidebar desktop ${collapsed ? 'collapsed' : ''}`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="sidebar-header">
                {!collapsed && <h2>Admin Panel</h2>}
                <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <FiMenu /> : <FiChevronLeft />}
                </button>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/admin-portal/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FiHome className="nav-icon" />
                    {!collapsed && <span>Dashboard</span>}
                </NavLink>
                <NavLink to="/admin-portal/forms" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FiMail className="nav-icon" />
                    {!collapsed && <span>Forms</span>}
                </NavLink>
                <NavLink to="/admin-portal/career" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FiBriefcase className="nav-icon" />
                    {!collapsed && <span>Career</span>}
                </NavLink>
                <NavLink to="/admin-portal/schedule" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FiClock className="nav-icon" />
                    {!collapsed && <span>Schedule</span>}
                </NavLink>
                <NavLink to="/admin-portal/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FiCalendar className="nav-icon" />
                    {!collapsed && <span>Appointments</span>}
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut className="nav-icon" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </motion.div>
    );
};

export default AdminSidebar;