// HeroSection.jsx
import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom"; // ADDED
import "./HeroSection.scss";
import coin from "../../../assets/images/home/hero/coin.png";
import bar from "../../../assets/images/home/hero/bar.png";

const HeroSection = () => {
    const navigate = useNavigate(); // ADDED

    // For bottom section animation trigger
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    // Animation variants - ONLY FOR TOP SECTION (COMPLETELY UNCHANGED)
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

    const buttonVariants = {
        initial: { background: "#5e2690", scale: 1 },
        hover: {
            background: "#4a1f73",
            scale: 1.05,
            transition: { duration: 0.3, ease: "easeInOut" }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
        }
    };

    // Bottom section animation variants
    const bottomContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const bottomItemVariants = {
        hidden: {
            opacity: 0,
            y: 30
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    // ✅ FIXED: Bar chart animation with DIFFERENT heights based on values
    const barVariants = {
        hidden: {
            height: "0%",
            opacity: 0
        },
        visible: (value) => ({
            height: `${(value / 29) * 90}%`, // Calculate percentage based on max value (29)
            opacity: 1,
            transition: {
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3
            }
        })
    };

    // Bar values
    const barValues = [8, 12, 16, 20, 29];

    // ADDED: Handler function for consultation button click
    const handleConsultationClick = () => {
        navigate('/contact'); // Navigate to contact page

        // Small delay to ensure page loads before scrolling
        setTimeout(() => {
            const appointmentSection = document.getElementById('appointment-section');
            if (appointmentSection) {
                appointmentSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    };

    return (
        <motion.section
            className="hero-wrapper"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* ===== TOP HERO - COMPLETELY UNCHANGED ===== */}
            <div className="hero-top">
                <motion.div
                    className="hero-content"
                    variants={containerVariants}
                >
                    <motion.h1
                        className="hero-title"
                        variants={titleVariants}
                    >
                        Clarity for every <br />
                        <span className="financial-highlight word-slider-wrapper">
                            <span className="loader">
                                <span className="words">
                                    <span className="word">Financial</span>
                                    <span className="word">Wealth</span>
                                    <span className="word">Portfolio</span>
                                    <span className="word">Financial</span>
                                </span>
                            </span>
                        </span> move
                    </motion.h1>

                    <motion.p
                        className="hero-subtitle"
                        variants={itemVariants}
                    >
                        Take control of your financial future!
                        <br />
                        Smart financial support for steady growth and peace of mind.
                    </motion.p>

                    <motion.button
                        className="hero-btn"
                        variants={itemVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={handleConsultationClick} // ADDED
                    >
                        <span className="hero-btn-fill"></span>
                        <span className="hero-btn-text">Book a Free Consultation</span>
                        <span className="hero-btn-arrow">
                            <FiArrowRight />
                        </span>
                    </motion.button>
                </motion.div>
            </div>

            {/* ===== BOTTOM SECTION - WITH SCROLL ANIMATION ===== */}
            <motion.div
                ref={ref}
                className="hero-bottom-section"
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={bottomContainerVariants}
            >
                <div className="hero-bottom-bg">
                    <div className="hero-bottom-grid">

                        {/* ===== COLUMN 1 - TWO INDEPENDENT DIVS ===== */}
                        <div className="hero-bottom-col-stack">
                            {/* DIV 1: COIN - ANIMATED ON SCROLL */}
                            <motion.div
                                className="hero-coin-box"
                                variants={bottomItemVariants}
                            >
                                <img src={coin} alt="coins" />
                            </motion.div>

                            {/* DIV 2: TEXT - ANIMATED ON SCROLL */}
                            <motion.div
                                className="hero-text-box"
                                variants={bottomItemVariants}
                            >
                                <div className="quote-mark">
                                    <FaQuoteLeft />
                                </div>
                                <p>
                                    Your <br /> Pathway to <br />
                                    <strong>Financial</strong> <br />
                                    Prosperity <br /> Starts Here!
                                </p>
                            </motion.div>
                        </div>

                        {/* ===== COLUMN 2 - BAR IMAGE - ANIMATED ON SCROLL ===== */}
                        <motion.div
                            className="hero-bottom-col hero-bottom-col-image"
                            variants={bottomItemVariants}
                        >
                            <div className="hero-bottom-fixed-image">
                                <img src={bar} alt="growth" />
                            </div>
                        </motion.div>

                        {/* ===== COLUMN 3 - BAR CHART - WITH PROPER HEIGHT ANIMATION ===== */}
                        <motion.div
                            className="hero-bottom-col hero-bottom-col-right"
                            variants={bottomItemVariants}
                        >
                            <div className="full-height">
                                <div className="hero-bottom-bar-chart">
                                    {/* ✅ FIXED: Each bar gets its actual value for height calculation */}
                                    <motion.div
                                        className="hero-bottom-bar hero-bottom-bar1"
                                        custom={barValues[0]}
                                        variants={barVariants}
                                        initial="hidden"
                                        animate={inView ? "visible" : "hidden"}
                                    >{barValues[0]}</motion.div>
                                    <motion.div
                                        className="hero-bottom-bar hero-bottom-bar2"
                                        custom={barValues[1]}
                                        variants={barVariants}
                                        initial="hidden"
                                        animate={inView ? "visible" : "hidden"}
                                    >{barValues[1]}</motion.div>
                                    <motion.div
                                        className="hero-bottom-bar hero-bottom-bar3"
                                        custom={barValues[2]}
                                        variants={barVariants}
                                        initial="hidden"
                                        animate={inView ? "visible" : "hidden"}
                                    >{barValues[2]}</motion.div>
                                    <motion.div
                                        className="hero-bottom-bar hero-bottom-bar4"
                                        custom={barValues[3]}
                                        variants={barVariants}
                                        initial="hidden"
                                        animate={inView ? "visible" : "hidden"}
                                    >{barValues[3]}</motion.div>
                                    <motion.div
                                        className="hero-bottom-bar hero-bottom-bar5"
                                        custom={barValues[4]}
                                        variants={barVariants}
                                        initial="hidden"
                                        animate={inView ? "visible" : "hidden"}
                                    >{barValues[4]}</motion.div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default HeroSection;