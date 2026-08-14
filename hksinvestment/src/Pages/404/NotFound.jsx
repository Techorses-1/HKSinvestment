import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiTrendingDown } from "react-icons/fi";
import "./NotFound.scss";

const NotFound = () => {
    return (
        <div className="nf-wrapper">
            {/* Giant background number */}
            <motion.div
                className="nf-bg-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.08 }}
                transition={{ duration: 1 }}
            >
                404
            </motion.div>

            <div className="nf-container">
                {/* LEFT CONTENT */}
                <motion.div
                    className="nf-content"
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="nf-badge">
                        <FiTrendingDown /> Market Alert
                    </div>

                    <h1>This Investment Didn't Exist</h1>

                    <p>
                        The page you're trying to reach is no longer available or never
                        existed. Even smart portfolios face dead ends - what matters is the
                        recovery.
                    </p>

                    <a href="/" className="nf-btn">
                        Back to Safety <FiArrowRight />
                    </a>
                </motion.div>

                {/* RIGHT SIDE - PERFECT CIRCLE PROFIT VISUAL */}
                <motion.div
                    className="nf-visual"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="investment-404">
                        {/* Perfect Circle Pie Chart - All Green/Profitable */}
                        <svg className="perfect-pie" viewBox="0 0 300 300">
                            {/* Background glow - green tint */}
                            <circle cx="150" cy="150" r="120" fill="#e8f5e9" opacity="0.3" />

                            {/* Perfect circle segments - all green shades for profit */}
                            <motion.path
                                d="M150,150 L150,40 A110,110 0 0,1 235,95 Z"
                                fill="#2e7d32"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            <motion.path
                                d="M150,150 L235,95 A110,110 0 0,1 260,150 Z"
                                fill="#388e3c"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4.2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.3
                                }}
                            />

                            <motion.path
                                d="M150,150 L260,150 A110,110 0 0,1 222.5,227.5 Z"
                                fill="#43a047"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 3.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.6
                                }}
                            />

                            <motion.path
                                d="M150,150 L222.5,227.5 A110,110 0 0,1 150,260 Z"
                                fill="#4caf50"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4.4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.9
                                }}
                            />

                            <motion.path
                                d="M150,150 L150,260 A110,110 0 0,1 77.5,227.5 Z"
                                fill="#66bb6a"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4.1,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1.2
                                }}
                            />

                            <motion.path
                                d="M150,150 L77.5,227.5 A110,110 0 0,1 40,150 Z"
                                fill="#81c784"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 3.9,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1.5
                                }}
                            />

                            <motion.path
                                d="M150,150 L40,150 A110,110 0 0,1 77.5,72.5 Z"
                                fill="#a5d6a7"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4.3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1.8
                                }}
                            />

                            <motion.path
                                d="M150,150 L77.5,72.5 A110,110 0 0,1 150,40 Z"
                                fill="#c8e6c9"
                                initial={{ scale: 1 }}
                                animate={{
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 2.1
                                }}
                            />

                            {/* Center hole - perfect circle */}
                            <circle cx="150" cy="150" r="45" fill="white" />

                            {/* "404" text in center - now in green */}
                            <text
                                x="150"
                                y="165"
                                textAnchor="middle"
                                fill="#2e7d32"
                                fontSize="28"
                                fontWeight="bold"
                                fontFamily="Heading, serif"
                            >
                                404
                            </text>

                            {/* Floating particles - green for profit */}
                            <motion.circle
                                cx="210"
                                cy="70"
                                r="5"
                                fill="#2e7d32"
                                initial={{ opacity: 0.6 }}
                                animate={{
                                    y: [0, -20, 0],
                                    x: [0, 15, 0],
                                    opacity: [0.6, 1, 0.6]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />

                            <motion.circle
                                cx="240"
                                cy="190"
                                r="4"
                                fill="#388e3c"
                                initial={{ opacity: 0.4 }}
                                animate={{
                                    y: [0, 25, 0],
                                    x: [0, -20, 0],
                                    opacity: [0.4, 0.9, 0.4]
                                }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                            />

                            <motion.circle
                                cx="70"
                                cy="230"
                                r="5"
                                fill="#43a047"
                                initial={{ opacity: 0.5 }}
                                animate={{
                                    y: [0, -25, 0],
                                    x: [0, -15, 0],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
                            />

                            <motion.circle
                                cx="80"
                                cy="50"
                                r="4"
                                fill="#4caf50"
                                initial={{ opacity: 0.3 }}
                                animate={{
                                    y: [0, 20, 0],
                                    x: [0, 20, 0],
                                    opacity: [0.3, 0.8, 0.3]
                                }}
                                transition={{ duration: 4.2, repeat: Infinity, delay: 3 }}
                            />

                            {/* Success indicators - small plus signs */}
                            <motion.text
                                x="180"
                                y="110"
                                fill="#2e7d32"
                                fontSize="16"
                                fontWeight="bold"
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                +
                            </motion.text>

                            <motion.text
                                x="90"
                                cy="180"
                                y="190"
                                fill="#388e3c"
                                fontSize="14"
                                fontWeight="bold"
                                initial={{ opacity: 0.4 }}
                                animate={{ opacity: [0.4, 0.9, 0.4] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                            >
                                +
                            </motion.text>
                        </svg>

                        {/* Percentage labels floating - now all positive */}
                        <motion.div
                            className="floating-label profit"
                            style={{ top: '15%', left: '15%' }}
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            +12.5%
                        </motion.div>

                        <motion.div
                            className="floating-label profit"
                            style={{ top: '75%', right: '10%' }}
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                        >
                            +8.3%
                        </motion.div>

                        <motion.div
                            className="floating-label profit"
                            style={{ bottom: '15%', left: '20%' }}
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
                        >
                            +24.7%
                        </motion.div>

                        <motion.div
                            className="floating-label profit"
                            style={{ top: '40%', right: '20%' }}
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 3.2, repeat: Infinity, delay: 1.5 }}
                        >
                            ↑ 15.2%
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;