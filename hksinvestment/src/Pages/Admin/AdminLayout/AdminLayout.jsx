import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import './AdminLayout.scss';
import AdminSidebar from '../Sidebar/AdminSidebar';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="admin-layout">
            <AdminSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                isMobile={isMobile}
            />
            <div className={`admin-content ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
                {isMobile && (
                    <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
                        <FiMenu />
                    </button>
                )}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;