import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive"; // ← added
import "./CareerHero.scss";

const CareerHero = ({ onJoinClick }) => {
    // Check if mobile
    const isMobile = useMediaQuery({ maxWidth: 768 });

    // Animation variants - SAME AS ORIGINAL
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

    // Handle button click
    const handleJoinClick = (e) => {
        e.preventDefault();
        if (onJoinClick) {
            onJoinClick();
        }
    };

    return (
        <motion.section
            className="career-hero-wrapper"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="career-hero-top">
                <motion.div
                    className="career-hero-content"
                    variants={containerVariants}
                >
                    <motion.h1
                        className="career-hero-title"
                        variants={titleVariants}
                    >
                        Build your <br />
                        <motion.span 
                            className={`career-highlight ${isMobile ? 'career-highlight-mobile' : ''}`}
                            variants={highlightVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                        >
                            future
                        </motion.span> 
                        {" "}with us
                    </motion.h1>

                    <motion.p
                        className="career-hero-subtitle"
                        variants={itemVariants}
                    >
                        Join a team that's reshaping financial technology!<br className="desktop-only" /> Grow your career while making a real impact.
                    </motion.p>

                    <motion.button
                        className="career-hero-btn"
                        variants={itemVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={handleJoinClick}
                    >
                        <span className="career-hero-btn-fill"></span>
                        <span className="career-hero-btn-text">Join Us</span>
                        <span className="career-hero-btn-arrow">
                            <FiArrowRight />
                        </span>
                    </motion.button>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default CareerHero;