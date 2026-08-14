import React, { useState } from "react";
import {
    FiInstagram,
    FiSend
} from "react-icons/fi";
import {
    TbBrandWhatsapp,
    TbBrandYoutube,
    TbBrandDiscord
} from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { NavLink } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Footer.scss";

const Footer = () => {
    const [formData, setFormData] = useState({
        name: "",
        feedback: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const columnVariants = {
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

    const socialIconVariants = {
        initial: { scale: 1, color: "#d9ccf3" },
        hover: {
            scale: 1.3,
            color: "#ffffff",
            rotate: 360,
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    const listItemVariants = {
        initial: { x: 0, opacity: 0.8 },
        hover: {
            x: 15,
            color: "#ffffff",
            opacity: 1,
            textShadow: "0 0 8px rgba(255,255,255,0.5)",
            transition: {
                duration: 0.4,
                ease: [0.19, 1, 0.22, 1]
            }
        }
    };

    const contactItemVariants = {
        initial: { opacity: 0.8, x: 0 },
        hover: {
            opacity: 1,
            x: 8,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    const contactIconVariants = {
        initial: { scale: 1, color: "#d9ccf3" },
        hover: {
            scale: 1.2,
            color: "#ffffff",
            rotate: [0, -10, 10, 0],
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        }
    };

    const bottomTextVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    };

    const copyrightVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 0.85,
            transition: { duration: 0.6, delay: 0.5 }
        }
    };

    const pulseVariants = {
        initial: { opacity: 0.9 },
        animate: {
            opacity: [0.9, 1, 0.9],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
    };

    const buttonVariants = {
        initial: {
            background: "linear-gradient(90deg, #5e2690, #7a3db8)",
            scale: 1,
            boxShadow: "0 4px 15px rgba(94, 38, 144, 0.2)"
        },
        hover: {
            scale: 1.05,
            boxShadow: "0 15px 30px rgba(94, 38, 144, 0.6), 0 0 20px rgba(217, 204, 243, 0.4)",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
                boxShadow: { duration: 0.4 }
            }
        },
        tap: { scale: 0.98, transition: { duration: 0.1 } }
    };

    const arrowIconVariants = {
        initial: { x: 0, rotate: 0 },
        hover: {
            x: 5,
            rotate: 15,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        }
    };

    const headerVariants = {
        initial: { letterSpacing: "1px", opacity: 0.7 },
        hover: {
            letterSpacing: "2px",
            opacity: 1,
            textShadow: "0 0 10px rgba(217, 204, 243, 0.5)",
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const inputVariants = {
        initial: {
            borderColor: "rgba(217, 204, 243, 0.3)",
            scale: 1,
            boxShadow: "0 0 0 rgba(217, 204, 243, 0)"
        },
        focus: {
            borderColor: "#d9ccf3",
            scale: 1.02,
            boxShadow: "0 0 20px rgba(217, 204, 243, 0.3)",
            transition: { duration: 0.2 }
        }
    };

    const developerVariants = {
        initial: { opacity: 0.85 },
        hover: {
            opacity: 1,
            scale: 1.05,
            transition: { duration: 0.3 }
        }
    };

    const guideItems = [
        { name: "Home", path: "/" },
        { name: "Schedule", path: "/contact" },
        { name: "Career", path: "/career" },
        // { name: "Pricing", path: "/pricing" },
        { name: "Privacy Policy", path: "/privacypolicy" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ========== Real API call for feedback submission with env variable ==========
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Please enter your name", {
                position: "top-right",
                autoClose: 4000,
                closeOnClick: true,
                draggable: true,
                pauseOnHover: true
            });
            return;
        }
        if (!formData.feedback.trim()) {
            toast.error("Please enter your feedback", {
                position: "top-right",
                autoClose: 4000,
                closeOnClick: true,
                draggable: true,
                pauseOnHover: true
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Make API call to your backend with env variable
            const response = await fetch(`${import.meta.env.VITE_API_URL}/feed/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    feedback: formData.feedback.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit feedback');
            }

            if (data.success) {
                // Show success message
                toast.success(data.message || "Thank you for your feedback! 🙏", {
                    position: "top-right",
                    autoClose: 4000,
                    closeOnClick: true,
                    draggable: true,
                    pauseOnHover: true
                });

                // Clear form
                setFormData({ name: "", feedback: "" });
            } else {
                throw new Error(data.message || 'Failed to submit feedback');
            }

        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error(error.message || "Failed to submit feedback. Please try again.", {
                position: "top-right",
                autoClose: 4000,
                closeOnClick: true,
                draggable: true,
                pauseOnHover: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Social links
    const whatsappLink = "https://wa.me/17828828102?text=Hello%20HKS%20Investment%2C%20I%20have%20a%20question%20about%20your%20services.";
    const instagramLink = "https://www.instagram.com/hks.investment/";
    const youtubeLink = "https://www.youtube.com/@hks.investment";
    // TODO: replace with your real Discord invite link
    const discordLink = "https://discord.com/invite/yourinvite";

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <motion.footer
                className="footer"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
            >
                <div className="footer-container">
                    <div className="footer-top">
                        {/* COLUMN 1: FEEDBACK */}
                        <motion.div
                            className="footer-col feedback"
                            variants={columnVariants}
                        >
                            <motion.h4
                                variants={headerVariants}
                                initial="initial"
                                whileHover="hover"
                            >
                                Your feedback is important for us.
                            </motion.h4>

                            <form className="feedback-form" onSubmit={handleSubmit}>
                                <motion.div
                                    whileFocus="focus"
                                    variants={inputVariants}
                                    initial="initial"
                                >
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your name"
                                        className="feedback-input"
                                        disabled={isSubmitting}
                                    />
                                </motion.div>

                                <motion.div
                                    whileFocus="focus"
                                    variants={inputVariants}
                                    initial="initial"
                                >
                                    <textarea
                                        name="feedback"
                                        value={formData.feedback}
                                        onChange={handleInputChange}
                                        placeholder="Your feedback"
                                        className="feedback-textarea"
                                        rows="2"
                                        disabled={isSubmitting}
                                    />
                                </motion.div>

                                <motion.button
                                    type="submit"
                                    className="feedback-btn"
                                    variants={buttonVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Sending..." : "Send Feedback"}
                                    <motion.span
                                        variants={arrowIconVariants}
                                        initial="initial"
                                        whileHover="hover"
                                        className="send-icon-wrapper"
                                    >
                                        <FiSend className="send-icon" />
                                    </motion.span>
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* GROUP: BRAND + GUIDE + CONTACT */}
                        <div className="footer-group">
                            <div className="footer-group-grid">
                                {/* COLUMN 2: BRAND */}
                                <motion.div
                                    className="footer-col brand"
                                    variants={columnVariants}
                                >
                                    <motion.h3
                                        variants={pulseVariants}
                                        initial="initial"
                                        animate="animate"
                                    >
                                        Finance. Freedom. Future.
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        whileHover={{
                                            color: "#d9ccf3",
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        Redefining wealth, <br />
                                        one decision at a time.
                                    </motion.p>

                                    <div className="socials">
                                        <motion.a
                                            href={whatsappLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variants={socialIconVariants}
                                            initial="initial"
                                            whileHover="hover"
                                        >
                                            <TbBrandWhatsapp />
                                        </motion.a>

                                        <motion.a
                                            href={instagramLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variants={socialIconVariants}
                                            initial="initial"
                                            whileHover="hover"
                                        >
                                            <FiInstagram />
                                        </motion.a>

                                        <motion.a
                                            href={youtubeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variants={socialIconVariants}
                                            initial="initial"
                                            whileHover="hover"
                                        >
                                            <TbBrandYoutube />
                                        </motion.a>

                                        {/* NEW: Discord Icon */}
                                        <motion.a
                                            href={discordLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variants={socialIconVariants}
                                            initial="initial"
                                            whileHover="hover"
                                        >
                                            <TbBrandDiscord />
                                        </motion.a>
                                    </div>
                                </motion.div>

                                {/* COLUMN 3: GUIDE */}
                                <motion.div
                                    className="footer-col guide-column"
                                    variants={columnVariants}
                                >
                                    <ul className="guide-links-list">
                                        {guideItems.map((item, idx) => (
                                            <motion.li
                                                key={idx}
                                                variants={listItemVariants}
                                                initial="initial"
                                                whileHover="hover"
                                                custom={idx}
                                            >
                                                <NavLink
                                                    to={item.path}
                                                    className={({ isActive }) =>
                                                        isActive ? "guide-link active" : "guide-link"
                                                    }
                                                >
                                                    <span className="guide-item-text">{item.name}</span>
                                                    <motion.span
                                                        className="guide-arrow"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileHover={{
                                                            opacity: 1,
                                                            x: 0,
                                                            transition: { delay: 0.1 }
                                                        }}
                                                    >
                                                        →
                                                    </motion.span>
                                                </NavLink>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* COLUMN 4: CONTACT (WhatsApp number removed, icon stays in socials) */}
                                <motion.div
                                    className="footer-col contact"
                                    variants={columnVariants}
                                >
                                    <motion.p
                                        variants={contactItemVariants}
                                        whileHover="hover"
                                    >
                                        <a href="mailto:inquiry@hksinvestment.com">
                                            <motion.span
                                                variants={contactIconVariants}
                                                initial="initial"
                                                whileHover="hover"
                                            >
                                                <MdEmail />
                                            </motion.span>
                                            inquiry@hksinvestment.com
                                        </a>
                                    </motion.p>

                                    <motion.p
                                        variants={contactItemVariants}
                                        whileHover="hover"
                                        transition={{ delay: 0.1 }}
                                    >
                                        <a
                                            href="https://maps.google.com/?q=Halifax,NS,Canada"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <motion.span
                                                variants={contactIconVariants}
                                                initial="initial"
                                                whileHover="hover"
                                            >
                                                <FaLocationDot className="location-icon" />
                                            </motion.span>
                                            Halifax, NS, Canada
                                        </a>
                                    </motion.p>
                                </motion.div>
                            </div>

                            {/* COPYRIGHT ROW */}
                            <motion.div
                                className="copyright-row"
                                variants={copyrightVariants}
                            >
                                <span className="copyright-brand">
                                    Copyright © 2025 HKS Investment Consulting,
                                    <span className="tablet-only"><br /></span>
                                    <span className="mobile-only"><br /></span>
                                    {" "}All Rights Reserved.
                                </span>
                                <motion.span
                                    className="developer-text"
                                    variants={developerVariants}
                                    initial="initial"
                                    whileHover="hover"
                                >
                                    Design and Developed by <span className="tablet-only"><br /></span>
                                    <a
                                        href="https://techorses.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="developer-link"
                                    >
                                        <strong>Techorses</strong>
                                    </a>
                                </motion.span>
                            </motion.div>
                        </div>
                    </div>

                    {/* BOTTOM BIG TEXT */}
                    <motion.div
                        className="footer-bottom"
                        variants={bottomTextVariants}
                    >
                        YOUR GOALS. OUR GUIDANCE.
                    </motion.div>
                </div>
            </motion.footer>
        </>
    );
};

export default Footer;