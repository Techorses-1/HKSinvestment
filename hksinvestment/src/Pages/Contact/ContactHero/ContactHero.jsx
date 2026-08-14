import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMediaQuery } from "react-responsive";
import "./ContactHero.scss";

const ContactHero = () => {
    // Check viewport sizes
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1250 });
    const isDesktop = useMediaQuery({ minWidth: 1251 });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeOut"
            }
        }
    };

    const titleVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    // Animation for the highlighted word
    const highlightVariants = {
        initial: {
            scale: 1,
            boxShadow: "0 0 0 rgba(94, 38, 144, 0.4)"
        },
        animate: {
            scale: [1, 1.02, 1],
            boxShadow: [
                "0 0 0 rgba(94, 38, 144, 0.4)",
                "0 0 15px rgba(94, 38, 144, 0.6)",
                "0 0 0 rgba(94, 38, 144, 0.4)"
            ],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        hover: {
            scale: 1.05,
            backgroundColor: "rgba(122, 61, 184, 0.25)",
            borderColor: "#8a4fc8",
            boxShadow: "0 0 25px rgba(94, 38, 144, 0.8)",
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    // Function to scroll to appointment section
    const scrollToAppointment = () => {
        const appointmentSection = document.getElementById("appointment-section");
        if (appointmentSection) {
            appointmentSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />

            <motion.section
                className="contact-hero-wrapper"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="contact-hero-top">
                    <motion.div
                        className="contact-hero-content"
                        variants={containerVariants}
                    >
                        <motion.h1
                            className="contact-hero-title"
                            variants={titleVariants}
                        >
                            {isMobile && (
                                // MOBILE VIEW - 3 lines
                                <>
                                    One{" "}
                                    <motion.span
                                        className="contact-highlight contact-highlight-mobile"
                                        variants={highlightVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover="hover"
                                    >
                                        decision
                                    </motion.span>{" "}
                                    that
                                    <br />
                                    can change
                                    <br />
                                    your{" "}
                                    <motion.span
                                        className="contact-highlight contact-highlight-mobile"
                                        variants={highlightVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover="hover"
                                    >
                                        life
                                    </motion.span>
                                </>
                            )}

                            {isTablet && (
                                // TABLET VIEW - 2 lines
                                <>
                                    One{" "}
                                    <motion.span
                                        className="contact-highlight"
                                        variants={highlightVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover="hover"
                                    >
                                        decision
                                    </motion.span>{" "}
                                    that can
                                    <br />
                                    change your{" "}
                                    <motion.span
                                        className="contact-highlight"
                                        variants={highlightVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover="hover"
                                    >
                                        life.
                                    </motion.span>
                                </>
                            )}

                            {isDesktop && (
                                // DESKTOP VIEW - 1 line
                                <>
                                    One{" "}
                                    <motion.span
                                        className="contact-highlight"
                                        variants={highlightVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover="hover"
                                    >
                                        decision
                                    </motion.span>{" "}
                                    that can change your{" "}
                                    <motion.span
                                        className="contact-highlight"
                                        variants={highlightVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover="hover"
                                    >
                                        life.
                                    </motion.span>
                                </>
                            )}
                        </motion.h1>

                        <motion.p
                            className="contact-hero-subtitle"
                            variants={itemVariants}
                        >
                            Get personalized financial guidance today! <br className="desktop-only" />Our expert advisors are ready to help you achieve your goals.
                        </motion.p>

                        <motion.button
                            className="contact-hero-btn"
                            variants={itemVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={scrollToAppointment}
                        >
                            <span className="contact-hero-btn-fill"></span>
                            <span className="contact-hero-btn-text">Schedule a Meeting</span>
                            <span className="contact-hero-btn-arrow">
                                <FiArrowRight />
                            </span>
                        </motion.button>
                    </motion.div>
                </div>
            </motion.section>
        </>
    );
};

export default ContactHero;