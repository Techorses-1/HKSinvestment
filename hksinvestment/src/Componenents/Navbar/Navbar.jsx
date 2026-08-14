// Navbar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import GeneralInquiryModal from "../../Pages/Contact/GenralInquiry/GeneralInquiryModal";
import "./Navbar.scss";
import desktop_logo from "../../assets/logo/purple_logo.svg";
import mobile_logo from "../../assets/logo/white_logo.svg";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openInquiryModal = () => {
    setIsModalOpen(true);
    closeMenu();
  };

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <nav className="desktop-navbar">
        <div className="navbar-container">
          <div className="logo">
            <NavLink to="/" onClick={closeMenu}>
              <img src={desktop_logo} alt="HKS Investment Logo" className="logo-image" />
            </NavLink>
          </div>

          {/* RIGHT SIDE - LINKS + INQUIRY BUTTON */}
          <div className="nav-right">
            <div className="nav-links">
              <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                Home
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>
                Schedule
              </NavLink>
              <NavLink to="/career" className={({ isActive }) => isActive ? "active" : ""}>
                Career
              </NavLink>
              {/* <NavLink to="/pricing" className={({ isActive }) => isActive ? "active" : ""}>
                Pricing
              </NavLink> */}


            </div>

            {/* INQUIRY BUTTON - DESKTOP */}
            <button className="inquiry-nav-btn" onClick={openInquiryModal}>
              <FiMessageCircle className="btn-icon" />
              <span>Inquiry</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE NAVBAR */}
      <div className={`mobile-navbar ${mobileMenuOpen ? "menu-open" : ""}`}>
        <div className="mobile-navbar-container">
          <div className="mobile-logo">
            <NavLink to="/" onClick={closeMenu}>
              <img src={mobile_logo} alt="HKS Investment Logo" className="mobile-logo-image" />
            </NavLink>
          </div>

          {/* UIVERSE HAMBURGER */}
          <label className="hamburger">
            <input
              type="checkbox"
              checked={mobileMenuOpen}
              onChange={toggleMenu}
            />
            <svg viewBox="0 0 32 32">
              <path
                className="line line-top-bottom"
                d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
              />
              <path className="line" d="M7 16 27 16" />
            </svg>
          </label>
        </div>

        {/* MOBILE MENU LINKS */}
        <div className={`mobile-menu-links ${mobileMenuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
            Home
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
            Schedule
          </NavLink>
          <NavLink to="/career" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
            Career
          </NavLink>
          {/* <NavLink to="/pricing" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
            Pricing
          </NavLink> */}



          {/* INQUIRY BUTTON - MOBILE */}
          <button className="mobile-inquiry-btn" onClick={openInquiryModal}>
            <FiMessageCircle className="btn-icon" />
            <span>Inquiry</span>
          </button>

          {/* PRIVACY POLICY - MOBILE ONLY */}
          <NavLink to="/privacypolicy" onClick={closeMenu} className="mobile-privacy-link">
            Privacy Policy
          </NavLink>
        </div>
      </div>

      {/* GENERAL INQUIRY MODAL */}
      <GeneralInquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Navbar;