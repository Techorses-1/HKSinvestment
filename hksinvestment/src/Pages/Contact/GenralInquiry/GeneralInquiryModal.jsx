import React, { useState, useEffect } from "react";
import { FiArrowRight, FiX, FiSearch, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./GeneralInquiryModal.scss";

// ===== IMPORT COUNTRY CODES =====
import { countryCodes, defaultCountry } from "../../../Componenents/countryCodes/countryCodes";

const GeneralInquiryModal = ({ isOpen, onClose, source = "default" }) => {
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

    // Reset phone inputs when modal context changes visibility states
    useEffect(() => {
        if (!isOpen) {
            setPhoneNumber("");
            setSelectedCountry(defaultCountry.code);
            setIsDropdownOpen(false);
            setSearchTerm("");
        }
    }, [isOpen]);

    // Validation schema (Strict 10 digit requirement matching previous implementations)
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
        reason: Yup.string()
            .required("Please select a reason"),
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

    // Filter country logic
    const filteredCountries = countryCodes.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.includes(searchTerm)
    );

    // Get active meta info container configuration
    const getSelectedCountryDisplay = () => {
        const country = countryCodes.find(c => c.code === selectedCountry);
        return country || defaultCountry;
    };

    const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
        // Enforce length limit sanity check block before requesting
        const phoneDigits = phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            setFieldError('phone', 'Phone number must be exactly 10 digits');
            setSubmitting(false);
            return;
        }

        try {
            // Unify standard textual metrics with the country prefix indicator component
            const dynamicSubmissionData = {
                ...values,
                phone: selectedCountry + phoneNumber
            };

            const response = await fetch(`${API_URL}/general-inquiry/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dynamicSubmissionData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    toast.warning(data.message || 'Please wait 48 hours between inquiries');
                    return;
                }
                throw new Error(data.message || 'Failed to submit inquiry');
            }

            if (data.success) {
                toast.success('Thank you for your inquiry! Our team will update you shortly.');
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
                        className="inquiry-modal-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    <motion.div
                        className="inquiry-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <button
                            className="inquiry-modal-close-btn"
                            onClick={onClose}
                            type="button"
                            aria-label="Close Modal"
                        >
                            <FiX />
                        </button>

                        <h3 className="inquiry-modal-title">
                            {source === 'privacy-questions' ? 'Any Questions?' : 'General Inquiry'}
                        </h3>
                        <p className="inquiry-modal-subtitle">
                            {source === 'privacy-questions'
                                ? 'Have questions about your privacy? Fill out the form below and our team will get back to you within 24 hours.'
                                : 'Fill out the form below and our team will get back to you within 24 hours.'
                            }
                        </p>

                        <Formik
                            initialValues={{
                                name: '',
                                phone: '',
                                email: '',
                                reason: '',
                                message: ''
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, errors, touched, setFieldValue, setFieldError }) => (
                                <Form className="inquiry-form">
                                    {/* Row 1: Name and Phone */}
                                    <div className="inquiry-form-row-2col">
                                        <div className="inquiry-form-group">
                                            <label htmlFor="name">
                                                Full Name <span className="required">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                id="name"
                                                name="name"
                                                className={`inquiry-form-input ${touched.name && errors.name ? 'error' : ''}`}
                                                placeholder="Enter your full name"
                                                disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="name" component="div" className="error-message" />
                                        </div>

                                        {/* Phone Field wrapper with explicit structured selection nodes */}
                                        <div className="inquiry-form-group phone-group">
                                            <label htmlFor="phone">
                                                Phone Number <span className="required">*</span>
                                            </label>
                                            <div className={`phone-input-wrapper ${touched.phone && errors.phone ? 'error' : ''}`}>

                                                {/* Country Dropdown Interface */}
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

                                                {/* Textual Entry Node Input */}
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

                                    {/* Row 2: Email and Reason */}
                                    <div className="inquiry-form-row-2col">
                                        <div className="inquiry-form-group">
                                            <label htmlFor="email">
                                                Email Address <span className="required">*</span>
                                            </label>
                                            <Field
                                                type="email"
                                                id="email"
                                                name="email"
                                                className={`inquiry-form-input ${touched.email && errors.email ? 'error' : ''}`}
                                                placeholder="your@email.com"
                                                disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="email" component="div" className="error-message" />
                                        </div>

                                        <div className="inquiry-form-group">
                                            <label htmlFor="reason">
                                                Reason for Inquiry <span className="required">*</span>
                                            </label>
                                            <Field
                                                as="select"
                                                id="reason"
                                                name="reason"
                                                className={`inquiry-form-select ${touched.reason && errors.reason ? 'error' : ''}`}
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Select a reason</option>
                                                <option value="General Inquiry">General Inquiry</option>
                                                <option value="Investment Advice">Investment Advice</option>
                                                <option value="Account Support">Account Support</option>
                                                <option value="Others">Others</option>
                                            </Field>
                                            <ErrorMessage name="reason" component="div" className="error-message" />
                                        </div>
                                    </div>

                                    {/* Row 3: Message */}
                                    <div className="inquiry-form-row-full">
                                        <div className="inquiry-form-group">
                                            <label htmlFor="message">Message (Optional)</label>
                                            <Field
                                                as="textarea"
                                                id="message"
                                                name="message"
                                                className={`inquiry-form-textarea ${touched.message && errors.message ? 'error' : ''}`}
                                                placeholder="Tell us about your inquiry..."
                                                rows="4"
                                                disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="message" component="div" className="error-message" />
                                        </div>
                                    </div>

                                    {/* Row 4: Submit Button */}
                                    <motion.button
                                        type="submit"
                                        className={`inquiry-submit-btn ${isSubmitting ? 'submitting' : ''}`}
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
                                                <FiArrowRight className="inquiry-submit-arrow" />
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

export default GeneralInquiryModal;