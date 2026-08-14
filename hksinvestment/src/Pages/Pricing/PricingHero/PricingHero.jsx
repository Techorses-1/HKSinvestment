import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import "./PricingHero.scss";

const PricingHero = ({ onViewPlansClick }) => {
    // Check viewport sizes
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1200 });
    const isDesktop = useMediaQuery({ minWidth: 1201 });

    // Animation variants - SAME AS ORIGINAL TOP SECTION
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

    // Animation for the highlighted word (pulse + glow)
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
    const handleViewPlansClick = (e) => {
        e.preventDefault();
        if (onViewPlansClick) {
            onViewPlansClick();
        }
    };

    return (
        <motion.section
            className="pricing-hero-wrapper"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="pricing-hero-top">
                <motion.div
                    className="pricing-hero-content"
                    variants={containerVariants}
                >
                    <motion.h1
                        className="pricing-hero-title"
                        variants={titleVariants}
                    >
                        {isDesktop && (
                            // DESKTOP VIEW - 1 line
                            <>
                                Simple, transparent{" "}
                                <motion.span 
                                    className="pricing-highlight"
                                    variants={highlightVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                >
                                    pricing
                                </motion.span>{" "}
                                built for self traders
                            </>
                        )}

                        {isTablet && (
                            // TABLET VIEW - 3 lines
                            <>
                                Simple, transparent<span className="tablet-br-1"><br /></span>{" "}
                                <motion.span 
                                    className="pricing-highlight"
                                    variants={highlightVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                >
                                    pricing
                                </motion.span>{" "}
                                built for<span className="tablet-br-2"><br /></span> self traders
                            </>
                        )}

                        {isMobile && (
                            // MOBILE VIEW - with mobile class for no bg/border
                            <>
                                Simple, transparent{" "}
                                <motion.span 
                                    className="pricing-highlight pricing-highlight-mobile"
                                    variants={highlightVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                >
                                    pricing
                                </motion.span>{" "}
                                built for<span className="mobile-br"><br /></span> self traders
                            </>
                        )}
                    </motion.h1>

                    <motion.p
                        className="pricing-hero-subtitle"
                        variants={itemVariants}
                    >
                        {isDesktop && (
                            // DESKTOP - 1 line
                            <>
                                Choose the perfect plan for your financial journey! No hidden fees. Cancel anytime.
                            </>
                        )}

                        {isTablet && (
                            // TABLET - with tablet line breaks
                            <>
                                Choose the perfect plan for your<span className="tablet-br-3"><br /></span> financial journey! No hidden fees.<span className="tablet-br-4"><br /></span> Cancel anytime.
                            </>
                        )}

                        {isMobile && (
                            // MOBILE - with mobile line breaks
                            <>
                                Choose the perfect plan for your<span className="mobile-br"><br /></span> financial journey! No hidden fees.<span className="mobile-br"><br /></span> Cancel anytime.
                            </>
                        )}
                    </motion.p>

                    <motion.button
                        className="pricing-hero-btn"
                        variants={itemVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={handleViewPlansClick}
                    >
                        <span className="pricing-hero-btn-fill"></span>
                        <span className="pricing-hero-btn-text">View Plans</span>
                        <span className="pricing-hero-btn-arrow">
                            <FiArrowRight />
                        </span>
                    </motion.button>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default PricingHero;