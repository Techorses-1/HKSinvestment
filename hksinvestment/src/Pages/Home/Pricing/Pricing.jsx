import React from "react";
import { FiCheck, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";
import "./Pricing.scss";

const Pricing = () => {
    // Animation variants
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

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        },
        hover: {
            y: -8,
            boxShadow: "0 20px 40px rgba(122, 61, 184, 0.15)",
            borderColor: "#d1c4e9",
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    const buttonVariants = {
        rest: { scale: 1 },
        hover: { 
            scale: 1.03,
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        },
        tap: { scale: 0.98 }
    };

    const checkIconVariants = {
        rest: { scale: 1, rotate: 0 },
        hover: { 
            scale: 1.2,
            rotate: 5,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.section 
            className="pricing-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* HEADER */}
            <motion.div 
                className="pricing-header"
                variants={itemVariants}
            >
                <motion.span 
                    className="pricing-pill"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    Pricing
                </motion.span>
                <motion.h2
                    variants={itemVariants}
                >
                    What will it cost?
                </motion.h2>
                <motion.p
                    variants={itemVariants}
                >
                    Flexible monthly plans, cancel at any time.
                </motion.p>
            </motion.div>

            {/* CARDS */}
            <motion.div 
                className="pricing-grid"
                variants={containerVariants}
            >
                {/* BASIC */}
                <motion.div 
                    className="pricing-card"
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    whileHover="hover"
                >
                    <h3>Basic</h3>
                    <div className="price">
                        <span className="amount">
                            <FiDollarSign />50
                        </span>
                        <span className="duration">/month</span>
                    </div>

                    <div className="features-heading">Features</div>
                    <ul>
                        {["Access to basic tools", "Email support", "Monthly usage reports", "Limited to 5 projects"].map((feature, index) => (
                            <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                whileHover={{ x: 5 }}
                            >
                                <motion.span
                                    variants={checkIconVariants}
                                    whileHover="hover"
                                >
                                    <FiCheck />
                                </motion.span>
                                {feature}
                            </motion.li>
                        ))}
                    </ul>

                    <motion.button 
                        className="pricing-btn"
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Get Started
                    </motion.button>
                </motion.div>

                {/* STANDARD */}
                <motion.div 
                    className="pricing-card"
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    whileHover="hover"
                >
                    <h3>Standard</h3>
                    <div className="price">
                        <span className="amount">
                            <FiDollarSign />100
                        </span>
                        <span className="duration">/month</span>
                    </div>

                    <div className="features-heading">Features</div>
                    <ul>
                        {["Everything in Basic Package", "Access to premium tools", "Priority email and chat support", "Weekly usage reports", "Unlimited projects"].map((feature, index) => (
                            <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                whileHover={{ x: 5 }}
                            >
                                <motion.span
                                    variants={checkIconVariants}
                                    whileHover="hover"
                                >
                                    <FiCheck />
                                </motion.span>
                                {feature}
                            </motion.li>
                        ))}
                    </ul>

                    <motion.button 
                        className="pricing-btn"
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Get Started
                    </motion.button>
                </motion.div>

                {/* PREMIUM */}
                <motion.div 
                    className="pricing-card"
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    whileHover="hover"
                >
                    <h3>Premium</h3>
                    <div className="price">
                        <span className="amount">
                            <FiDollarSign />200
                        </span>
                        <span className="duration">/month</span>
                    </div>

                    <div className="features-heading">Features</div>
                    <ul>
                        {["Everything in Standard Package", "Dedicated account manager", "24/7 priority support", "Custom integrations", "Advanced analytics & reporting"].map((feature, index) => (
                            <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                whileHover={{ x: 5 }}
                            >
                                <motion.span
                                    variants={checkIconVariants}
                                    whileHover="hover"
                                >
                                    <FiCheck />
                                </motion.span>
                                {feature}
                            </motion.li>
                        ))}
                    </ul>

                    <motion.button 
                        className="pricing-btn"
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Get Started
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.section>
    );
};

export default Pricing;