import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    FiUser,
    FiPhone,
    FiMail,
    FiCalendar,
    FiClock,
    FiArrowRight,
    FiCheckCircle,
    FiXCircle,
    FiLoader,
    FiEdit3,
    FiAlertCircle,
    FiInfo,
    FiSearch,
    FiX
} from "react-icons/fi";
import "./AppointmentSection.scss";
// ===== IMPORT COUNTRY CODES =====
import { countryCodes, defaultCountry, getCountryByCode } from "../../../Componenents/countryCodes/countryCodes";

const AppointmentSection = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [allSlots, setAllSlots] = useState([]);
    const [isOff, setIsOff] = useState(false);
    const [scheduleType, setScheduleType] = useState('default');
    const [slotCount, setSlotCount] = useState(0);
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry.code);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [statusMessage, setStatusMessage] = useState(null);
    const [statusType, setStatusType] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayDate = getTodayDate();

    // Get max selectable date - Next 15 days from today
    const getMaxDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 14);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Generate all possible default time slots (10 AM to 6 PM)
    const getAllDefaultTimeSlots = () => {
        const slots = [];
        for (let hour = 10; hour < 18; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            slots.push(timeStr);
        }
        return slots;
    };

    // Fetch available slots when date is selected
    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots(selectedDate);
        } else {
            setBookedSlots([]);
            setAvailableSlots([]);
            setAllSlots([]);
            setIsOff(false);
            setSelectedTime(null);
        }
    }, [selectedDate]);

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

    // Fetch available slots from API
    const fetchAvailableSlots = async (date) => {
        try {
            setIsLoadingSlots(true);
            toast.dismiss();

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/appointments/slots/${date}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch time slots');
            }

            const data = await response.json();

            if (data.success) {
                const booked = data.data.bookedSlots || [];
                const available = data.data.availableSlots || [];

                setBookedSlots(booked);
                setAvailableSlots(available);
                setIsOff(data.data.isOff || false);
                setScheduleType(data.data.scheduleType || 'default');
                setSlotCount(available.length || 0);

                let combinedSlots = [];

                if (data.data.isOff) {
                    combinedSlots = getAllDefaultTimeSlots().map(time => ({
                        time,
                        status: 'unavailable',
                        reason: 'day_off'
                    }));
                } else if (data.data.scheduleType === 'custom' && data.data.customSlotCount > 0) {
                    const allCustomSlots = [...new Set([...available, ...booked])].sort();
                    combinedSlots = allCustomSlots.map(time => ({
                        time,
                        status: booked.includes(time) ? 'booked' : 'available'
                    }));
                } else {
                    combinedSlots = getAllDefaultTimeSlots().map(time => ({
                        time,
                        status: booked.includes(time) ? 'booked' :
                            available.includes(time) ? 'available' : 'unavailable'
                    }));
                }

                let finalSlots = combinedSlots;
                let finalAvailable = available;
                let finalBooked = booked;

                if (date === todayDate) {
                    const currentHour = new Date().getHours();

                    finalSlots = combinedSlots.map(slot => {
                        const slotHour = parseInt(slot.time.split(':')[0]);
                        if (slotHour <= currentHour) {
                            return { ...slot, status: 'unavailable' };
                        }
                        return slot;
                    });

                    finalAvailable = finalSlots.filter(s => s.status === 'available').map(s => s.time);
                    finalBooked = finalSlots.filter(s => s.status === 'booked').map(s => s.time);
                }

                setAllSlots(finalSlots);
                setBookedSlots(finalBooked);
                setAvailableSlots(finalAvailable);
                setSlotCount(finalAvailable.length);

                if (selectedTime) {
                    if (finalBooked.includes(selectedTime) || !finalAvailable.includes(selectedTime)) {
                        setSelectedTime(null);
                    }
                }
            } else {
                throw new Error(data.message || 'Failed to fetch slots');
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            toast.error('Failed to load available time slots. Please try again.', {
                position: "top-right",
                autoClose: 3000
            });
            setBookedSlots([]);
            setAvailableSlots([]);
            setAllSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    // Handle date change
    const handleDateChange = (e) => {
        const newDate = e.target.value;
        const min = getMinDate();
        const max = getMaxDate();

        if (newDate && (newDate < min || newDate > max)) {
            toast.dismiss();
            toast.error(`Please select a date within the next 15 days (${min} to ${max})`, {
                position: "top-right",
                autoClose: 3000
            });
            setSelectedDate("");
        } else {
            setSelectedDate(newDate);
        }
        setSelectedTime(null);
        setStatusMessage(null);
        setStatusType(null);
    };

    // Handle time slot selection
    const handleTimeSlotClick = (time) => {
        const slot = allSlots.find(s => s.time === time);
        if (slot && slot.status === 'available') {
            setSelectedTime(time);
        }
    };

    // Function to set status message and auto-hide after 7 seconds
    const showStatusMessage = (message, type) => {
        setStatusMessage(message);
        setStatusType(type);

        if (window.statusTimeout) {
            clearTimeout(window.statusTimeout);
        }

        window.statusTimeout = setTimeout(() => {
            setStatusMessage(null);
            setStatusType(null);
        }, 7000);
    };

    // Get full phone number with country code
    const getFullPhoneNumber = () => {
        return selectedCountry + phoneNumber;
    };

    // Form validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required")
            .min(2, "Name must be at least 2 characters"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        phone: Yup.string()
            .required("Phone number is required")
            .test('is-valid-phone', 'Please enter exactly 10 digits', function (value) {
                if (!value) return false;
                const digitsOnly = value.replace(/\D/g, '');
                return digitsOnly.length === 10;
            })
    });

    // Initial form values
    const initialValues = {
        name: "",
        email: "",
        phone: ""
    };

    // Handle form submission with API call
    const handleSubmit = async (values, { resetForm, setFieldError }) => {
        if (!selectedDate) {
            toast.error("Please select a date", {
                position: "top-right",
                autoClose: 3000
            });
            return;
        }

        if (!selectedTime) {
            toast.error("Please select a time slot", {
                position: "top-right",
                autoClose: 3000
            });
            return;
        }

        // Phone validation - ensure it has exactly 10 digits
        const phoneDigits = phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            setFieldError('phone', 'Phone number must be exactly 10 digits');
            return;
        }

        setIsSubmitting(true);

        try {
            const appointmentData = {
                ...values,
                phone: getFullPhoneNumber(),
                date: selectedDate,
                time: selectedTime,
                reason: "Financial Consultation",
                message: ""
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/appointments/book`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(appointmentData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to book appointment');
            }

            if (data.success) {
                toast.dismiss();
                toast.success(
                    `Thank you! We'll review your request and update you shortly.`,
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    }
                );

                showStatusMessage(
                    "Thank you! We'll review your request and update you shortly.",
                    'success'
                );

                resetForm();
                setPhoneNumber("");
                setSelectedCountry(defaultCountry.code);
                setSelectedDate("");
                setSelectedTime(null);
                setBookedSlots([]);
                setAvailableSlots([]);
                setAllSlots([]);
                // Note: status message is intentionally left showing here — it
                // auto-hides itself after 7s via the timeout inside showStatusMessage.
            } else {
                throw new Error(data.message || 'Booking failed');
            }
        } catch (error) {
            toast.dismiss();
            toast.error(error.message || 'Failed to book appointment. Please try again.', {
                position: "top-right",
                autoClose: 5000
            });

            showStatusMessage(
                error.message || 'Failed to book appointment. Please try again.',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMinDate = () => {
        return todayDate;
    };

    const getTimeRange = (time) => {
        const hour = parseInt(time.split(':')[0]);
        const nextHour = hour + 1;
        const nextHourStr = `${nextHour.toString().padStart(2, '0')}:00`;
        return `${time} - ${nextHourStr}`;
    };

    const getSlotStatusInfo = (status) => {
        switch (status) {
            case 'booked':
                return {
                    icon: <FiXCircle />,
                    text: 'Booked',
                    className: 'booked'
                };
            case 'unavailable':
                return {
                    icon: <FiXCircle />,
                    text: 'Unavailable',
                    className: 'unavailable'
                };
            case 'available':
                return {
                    icon: null,
                    text: 'Available',
                    className: 'available'
                };
            default:
                return {
                    icon: <FiAlertCircle />,
                    text: 'Not Available',
                    className: 'unavailable'
                };
        }
    };

    const getScheduleMessage = () => {
        if (isOff) {
            return "No appointments available on this date";
        }
        if (scheduleType === 'custom') {
            const availableCount = allSlots.filter(s => s.status === 'available').length;
            const bookedCount = allSlots.filter(s => s.status === 'booked').length;
            return `${availableCount} available, ${bookedCount} booked`;
        }
        return "All the time slots alloted in ADT or AST time zone.";
    };

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

    return (
        <>
            <ToastContainer />
            <motion.section
                className="appointment-section"
                id="appointment-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1,
                            delayChildren: 0.2
                        }
                    }
                }}
            >
                <div className="appointment-header">
                    <motion.span
                        className="appointment-pill"
                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                    >
                        Book Appointment
                    </motion.span>
                    <motion.h2 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
                        Schedule Your Free <span>Financial Consultation</span>
                    </motion.h2>
                    <motion.p variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
                        Select a convenient time for<span className="mobile-br"><br /></span> your personalized financial<span className="mobile-br"><br /></span> planning session.
                    </motion.p>
                </div>

                <div className="appointment-content">
                    {/* LEFT SIDE - FORM */}
                    <motion.div
                        className="appointment-form-section"
                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                    >
                        <div className="appointment-form-container">
                            <div className="form-header">
                                <div className="form-header-icon">
                                    <FiEdit3 />
                                </div>
                                <div className="form-header-content">
                                    <h3>Personal Information</h3>
                                    <p>Quick details to confirm your appointment.</p>
                                </div>
                            </div>

                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ errors, touched, setFieldValue, setFieldError }) => (
                                    <Form className="appointment-form">
                                        <div className="form-group">
                                            <label htmlFor="name">
                                                <FiUser /> Full Name *
                                            </label>
                                            <Field
                                                type="text"
                                                id="name"
                                                name="name"
                                                placeholder="Enter your full name"
                                                className={`form-input ${errors.name && touched.name ? 'error' : ''}`}
                                            />
                                            <ErrorMessage name="name" component="div" className="error-message" />
                                        </div>

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
                                            />
                                            <ErrorMessage name="email" component="div" className="error-message" />
                                        </div>

                                        {/* Phone with Manual Country Code Dropdown */}
                                        <div className="form-group phone-group">
                                            <label htmlFor="phone">
                                                <FiPhone /> Phone Number *
                                            </label>
                                            <div className="phone-input-wrapper">
                                                {/* Country Code Dropdown */}
                                                <div className="country-dropdown">
                                                    <button
                                                        type="button"
                                                        className="country-select-btn"
                                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                        aria-label="Select country code"
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

                                                {/* Phone Number Input */}
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    placeholder="Enter 10-digit phone number"
                                                    value={phoneNumber}
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
                                                    className={`phone-number-input ${errors.phone && touched.phone ? 'error' : ''}`}
                                                />
                                            </div>
                                            <ErrorMessage name="phone" component="div" className="error-message" />
                                            {phoneNumber.length > 0 && phoneNumber.length !== 10 && (
                                                <div className="phone-hint">
                                                    <FiAlertCircle /> Phone number must be exactly 10 digits (current: {phoneNumber.length})
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="date">
                                                <FiCalendar /> Select Date *
                                            </label>
                                            <div className="date-picker-wrapper">
                                                <div className="date-input-container">
                                                    <FiCalendar className="date-input-icon" />
                                                    <input
                                                        type="date"
                                                        id="date"
                                                        name="date"
                                                        min={getMinDate()}
                                                        max={getMaxDate()}
                                                        value={selectedDate}
                                                        onChange={handleDateChange}
                                                        className="form-input date-picker-input"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            {!selectedDate && <div className="error-message">Please select a date</div>}
                                        </div>

                                        <div className="booking-note">
                                            <div className="booking-note-icon">
                                                <FiInfo />
                                            </div>
                                            <div className="booking-note-content">
                                                <p className="booking-note-title">Booking Information</p>
                                                <p className="booking-note-text">
                                                    Bookings are available for the next 15 calendar days (including today).
                                                    For dates beyond this period, please check back tomorrow.
                                                </p>
                                            </div>
                                        </div>

                                        {selectedDate && (
                                            <motion.div
                                                className="selected-date-display"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="selected-date-icon">
                                                    <FiCheckCircle />
                                                </div>
                                                <div className="selected-date-text">
                                                    <strong>Selected Date:</strong> {formatDate(selectedDate)}
                                                </div>
                                            </motion.div>
                                        )}

                                        <button type="submit" style={{ display: 'none' }} />
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </motion.div>

                    {/* RIGHT SIDE - TIME SLOTS */}
                    <motion.div
                        className="appointment-time-section"
                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                    >
                        <div className="time-slots-container">
                            <div className="time-slots-header">
                                <h3>
                                    <FiClock /> Available Time Slots
                                </h3>
                                {selectedDate ? (
                                    <p>{getScheduleMessage()}</p>
                                ) : (
                                    <p>Please select a date first</p>
                                )}

                                {isLoadingSlots && (
                                    <div className="loading-slots">
                                        <FiLoader className="spinner" /> Loading available slots...
                                    </div>
                                )}

                                {isOff && selectedDate && (
                                    <div className="off-message">
                                        <FiAlertCircle /> This date is not available for appointments
                                    </div>
                                )}
                            </div>

                            {/* Time Slots Grid */}
                            {!isLoadingSlots && selectedDate && allSlots.length > 0 && (
                                <div className={`time-slots-grid ${allSlots.length > 8 ? 'scrollable' : ''}`}>
                                    {allSlots.map((slot, index) => {
                                        const statusInfo = getSlotStatusInfo(slot.status);
                                        const isSelected = selectedTime === slot.time;
                                        const isDisabled = slot.status !== 'available';
                                        const timeRange = getTimeRange(slot.time);

                                        return (
                                            <motion.button
                                                key={index}
                                                type="button"
                                                className={`time-slot ${statusInfo.className} ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleTimeSlotClick(slot.time)}
                                                disabled={isDisabled}
                                                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                            >
                                                <div className="time-slot-content">
                                                    <div className="time-range">
                                                        <span className="time">{timeRange}</span>
                                                    </div>
                                                    <div className="time-slot-status">
                                                        {statusInfo.icon}
                                                        <span>{statusInfo.text}</span>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <motion.div
                                                        className="time-slot-indicator"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* No Slots Message */}
                            {!isLoadingSlots && selectedDate && allSlots.length === 0 && (
                                <div className="no-slots-message">
                                    <FiAlertCircle />
                                    <p>No time slots available on this date</p>
                                </div>
                            )}

                            {/* Selected Time Display */}
                            {selectedTime && (
                                <motion.div
                                    className="selected-time-display"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="selected-time-content">
                                        <div className="time-icon">
                                            <FiClock />
                                        </div>
                                        <div className="time-details">
                                            <h4>Selected Time Slot</h4>
                                            <p className="time-slot-detail">
                                                {getTimeRange(selectedTime)}
                                            </p>
                                            {selectedDate && (
                                                <p className="time-date-detail">
                                                    On {formatDate(selectedDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                type="button"
                                className="appointment-submit-btn"
                                onClick={() => {
                                    if (!selectedDate || !selectedTime) {
                                        toast.dismiss();
                                        toast.error("Please select both date and time", {
                                            position: "top-right",
                                            autoClose: 3000
                                        });
                                        return;
                                    }
                                    const form = document.querySelector('.appointment-form');
                                    if (form) {
                                        const submitEvent = new Event('submit', {
                                            cancelable: true,
                                            bubbles: true
                                        });
                                        form.dispatchEvent(submitEvent);
                                    }
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting || !selectedDate || !selectedTime || isOff}
                            >
                                {isSubmitting ? (
                                    <><FiLoader className="submit-spinner" /> Submitting...</>
                                ) : (
                                    "Request Appointment"
                                )}
                                <span><FiArrowRight /></span>
                            </motion.button>

                            {/* Status Message Below Submit Button */}
                            <AnimatePresence>
                                {statusMessage && (
                                    <motion.div
                                        className={`status-message ${statusType}`}
                                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="status-message-content">
                                            <motion.div
                                                className="status-icon"
                                                initial={{ scale: 0, rotate: -30 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.1 }}
                                            >
                                                {statusType === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                                            </motion.div>
                                            <div className="status-text-wrap">
                                                <p className="status-title">
                                                    {statusType === 'success' ? 'Appointment Requested!' : 'Something Went Wrong'}
                                                </p>
                                                <p className="status-text">{statusMessage}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="status-close-btn"
                                                onClick={() => {
                                                    setStatusMessage(null);
                                                    setStatusType(null);
                                                }}
                                                aria-label="Dismiss message"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                        <motion.div
                                            className="status-progress-bar"
                                            initial={{ width: "100%" }}
                                            animate={{ width: "0%" }}
                                            transition={{ duration: 7, ease: "linear" }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </>
    );
};

export default AppointmentSection;