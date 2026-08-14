import { useState } from "react";
import { motion } from "framer-motion";
import "./PricingSection.scss";

const PricingSection = () => {
    const [active, setActive] = useState("weekly");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
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

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                delay: i * 0.2 + 0.3,
                ease: "backOut"
            }
        })
    };

    // ✅ Handle button clicks - opens in new tab
    const handleSwingClick = () => {
        window.open("https://whop.com/hk-s-investment/swing-option-trading-65/", "_blank");
    };

    const handleLongTermClick = () => {
        window.open("https://whop.com/hk-s-investment/long-term-investment-b8/", "_blank");
    };

    return (
        <motion.section
            className="pricing-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="pricing-grid">

                <motion.div
                    className="pricing-text"
                    variants={itemVariants}
                >
                    <div className="pricing-text-inner">
                        <motion.span
                            className="pricing-pill"
                            variants={itemVariants}
                        >
                            Pricing
                        </motion.span>
                        <motion.h2
                            variants={itemVariants}
                        >
                            Choose the perfect plan<br /> for your needs.
                        </motion.h2>
                        <motion.p
                            variants={itemVariants}
                        >
                            Simple, transparent pricing with no hidden fees.
                            <span className="tablet-br"> </span>
                            Pick the plan that fits your trading style.
                        </motion.p>
                    </div>
                </motion.div>

                <motion.div
                    className={`pricing-card ${active === "weekly" ? "active" : ""}`}
                    onClick={() => setActive("weekly")}
                    variants={cardVariants}
                    custom={0}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="card-inner">
                        <div className="card-header-box">
                            <h3>Swing & Option trading</h3>
                            <p className="sub-line1">• Complete investing & options program</p>
                            <p className="sub-line2">• Step-by-step training with live signals</p>
                        </div>
                        <div className="card-body-box">
                            <div className="price">
                                <span className="amount">39.99USD</span>
                                {/* <span className="duration">/bi-weekly</span> */}
                                <span className="duration">/month</span>
                            </div>
                            <ul>
                                <li className="yes">Portfolio management</li>
                                <li className="yes">Personal assistance</li>
                                <li className="yes">Daily analysis</li>
                                <li className="yes">Swing trades</li>
                                <li className="yes">Entries + exits</li>
                                <li className="yes">Covered calls / cash secured</li>
                                <li className="yes">AI signals, charts, analysis</li>
                                <li className="yes">Crypto investment & trades</li>
                                <li className="yes">Cancel at anytime</li>
                                <li className="yes">Option trade signals</li>
                                <li className="yes">Trial period (3 days)</li>
                                <li className="no">Refund</li>
                            </ul>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSwingClick}  // ✅ Added onClick
                            >
                                Get Started
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={`pricing-card ${active === "monthly" ? "active" : ""}`}
                    onClick={() => setActive("monthly")}
                    variants={cardVariants}
                    custom={1}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="card-inner">
                        <div className="card-header-box">
                            <h3>Long term investment</h3>
                            <p className="sub-line1">• High-growth picks (10x–100x potential)</p>
                            <p className="sub-line2">• Receive real-time buy & sell alerts</p>
                            <p className="note">Note: For Long-term investing only</p>
                        </div>
                        <div className="card-body-box">
                            <div className="price">
                                <span className="amount">19.99USD</span>
                                {/* <span className="duration">/bi-weekly</span> */}
                                <span className="duration">/month</span>
                            </div>
                            <ul>
                                <li className="yes">Portfolio management</li>
                                <li className="yes">Personal assistance</li>
                                <li className="yes">Daily analysis</li>
                                <li className="yes">High-potential long-term stocks</li>
                                <li className="yes">Charts & deep dives</li>
                                <li className="yes">24/7 news updates</li>
                                <li className="yes">Dividend stocks</li>
                                <li className="yes">Understand market psychology</li>
                                <li className="yes">Cancel at any time</li>
                                <li className="no">Option & swing trading</li>
                                <li className="no">Trial period (3 days)</li>
                                <li className="no">Refund</li>
                            </ul>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLongTermClick}  // ✅ Added onClick
                            >
                                Get Started
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </motion.section>
    );
};

export default PricingSection;