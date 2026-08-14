import React from "react";
import {
    FiTrendingUp,
    FiDollarSign,
    FiPieChart,
    FiBarChart2,
    FiShield
} from "react-icons/fi";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./About.scss";
import { BsShieldFillCheck, BsBank2 } from "react-icons/bs";
import { MdOutlineSell } from "react-icons/md";
import { motion } from "framer-motion";
import roboimag from "../../../assets/images/home/about/robo.png"

const About = () => {
    const navigate = useNavigate();

    // FIXED: Use navigation state instead of manual scroll
    const handleScheduleClick = () => {
        navigate('/contact', { 
            state: { scrollTo: 'appointment-section' } 
        });
    };

    // Animation variants for circles
    const circleVariants = {
        animate: {
            scale: [1, 1.02, 1],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const circleInnerVariants = {
        animate: {
            scale: [1, 1.03, 1],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
            }
        }
    };

    // DIFFERENT ANIMATIONS FOR EACH TAG
    const tagVariants = {
        initial: { opacity: 0, y: 20, scale: 0.8 },
        animate: (i) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                delay: i * 0.1 + 0.5,
                ease: "backOut"
            }
        }),
        hover: (i) => {
            // Different hover animations for each tag
            const animations = {
                0: { // Shares
                    scale: 1.15,
                    backgroundColor: "#e6dcf7",
                    borderColor: "#5e2690",
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.4 }
                },
                1: { // Sell
                    scale: 1.15,
                    backgroundColor: "#e6dcf7",
                    borderColor: "#5e2690",
                    y: [0, -8, 0],
                    transition: { duration: 0.4 }
                },
                2: { // Yield
                    scale: 1.15,
                    backgroundColor: "#e6dcf7",
                    borderColor: "#5e2690",
                    x: [0, 8, -8, 0],
                    transition: { duration: 0.5 }
                },
                3: { // Finance
                    scale: 1.15,
                    backgroundColor: "#e6dcf7",
                    borderColor: "#5e2690",
                    rotate: [0, 360],
                    transition: { duration: 0.5 }
                },
                4: { // Trends
                    scale: 1.15,
                    backgroundColor: "#e6dcf7",
                    borderColor: "#5e2690",
                    skewX: [0, 10, -10, 0],
                    transition: { duration: 0.4 }
                },
                5: { // Investment
                    scale: 1.15,
                    backgroundColor: "#e6dcf7",
                    borderColor: "#5e2690",
                    rotate: [0, -8, 8, 0],
                    transition: { duration: 0.4 }
                }
            };
            return animations[i] || { scale: 1.1 };
        }
    };

    // Shield SVG animation variant
    const shieldVariants = {
        initial: { scale: 1, rotate: 0 },
        hover: {
            scale: 1.15,
            rotate: [0, 8, -8, 0],
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    // Section animation
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

    const headerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const pillVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "backOut"
            }
        }
    };

    const contentVariants = {
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

    // UPDATED TAGS WITH NEW ICONS
    const tags = [
        { className: "shares", icon: <FiPieChart />, text: "Shares" },
        { className: "sell", icon: <MdOutlineSell />, text: "Sell" },
        { className: "yield", icon: <FiBarChart2 />, text: "Yield" },
        { className: "finance", icon: <FiDollarSign />, text: "Finance" },
        { className: "trends", icon: <FiTrendingUp />, text: "Trends" },
        { className: "invest", icon: <BsBank2 />, text: "Investment" }
    ];

    return (
        <div className="main-about">
            <motion.section
                className="about-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                {/* HEADER */}
                <motion.div
                    className="about-header"
                    variants={headerVariants}
                >
                    <motion.span
                        className="about-pill"
                        variants={pillVariants}
                    >
                        About Us
                    </motion.span>
                    <motion.h2
                        variants={headerVariants}
                    >
                        Personal financial guidance for <br />
                        smarter investing and saving
                    </motion.h2>
                </motion.div>

                <div className="about-content">
                    {/* LEFT VISUAL */}
                    <motion.div
                        className="about-visual"
                        variants={contentVariants}
                    >
                        <div className="circle-wrap">
                            {/* Animated circles */}
                            <motion.div
                                className="circle-mid"
                                variants={circleVariants}
                                animate="animate"
                            >
                                <motion.div
                                    className="circle-inner"
                                    variants={circleInnerVariants}
                                    animate="animate"
                                >
                                    <motion.img
                                        src={roboimag}
                                        alt="Finance AI"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.8 }}
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Animated Tags - EACH WITH DIFFERENT ANIMATION */}
                            {tags.map((tag, index) => (
                                <motion.span
                                    key={index}
                                    className={`tag ${tag.className}`}
                                    custom={index}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                    variants={tagVariants}
                                    viewport={{ once: true }}
                                >
                                    {tag.icon} {tag.text}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT TEXT */}
                    <motion.div
                        className="about-text"
                        variants={contentVariants}
                    >
                        <motion.div
                            className="about-icon-wrapper"
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            variants={shieldVariants}
                        >
                            <svg
                                className="about-shield-svg"
                                width="50"
                                height="50"
                                viewBox="0 0 64 64"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Outer Shield - using theme purple */}
                                <path
                                    d="M32 4L56 12V28C56 42 45 52 32 58C19 52 8 42 8 28V12L32 4Z"
                                    stroke="#5e2690"  /* Darker theme purple for stroke */
                                    strokeWidth="4"
                                    fill="#efe8fb"     /* Light theme purple for fill */
                                />

                                {/* Inner Shield - using medium theme purple */}
                                <path
                                    d="M32 14L46 19V28C46 37 39 44 32 48C25 44 18 37 18 28V19L32 14Z"
                                    stroke="#7a3db8"   /* Medium theme purple for stroke */
                                    strokeWidth="2"
                                    fill="#e6dcf7"     /* Light-medium theme purple for fill */
                                />

                                {/* Check Mark - using darker theme purple */}
                                <path
                                    d="M26 30L30 34L38 26"
                                    stroke="#5e2690"   /* Darker theme purple for checkmark */
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            Personalized financial guidance designed around your goals,
                            income, and risk profile. We help you make smart decisions
                            on saving, investing, and wealth protection.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            We help you make smart decisions on saving, investing, and
                            wealth protection. Personalized financial guidance designed
                            around your goals, income, and risk profile.
                        </motion.p>

                        {/* BUTTON - WITH NAVIGATION */}
                        <motion.button
                            className="about-btn"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleScheduleClick}
                        >
                            <span className="about-btn-fill"></span>
                            <span className="about-btn-text">Schedule</span>
                            <span className="about-btn-arrow">
                                <FiArrowRight />
                            </span>
                        </motion.button>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
};

export default About;