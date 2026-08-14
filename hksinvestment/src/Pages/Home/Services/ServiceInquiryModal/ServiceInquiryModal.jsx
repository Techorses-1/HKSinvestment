import React, { useState, useEffect } from "react";
import { FiArrowRight, FiX, FiSearch, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ServiceInquiryModal.scss";

// ===== IMPORT COUNTRY CODES =====
import { countryCodes, defaultCountry } from "../../../../Componenents/countryCodes/countryCodes";

const ServiceInquiryModal = ({ isOpen, onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL;

    // ----- COUNTRY CODE STATES -----
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry.code);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Close country dropdown when clicking outside
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

    // Reset phone inputs when modal closes/opens
    useEffect(() => {
        if (!isOpen) {
            setPhoneNumber("");
            setSelectedCountry(defaultCountry.code);
            setIsDropdownOpen(false);
            setSearchTerm("");
        }
    }, [isOpen]);

    // Service options from the Services section
    const serviceOptions = [
        "Financial Advising",
        "Systematic Investment Plan",
        "Market-Based Research Plan",
        "Registered Retirement Saving Plan",
        "Wealth Account Management",
        "Tax Optimization"
    ];

    // Validation schema (Strict 10 digit requirement)
    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required")
            .min(2, "Name must be at least 2 characters"),
        phone: Yup.string()
            .required("Phone number is required")
            .test('is-valid-phone', 'Please enter exactly 10 digits', function (value) {
                if (!value) return false;
                const digitsOnly = value.replace(/\D/g, '');
                return digitsOnly.length === 10;
            }),
        email: Yup.string()
            .required("Email is required")
            .email("Invalid email address"),
        service: Yup.string()
            .required("Please select a service"),
        message: Yup.string()
            .max(500, "Message must be 500 characters or less")
    });

    // Animation variants
    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.9,
            y: -20
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 20,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    // Filter countries based on search input
    const filteredCountries = countryCodes.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.includes(searchTerm)
    );

    // Get selected country metadata
    const getSelectedCountryDisplay = () => {
        const country = countryCodes.find(c => c.code === selectedCountry);
        return country || defaultCountry;
    };

    const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
        // Double-check digits length sanity check
        const phoneDigits = phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            setFieldError('phone', 'Phone number must be exactly 10 digits');
            setSubmitting(false);
            return;
        }

        try {
            // Append the structural country code component directly to the payload logic
            const dynamicSubmissionData = {
                ...values,
                phone: selectedCountry + phoneNumber
            };

            const response = await fetch(`${API_URL}/service-inquiry/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dynamicSubmissionData)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Invalid JSON response:', text);
                throw new Error('Server returned invalid response');
            }

            if (!response.ok) {
                if (response.status === 429) {
                    toast.warning(data.message || 'Please wait 48 hours between service inquiries');
                    return;
                }
                throw new Error(data.message || 'Failed to submit inquiry');
            }

            if (data.success) {
                toast.success(`Thank you for your interest in ${values.service}! Our team will contact you shortly.`);
                resetForm();
                setPhoneNumber("");
                setSelectedCountry(defaultCountry.code);
                onClose();
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="service-modal-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    <motion.div
                        className="service-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <button
                            className="service-modal-close-btn"
                            onClick={onClose}
                            type="button"
                            aria-label="Close Modal"
                        >
                            <FiX />
                        </button>

                        <h3 className="service-modal-title">Service Inquiry</h3>
                        <p className="service-modal-subtitle">Tell us which service interests you and our team will get back to you within 24 hours.</p>

                        <Formik
                            initialValues={{
                                name: '',
                                phone: '',
                                email: '',
                                service: '',
                                message: ''
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, errors, touched, setFieldValue, setFieldError }) => (
                                <Form className="service-form">
                                    {/* Row 1: Name and Phone */}
                                    <div className="service-form-row-2col">
                                        <div className="service-form-group">
                                            <label htmlFor="name">
                                                Full Name <span className="required">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                id="name"
                                                name="name"
                                                className={`service-form-input ${touched.name && errors.name ? 'error' : ''}`}
                                                placeholder="Enter your full name"
                                                disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="name" component="div" className="error-message" />
                                        </div>

                                        {/* Phone Field wrapper with structural component custom injection */}
                                        <div className="service-form-group phone-group">
                                            <label htmlFor="phone">
                                                Phone Number <span className="required">*</span>
                                            </label>
                                            <div className={`phone-input-wrapper ${touched.phone && errors.phone ? 'error' : ''}`}>

                                                {/* Country Dropdown Logic Node */}
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

                                                {/* Numeric Number Entry Node Input */}
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    placeholder="Enter 10 digits"
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
                                    </div>

                                    {/* Row 2: Email and Service Selection */}
                                    <div className="service-form-row-2col">
                                        <div className="service-form-group">
                                            <label htmlFor="email">
                                                Email Address <span className="required">*</span>
                                            </label>
                                            <Field
                                                type="email"
                                                id="email"
                                                name="email"
                                                className={`service-form-input ${touched.email && errors.email ? 'error' : ''}`}
                                                placeholder="your@email.com"
                                                disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="email" component="div" className="error-message" />
                                        </div>

                                        <div className="service-form-group">
                                            <label htmlFor="service">
                                                Select Service <span className="required">*</span>
                                            </label>
                                            <Field
                                                as="select"
                                                id="service"
                                                name="service"
                                                className={`service-form-select ${touched.service && errors.service ? 'error' : ''}`}
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Choose a service</option>
                                                {serviceOptions.map((service, index) => (
                                                    <option key={index} value={service}>{service}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="service" component="div" className="error-message" />
                                        </div>
                                    </div>

                                    {/* Row 3: Message */}
                                    <div className="service-form-row-full">
                                        <div className="service-form-group">
                                            <label htmlFor="message">Message (Optional)</label>
                                            <Field
                                                as="textarea"
                                                id="message"
                                                name="message"
                                                className={`service-form-textarea ${touched.message && errors.message ? 'error' : ''}`}
                                                placeholder="Tell us more about your requirements..."
                                                rows="4"
                                                disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="message" component="div" className="error-message" />
                                        </div>
                                    </div>

                                    {/* Row 4: Submit Button */}
                                    <motion.button
                                        type="submit"
                                        className={`service-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span>Submitting...</span>
                                                <div className="spinner"></div>
                                            </>
                                        ) : (
                                            <>
                                                Submit Inquiry
                                                <FiArrowRight className="service-submit-arrow" />
                                            </>
                                        )}
                                    </motion.button>
                                </Form>
                            )}
                        </Formik>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ServiceInquiryModal;