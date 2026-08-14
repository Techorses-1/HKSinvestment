import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminAuth.scss';

const AdminAuth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // API Base URL
    const API_URL = import.meta.env.VITE_API_URL || 'https://hksinvenstmentbackend.onrender.com/api';

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (isLogin) {
            // Login validation
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }

            if (!formData.password.trim()) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }
        } else {
            // Register validation
            if (!formData.username.trim()) {
                newErrors.username = 'Username is required';
            } else if (formData.username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters';
            }

            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }

            if (!formData.password.trim()) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }

            if (!formData.confirmPassword.trim()) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const endpoint = isLogin ? '/admin/login' : '/admin/register';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (data.success) {
                // Save token to localStorage
                localStorage.setItem('adminToken', data.data.token);
                localStorage.setItem('adminData', JSON.stringify(data.data.admin));

                // Show success toast
                toast.success(isLogin ? 'Login successful!' : 'Registration successful!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                });

                // Redirect to admin dashboard
                navigate('/admin-portal/dashboard');
            } else {
                throw new Error(data.message || 'Operation failed');
            }

        } catch (error) {
            console.error('Authentication error:', error);
            // Show error toast
            toast.error(error.message || 'Authentication failed!', {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle between login and register
    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    // Button variants matching CareerForm
    const buttonVariants = {
        initial: {
            background: "#5e2690",
            color: "#fff"
        },
        hover: {
            background: "#fff",
            color: "#5e2690",
            border: "2px solid #5e2690",
            scale: 1.02,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        tap: {
            scale: 0.98,
            transition: {
                duration: 0.1
            }
        }
    };

    const arrowVariants = {
        hover: {
            rotate: 45,
            scale: 1.1,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="admin-auth-container">
            <ToastContainer />
            <div className="admin-auth-wrapper">
                {/* Left side - Info */}
                <motion.div
                    className="auth-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="left-content">
                        <div className="logo-container">
                            <h1>HKS Investment</h1>
                        </div>

                        <div className="info-section">
                            <h3>Administrator Access</h3>
                            <p>
                                {isLogin
                                    ? 'Sign in to manage your investment platform.'
                                    : 'Create an admin account to access the management portal.'
                                }
                            </p>
                        </div>

                        {/* New features list */}
                        <div className="features-section">
                            <h3>Admin Capabilities</h3>
                            <ul className="features-list">
                                <li><span className="check">✓</span> Manage Appointments</li>
                                <li><span className="check">✓</span> View Contact Form Submissions</li>
                                <li><span className="check">✓</span> General Inquiry Data</li>
                                <li><span className="check">✓</span> Service Form Responses</li>
                                <li><span className="check">✓</span> Career Applications</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Right side - Form */}
                <motion.div
                    className="auth-right"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="auth-form-container">
                        {/* Toggle Buttons */}
                       {/* <div className="auth-toggle">
                            <button
                                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            <button
                                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Register
                            </button>
                        </div> */}

                        {/* Form Title */}
                        <h2 className="form-title">
                            {isLogin ? 'Welcome Back' : 'Create Admin Account'}
                        </h2>
                        <p className="form-subtitle">
                            {isLogin
                                ? 'Please enter your credentials'
                                : 'Fill in the details to create an account'
                            }
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Username Field (Register only) */}
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="username">
                                        <FiUser /> Username *
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Enter username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={errors.username ? 'error' : ''}
                                    />
                                    {errors.username && (
                                        <span className="error-message">{errors.username}</span>
                                    )}
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="email">
                                    <FiMail /> Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && (
                                    <span className="error-message">{errors.email}</span>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label htmlFor="password">
                                    <FiLock /> Password *
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={errors.password ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="error-message">{errors.password}</span>
                                )}
                            </div>

                            {/* Confirm Password Field (Register only) */}
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <FiLock /> Confirm Password *
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={errors.confirmPassword ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <span className="error-message">{errors.confirmPassword}</span>
                                    )}
                                </div>
                            )}

                            {/* Submit Button - EXACT SAME as CareerForm */}
                            <motion.button
                                type="submit"
                                className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                                variants={buttonVariants}
                                initial="initial"
                                whileHover={isSubmitting ? {} : "hover"}
                                whileTap={isSubmitting ? {} : "tap"}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span>Processing...</span>
                                        <div className="spinner"></div>
                                    </>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <motion.span variants={arrowVariants}>
                                            <FiArrowRight />
                                        </motion.span>
                                    </>
                                )}
                            </motion.button>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="submit-error">
                                    <span className="error-icon">⚠️</span>
                                    {errors.submit}
                                </div>
                            )}

                            {/* Toggle Link */}
                            {/* <div className="toggle-link">
                                <p>
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    <button type="button" onClick={toggleAuthMode}>
                                        {isLogin ? 'Register here' : 'Login here'}
                                    </button>
                                </p>
                            </div> */}

                            {/* Back to Home */}
                            <div className="back-home">
                                <button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => navigate('/')}
                                >
                                    ← Back to Home
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminAuth;