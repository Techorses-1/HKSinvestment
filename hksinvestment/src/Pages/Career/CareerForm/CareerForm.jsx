import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiInstagram,
    FiArrowRight,
    FiUser,
    FiCheckCircle,
    FiSearch,
    FiX,
    FiAlertCircle
} from "react-icons/fi";
import {
    TbBrandWhatsapp,
    TbBrandYoutube,
    TbBrandDiscord
} from "react-icons/tb";
import "./CareerForm.scss";

// ===== IMPORT COUNTRY CODES =====
import { countryCodes, defaultCountry } from "../../../Componenents/countryCodes/countryCodes";

const CareerForm = () => {
    const API_URL = import.meta.env.VITE_API_URL;

    // ----- COUNTRY CODE STATES -----
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry.code);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.country-dropdown')) {
                setIsDropdownOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    // Filter countries based on search
    const filteredCountries = countryCodes.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.includes(searchTerm)
    );

    // Get selected country display
    const getSelectedCountryDisplay = () => {
        const country = countryCodes.find(c => c.code === selectedCountry);
        return country || defaultCountry;
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const iconVariants = {
        initial: { scale: 1, color: "#7a3db8" },
        hover: {
            scale: 1.2,
            color: "#5e2690",
            rotate: 360,
            transition: {
                duration: 0.4,
                ease: "easeInOut"
            }
        }
    };

    const contactItemVariants = {
        initial: { opacity: 0.8, x: 0 },
        hover: {
            opacity: 1,
            x: 10,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.98 }
    };

    const arrowVariants = {
        hover: {
            rotate: 45,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    // Form validation schema (Strict 10 digit requirement)
    const validationSchema = Yup.object({
        firstName: Yup.string()
            .required("First name is required")
            .min(2, "First name must be at least 2 characters"),
        lastName: Yup.string()
            .required("Last name is required")
            .min(2, "Last name must be at least 2 characters"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        phone: Yup.string()
            .required("Phone number is required")
            .test('is-valid-phone', 'Please enter exactly 10 digits', function (value) {
                if (!value) return false;
                const digitsOnly = value.replace(/\D/g, '');
                return digitsOnly.length === 10;
            }),
        llqpLicense: Yup.string()
            .required("Please select an option")
    });

    // Initial form values
    const initialValues = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        llqpLicense: ""
    };

    // Handle form submission
    const handleSubmit = async (values, { resetForm, setSubmitting, setFieldError }) => {
        // Phone validation sanity check
        const phoneDigits = phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            setFieldError('phone', 'Phone number must be exactly 10 digits');
            setSubmitting(false);
            return;
        }

        try {
            // Merge form values with country code prefix
            const dynamicSubmissionData = {
                ...values,
                phone: selectedCountry + phoneNumber
            };

            const response = await fetch(`${API_URL}/career/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dynamicSubmissionData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    toast.warning(data.message || 'Please wait 7 days between applications', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                    return;
                }
                throw new Error(data.message || 'Failed to submit application');
            }

            if (data.success) {
                toast.success('Application submitted successfully! Our HR team will review your application.', {
                    position: "top-right",
                    autoClose: 5000,
                });
                resetForm();
                setPhoneNumber("");
                setSelectedCountry(defaultCountry.code);
            } else {
                toast.error(data.message || 'Submission failed', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error(error.message || 'Something went wrong. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Social icons — Instagram (Feather, outlined) + WhatsApp/YouTube/Discord (Tabler, outlined) for a consistent stroke style
    const socialIcons = [
        { Icon: TbBrandWhatsapp, label: "WhatsApp", url: "https://wa.me/17828828102?text=Hello%20HKS%20Investment%2C%20I%27m%20interested%20in%20career%20opportunities" },

        { Icon: FiInstagram, label: "Instagram", url: "https://www.instagram.com/hks.investment/" },
        { Icon: TbBrandYoutube, label: "YouTube", url: "https://www.youtube.com/@hks.investment" },
        // TODO: replace with your real Discord invite link
        { Icon: TbBrandDiscord, label: "Discord", url: "https://discord.com/invite/yourinvite" }
    ];

    // Contact info
    const contactInfo = [
        {
            icon: <TbBrandWhatsapp />,
            text: "+1 782-882-8102",
            type: "whatsapp",
            link: "https://wa.me/17828828102?text=Hello%20HKS%20Investment%2C%20I%27m%20interested%20in%20career%20opportunities"
        },
        {
            icon: <FiMail />,
            text: "inquiry@hksinvestment.com",
            type: "email",
            link: "mailto:inquiry@hksinvestment.com"
        },
        {
            icon: <FiMapPin />,
            text: "Halifax, NS, Canada",
            type: "address",
            link: "https://maps.google.com/?q=Halifax,NS,Canada"
        }
    ];

    // Why Join Us points
    const whyJoinUsPoints = [
        "Dynamic team shaping the future of financial technology",
        "Growth opportunities & competitive benefits",
        "Supportive culture with work-life balance",
        "Professional development & training programs"
    ];

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <motion.section
                className="career-form-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                <div className="career-form-header">
                    <motion.span className="career-pill" variants={itemVariants}>
                        Join Our Team
                    </motion.span>
                    <motion.h2 variants={itemVariants}>
                        Ready to build your <span>future</span> with us?
                    </motion.h2>
                    <motion.p variants={itemVariants}>
                        Your help is important for us.
                    </motion.p>
                </div>

                <div className="career-content">
                    {/* LEFT SIDE - CONTACT INFO */}
                    <motion.div className="career-info" variants={itemVariants}>
                        <div className="career-info-content">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                Why Join Us?
                            </motion.h3>

                            <motion.ul
                                className="why-join-list"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                {whyJoinUsPoints.map((point, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                                        whileHover={{ x: 10, color: "#5e2690" }}
                                    >
                                        <span className="bullet-point">•</span> {point}
                                    </motion.li>
                                ))}
                            </motion.ul>

                            {/* CONTACT ITEMS */}
                            <div className="career-items">
                                {contactInfo.map((item, index) => (
                                    <motion.a
                                        key={index}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="career-item-link"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <motion.div
                                            className="career-item"
                                            variants={contactItemVariants}
                                            initial="initial"
                                            whileHover="hover"
                                            custom={index}
                                        >
                                            <div className="career-item-icon">
                                                {item.icon}
                                            </div>
                                            <div className="career-item-text">
                                                {item.text}
                                            </div>
                                        </motion.div>
                                    </motion.a>
                                ))}
                            </div>

                            {/* SOCIAL ICONS */}
                            <motion.div
                                className="career-socials"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <h4>Follow Us</h4>
                                <div className="social-icons">
                                    {socialIcons.map((social, index) => (
                                        <motion.a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="social-icon"
                                            variants={iconVariants}
                                            initial="initial"
                                            whileHover="hover"
                                            whileTap={{ scale: 0.9 }}
                                            aria-label={social.label}
                                        >
                                            <social.Icon />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* RIGHT SIDE - FORM */}
                    <motion.div className="career-form-wrapper" variants={itemVariants}>
                        <div className="career-form-container">
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting, errors, touched, setFieldValue, setFieldError }) => (
                                    <Form className="career-form">
                                        {/* FIRST NAME & LAST NAME ROW */}
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="firstName">
                                                    <FiUser /> First Name *
                                                </label>
                                                <Field
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    placeholder="Enter first name"
                                                    className={`form-input ${errors.firstName && touched.firstName ? 'error' : ''}`}
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="firstName" component="div" className="error-message" />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="lastName">
                                                    <FiUser /> Last Name *
                                                </label>
                                                <Field
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    placeholder="Enter last name"
                                                    className={`form-input ${errors.lastName && touched.lastName ? 'error' : ''}`}
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="lastName" component="div" className="error-message" />
                                            </div>
                                        </div>

                                        {/* EMAIL FIELD */}
                                        <div className="form-group">
                                            <label htmlFor="email">
                                                <FiMail /> Email Address *
                                            </label>
                                            <Field
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                                                disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="email" component="div" className="error-message" />
                                        </div>

                                        {/* PHONE FIELD WITH COUNTRY DROP DOWN MODULE */}
                                        <div className="form-group phone-group">
                                            <label htmlFor="phone">
                                                <FiPhone /> Phone Number *
                                            </label>
                                            <div className={`phone-input-wrapper ${errors.phone && touched.phone ? 'error' : ''}`}>

                                                {/* Country Code Selection Interface */}
                                                <div className="country-dropdown">
                                                    <button
                                                        type="button"
                                                        className="country-select-btn"
                                                        onClick={() => !isSubmitting && setIsDropdownOpen(!isDropdownOpen)}
                                                        aria-label="Select country code"
                                                        disabled={isSubmitting}
                                                    >
                                                        <span className="country-flag">
                                                            {getSelectedCountryDisplay().flag}
                                                        </span>
                                                        <span className="country-code">
                                                            {getSelectedCountryDisplay().code}
                                                        </span>
                                                        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                                                            ▾
                                                        </span>
                                                    </button>

                                                    {isDropdownOpen && (
                                                        <div className="country-dropdown-menu">
                                                            <div className="country-search">
                                                                <FiSearch className="search-icon" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search country..."
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <div className="country-list">
                                                                {filteredCountries.map((country, index) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        className={`country-item ${selectedCountry === country.code ? 'active' : ''}`}
                                                                        onClick={() => {
                                                                            setSelectedCountry(country.code);
                                                                            setIsDropdownOpen(false);
                                                                            setSearchTerm("");
                                                                        }}
                                                                    >
                                                                        <span className="country-flag">{country.flag}</span>
                                                                        <span className="country-name">{country.name}</span>
                                                                        <span className="country-code">{country.code}</span>
                                                                    </button>
                                                                ))}
                                                                {filteredCountries.length === 0 && (
                                                                    <div className="no-results">No countries found</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Numerical Input Handling Field */}
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    placeholder="Enter 10-digit number"
                                                    value={phoneNumber}
                                                    disabled={isSubmitting}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        if (value.length <= 10) {
                                                            setPhoneNumber(value);
                                                            setFieldValue('phone', value);
                                                            if (errors.phone && touched.phone) {
                                                                setFieldError('phone', undefined);
                                                            }
                                                        }
                                                    }}
                                                    className="phone-number-input"
                                                />
                                            </div>
                                            <ErrorMessage name="phone" component="div" className="error-message" />
                                            {phoneNumber.length > 0 && phoneNumber.length !== 10 && (
                                                <div className="phone-hint">
                                                    <FiAlertCircle /> Phone number must be exactly 10 digits (current: {phoneNumber.length})
                                                </div>
                                            )}
                                        </div>

                                        {/* LLQP LICENSE RADIO */}
                                        <div className="form-group">
                                            <label>
                                                <FiCheckCircle /> Do you have LLQP License? *
                                            </label>
                                            <div className="radio-group">
                                                <label className="radio-label">
                                                    <Field type="radio" name="llqpLicense" value="yes" disabled={isSubmitting} />
                                                    <span>Yes</span>
                                                </label>
                                                <label className="radio-label">
                                                    <Field type="radio" name="llqpLicense" value="no" disabled={isSubmitting} />
                                                    <span>No</span>
                                                </label>
                                            </div>
                                            <ErrorMessage name="llqpLicense" component="div" className="error-message" />
                                        </div>

                                        {/* SUBMIT BUTTON CONTAINER */}
                                        <motion.button
                                            type="submit"
                                            className={`career-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                                            variants={buttonVariants}
                                            initial="initial"
                                            whileHover={isSubmitting ? {} : "hover"}
                                            whileTap={isSubmitting ? {} : "tap"}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="submit-text">Submitting...</span>
                                                    <span className="spinner-wrap">
                                                        <div className="spinner"></div>
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    Submit Application
                                                    <motion.span variants={arrowVariants}>
                                                        <FiArrowRight />
                                                    </motion.span>
                                                </>
                                            )}
                                        </motion.button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </>
    );
};

export default CareerForm;