import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import ScrollToTop from "./Componenents/GoToTop/ScrollToTop";
import Home from "./Pages/Home/Home";
import Navbar from "./Componenents/Navbar/Navbar";
import Footer from "./Componenents/Footer/Footer";
import Contact from "./Pages/Contact/Contact";
import Privacy from "./Pages/Privacy/Privacy";
import AdminAuth from "./Pages/Admin/AdminAuth/AdminAuth";
import PricingPage from "./Pages/Pricing/PricingPage";
import Career from "./Pages/Career/Career";
import AdminForms from "./Pages/Admin/AdminForms/AdminForms";
import AdminCareer from "./Pages/Admin/AdminCareer/AdminCareer";
import AdminLayout from "./Pages/Admin/AdminLayout/AdminLayout";
import AdminSchedule from "./Pages/Admin/AdminSchedule/AdminSchedule";
import AdminAppointments from "./Pages/Admin/ApproveReject/AdminAppointments";
import Dashboard from "./Pages/Admin/Dashboard/Dashboard";
// import AdminSchedule from "./Pages/Admin/AdminAppointsments/AdminSchedule";
// import SmoothCursor from "./Componenents/Cursor/SmoothCursor"
import NotFound from "./Pages/404/NotFound";

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin-portal");

  return (
    <>
      {/* <SmoothCursor />  */}
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacypolicy" element={<Privacy />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/career" element={<Career />} />
        
        {/* Admin login route */}
        <Route path="/admin-portal/login" element={<AdminAuth />} />
        
        {/* Redirect /admin-portal to login */}
        <Route path="/admin-portal" element={<Navigate to="/admin-portal/login" replace />} />
        
        {/* Admin layout with nested routes - protected routes */}
        <Route path="/admin-portal" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="career" element={<AdminCareer />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="appointments" element={<AdminAppointments />} />
        </Route>

        {/* 404 route - this will catch /admin and any other undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;