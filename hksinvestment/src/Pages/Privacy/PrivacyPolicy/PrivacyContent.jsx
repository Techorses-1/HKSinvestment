import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiUser,
    FiDollarSign,
    FiTrendingUp,
    FiShield,
    FiClock,
    FiCheckCircle
} from "react-icons/fi";
import { BsShieldFillCheck, BsBank2 } from "react-icons/bs";
import { MdOutlineSell } from "react-icons/md";
import GeneralInquiryModal from "../../Contact/GenralInquiry/GeneralInquiryModal"; // Import the modal
import "./PrivacyContent.scss";

const PrivacyContent = () => {
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Animation variants (matching your About/CareerForm theme)
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

    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1 + 0.3,
                duration: 0.6,
                ease: "easeOut"
            }
        })
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.05 + 0.5,
                duration: 0.4,
                ease: "easeOut"
            }
        }),
        hover: {
            x: 10,
            color: "#5e2690",
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const contactItemVariants = {
        initial: { opacity: 0.8, x: 0 },
        hover: {
            opacity: 1,
            x: 10,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    // Removed iconVariants as it's no longer needed for contact sections

    const decorVariants = {
        animate: {
            scale: [1, 1.02, 1],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Data collection categories (from previous content)
    const dataCollected = [
        {
            title: "Personal Identification Information",
            icon: <FiUser />,
            items: [
                "Full name",
                "Email address",
                "Phone number",
                "Home address",
                "Date of birth",
                "Social Insurance Number (SIN)"
            ]
        },
        {
            title: "Financial Information",
            icon: <FiDollarSign />,
            items: [
                "Income details",
                "Bank account information",
                "Investment portfolio data",
                "Retirement savings information",
                "Tax returns and documents",
                "Risk tolerance assessment"
            ]
        },
        {
            title: "Investment Profile",
            icon: <FiTrendingUp />,
            items: [
                "Investment goals and objectives",
                "Risk profile assessment",
                "SIP contribution history",
                "RRSP contribution limits",
                "Wealth account balances",
                "Transaction history"
            ]
        },
        {
            title: "Technical Data",
            icon: <FiShield />,
            items: [
                "IP address",
                "Browser type and version",
                "Device information",
                "Pages visited on our site",
                "Time spent on pages",
                "Appointment booking history"
            ]
        }
    ];

    // Services offered
    const services = [
        { name: "Financial Advising", icon: <BsShieldFillCheck /> },
        { name: "Systematic Investment Plan", icon: <FiTrendingUp /> },
        { name: "Market-Based Research", icon: <BsBank2 /> },
        { name: "RRSP Management", icon: <FiClock /> },
        { name: "Wealth Account Management", icon: <FiDollarSign /> },
        { name: "Tax Optimization", icon: <FiCheckCircle /> }
    ];

    // How we use data
    const dataUsage = [
        "To provide personalized financial advising and investment guidance",
        "To manage Systematic Investment Plans (SIP) and track contributions",
        "To conduct market research and provide investment recommendations",
        "To administer Registered Retirement Savings Plans (RRSP)",
        "To manage wealth accounts and optimize portfolio performance",
        "To provide tax optimization strategies and minimize liabilities",
        "To process bi-weekly payment plans and investment contributions",
        "To schedule and manage client appointments"
    ];

    // Legal basis for processing
    const legalBasis = [
        {
            title: "Consent",
            description: "We obtain your explicit consent before collecting or using your personal information"
        },
        {
            title: "Contract Performance",
            description: "Processing necessary to provide investment management and financial advisory services"
        },
        {
            title: "Legal Obligation",
            description: "Compliance with Canadian securities laws, tax regulations, and anti-money laundering requirements"
        },
        {
            title: "Legitimate Interests",
            description: "Improving our investment strategies, preventing fraud, and enhancing client experience"
        }
    ];

    // Data retention periods
    const retentionPeriods = [
        {
            period: "Investment Account Records",
            duration: "7 years (as required by Canadian securities regulators)"
        },
        {
            period: "Tax Documents (RRSP, T-slips)",
            duration: "7 years (Canada Revenue Agency requirement)"
        },
        {
            period: "Client Identification Records",
            duration: "7 years after account closure (FINTRAC requirements)"
        },
        {
            period: "Transaction History",
            duration: "7 years for audit and compliance purposes"
        },
        {
            period: "SIP Contribution Records",
            duration: "7 years for investment tracking and tax reporting"
        },
        {
            period: "Appointment History",
            duration: "2 years for service improvement"
        }
    ];

    // Client rights
    const clientRights = [
        "Right to access your personal information",
        "Right to challenge accuracy and request corrections",
        "Right to withdraw consent at any time",
        "Right to know how your information is used and disclosed",
        "Right to file a complaint with the Privacy Commissioner of Canada",
        "Right to request deletion of non-required information"
    ];

    // Contact info (matching CareerForm style)
    const contactInfo = [
        {
            icon: <FiPhone />,
            text: "+1 782-882-8102",
            link: "tel:+17828828102"
        },
        {
            icon: <FiMail />,
            text: "inquiry@hksinvestment.com",
            link: "mailto:inquiry@hksinvestment.com"
        },
        {
            icon: <FiMapPin />,
            text: "Halifax, NS, Canada",
            link: "https://maps.google.com/?q=Halifax,NS,Canada"
        }
    ];
    const newcontactInfo = [
        // {
        //     icon: <FiPhone />,
        //     text: "+1 782-882-8102",
        //     link: "tel:+17828828102"
        // },
        {
            icon: <FiMail />,
            text: "inquiry@hksinvestment.com",
            link: "mailto:inquiry@hksinvestment.com"
        },
        {
            icon: <FiMapPin />,
            text: "Halifax, NS, Canada",
            link: "https://maps.google.com/?q=Halifax,NS,Canada"
        }
    ];


   

    return (
        <>
            <div className="main-privacy" id="privacy-content">
                <motion.div
                    className="privacy-content-wrapper"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    {/* HEADER SECTION - Like About/CareerForm */}
                    <motion.div className="privacy-header" variants={headerVariants}>
                        <motion.span className="privacy-pill" variants={pillVariants}>
                            Privacy Policy
                        </motion.span>
                        <motion.h2 variants={headerVariants}>
                            Your <span>Privacy</span> Matters to Us
                        </motion.h2>
                        <motion.p variants={headerVariants}>
                            How we collect, use, and protect your personal information at HKS Investment
                        </motion.p>
                        <motion.div className="privacy-underline" variants={headerVariants}></motion.div>
                        <motion.p className="privacy-last-updated" variants={headerVariants}>
                            Last Updated: February 2026
                        </motion.p>
                    </motion.div>

                    {/* INTRODUCTION CARD - Like career-info card */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={1}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={1.1}>
                                <BsShieldFillCheck className="card-icon" /> Our Commitment
                            </motion.h3>
                            <motion.p variants={sectionVariants} custom={1.2}>
                                At HKS Investment, we are committed to protecting your personal information and respecting your privacy.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                                financial advisory and investment management services in Canada. We comply with the Personal Information
                                Protection and Electronic Documents Act (PIPEDA) and all applicable Canadian privacy laws.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* WHO WE ARE CARD - Updated: Removed icon hover animation */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={2}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={2.1}>
                                <BsBank2 className="card-icon" /> Who We Are
                            </motion.h3>
                            <motion.p variants={sectionVariants} custom={2.2}>
                                <strong>Company:</strong> HKS Investment<br />
                            </motion.p>

                            {/* Contact items - Removed icon hover animation, only line hover effect remains */}
                            <div className="privacy-contact-items">
                                {contactInfo.map((item, index) => (
                                    <motion.a
                                        key={index}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="privacy-contact-link"
                                        variants={contactItemVariants}
                                        initial="initial"
                                        whileHover="hover"
                                    >
                                        <div className="privacy-contact-item">
                                            <div className="privacy-contact-icon">
                                                {item.icon}
                                            </div>
                                            <div className="privacy-contact-text">
                                                {item.text}
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>

                            <motion.p variants={sectionVariants} custom={2.3}>
                                We are the data controller responsible for your personal information. Our Privacy Officer ensures
                                compliance with Canadian privacy laws.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* OUR SERVICES CARD */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={3}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={3.1}>
                                <FiTrendingUp className="card-icon" /> Our Services
                            </motion.h3>
                            <motion.p variants={sectionVariants} custom={3.2}>
                                We offer the following financial services, which require collection of your personal information:
                            </motion.p>

                            <div className="privacy-services-grid">
                                {services.map((service, index) => (
                                    <motion.div
                                        key={index}
                                        className="privacy-service-tag"
                                        variants={listItemVariants}
                                        custom={index}
                                        whileHover={{ scale: 1.05, backgroundColor: "#e6dcf7", borderColor: "#5e2690" }}
                                    >
                                        <span className="service-icon">{service.icon}</span>
                                        <span>{service.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* DATA WE COLLECT - Multiple subsections like in About tags */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={4}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={4.1}>
                                <FiUser className="card-icon" /> What Information We Collect
                            </motion.h3>

                            {dataCollected.map((category, catIndex) => (
                                <motion.div
                                    key={catIndex}
                                    className="privacy-subsection"
                                    variants={sectionVariants}
                                    custom={4.2 + catIndex}
                                >
                                    <motion.h4 variants={sectionVariants} custom={4.3 + catIndex}>
                                        <span className="subsection-icon">{category.icon}</span>
                                        {category.title}
                                    </motion.h4>

                                    <ul className="privacy-list">
                                        {category.items.map((item, itemIndex) => (
                                            <motion.li
                                                key={itemIndex}
                                                variants={listItemVariants}
                                                custom={itemIndex + (catIndex * 10)}
                                                whileHover="hover"
                                            >
                                                <span className="bullet-point">•</span> {item}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* HOW WE USE YOUR DATA */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={5}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={5.1}>
                                <FiTrendingUp className="card-icon" /> How We Use Your Information
                            </motion.h3>

                            <ul className="privacy-list">
                                {dataUsage.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        variants={listItemVariants}
                                        custom={index + 50}
                                        whileHover="hover"
                                    >
                                        <span className="bullet-point">•</span> {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* APPOINTMENT & CONTACT FORMS - UPDATED */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={6}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={6.1}>
                                <FiClock className="card-icon" /> Appointment & Contact Forms
                            </motion.h3>

                            <motion.p variants={sectionVariants} custom={6.2}>
                                When you book an appointment or contact us through our forms, we collect:
                            </motion.p>

                            <ul className="privacy-list privacy-appointment-list">
                                <motion.li variants={listItemVariants} custom={70} whileHover="hover">
                                    <span className="bullet-point">•</span>
                                    <span className="list-item-content">
                                        <strong>Name:</strong>
                                        <span className="list-item-description"> To personalize our service</span>
                                    </span>
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={71} whileHover="hover">
                                    <span className="bullet-point">•</span>
                                    <span className="list-item-content">
                                        <strong>Email Address:</strong>
                                        <span className="list-item-description"> For confirmations and updates</span>
                                    </span>
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={72} whileHover="hover">
                                    <span className="bullet-point">•</span>
                                    <span className="list-item-content">
                                        <strong>Phone Number:</strong>
                                        <span className="list-item-description"> For appointment reminders</span>
                                    </span>
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={73} whileHover="hover">
                                    <span className="bullet-point">•</span>
                                    <span className="list-item-content">
                                        <strong>Investment Preferences:</strong>
                                        <span className="list-item-description"> To prepare for consultation</span>
                                    </span>
                                </motion.li>
                            </ul>

                            <motion.div className="privacy-note" variants={sectionVariants} custom={6.3}>
                                <strong>Note:</strong> Appointment details are stored securely for 2 years to improve our service quality.
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* BI-WEEKLY PAYMENT PLANS - Updated with Stripe information */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={7}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={7.1}>
                                <FiDollarSign className="card-icon" /> Bi-Weekly Payment Plans
                            </motion.h3>

                            <ul className="privacy-list">
                                <motion.li variants={listItemVariants} custom={80} whileHover="hover">
                                    <span className="bullet-point">•</span> Bank account details for automated contributions
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={81} whileHover="hover">
                                    <span className="bullet-point">•</span> Payment history and transaction records
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={82} whileHover="hover">
                                    <span className="bullet-point">•</span> Investment allocation preferences
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={83} whileHover="hover">
                                    <span className="bullet-point">•</span> All the data of credit card for recurring payment is handled by the 3rd party company which known as Stripe.
                                </motion.li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* LEGAL BASIS */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={8}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={8.1}>
                                <BsShieldFillCheck className="card-icon" /> Legal Basis for Processing
                            </motion.h3>

                            {legalBasis.map((basis, index) => (
                                <motion.div
                                    key={index}
                                    className="privacy-basis-item"
                                    variants={sectionVariants}
                                    custom={8.2 + index}
                                    whileHover={{
                                        backgroundColor: "#f9f6ff",
                                        borderLeftColor: "#5e2690",
                                        x: 5
                                    }}
                                >
                                    <strong>{basis.title}:</strong>
                                    <span>{basis.description}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* DATA RETENTION */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={9}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={9.1}>
                                <FiClock className="card-icon" /> How Long We Keep Your Information
                            </motion.h3>

                            <div className="privacy-table">
                                {retentionPeriods.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="privacy-table-row"
                                        variants={sectionVariants}
                                        custom={9.2 + index}
                                        whileHover={{ backgroundColor: "#f9f6ff" }}
                                    >
                                        <span className="table-period">{item.period}:</span>
                                        <span className="table-duration">{item.duration}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* YOUR RIGHTS */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={10}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={10.1}>
                                <FiCheckCircle className="card-icon" /> Your Rights Under Canadian Privacy Laws
                            </motion.h3>

                            <ul className="privacy-list rights-list">
                                {clientRights.map((right, index) => (
                                    <motion.li
                                        key={index}
                                        variants={listItemVariants}
                                        custom={index + 90}
                                        whileHover="hover"
                                    >
                                        <span className="check-icon">✓</span> {right}
                                    </motion.li>
                                ))}
                            </ul>

                            <motion.p variants={sectionVariants} custom={10.2}>
                                To exercise any of these rights, please contact our Privacy Officer at{' '}
                                <a href="mailto:inquiry@hksinvestment.com" className="privacy-link">inquiry@hksinvestment.com</a>.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* SECURITY MEASURES */}
                    <motion.div
                        className="privacy-card"
                        variants={sectionVariants}
                        custom={11}
                    >
                        <div className="privacy-card-content">
                            <motion.h3 variants={sectionVariants} custom={11.1}>
                                <FiShield className="card-icon" /> Data Security
                            </motion.h3>

                            <ul className="privacy-list">
                                <motion.li variants={listItemVariants} custom={100} whileHover="hover">
                                    <span className="bullet-point">•</span> 256-bit encryption for all financial data
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={101} whileHover="hover">
                                    <span className="bullet-point">•</span> Secure client portals for document sharing
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={102} whileHover="hover">
                                    <span className="bullet-point">•</span> Two-factor authentication for account access
                                </motion.li>
                                <motion.li variants={listItemVariants} custom={103} whileHover="hover">
                                    <span className="bullet-point">•</span> Regular security audits and penetration testing
                                </motion.li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* CONTACT SECTION - Updated: "Questions?" is now clickable and purple */}
                    <motion.div
                        className="privacy-card privacy-contact-card"
                        variants={sectionVariants}
                        custom={12}
                    >
                        <div className="privacy-card-content questions-section">
                            <motion.h3 variants={sectionVariants} custom={12.1}>
                                {/* Made "Questions?" clickable and purple */}
                                <span
                                    className="clickable-questions"
                                    onClick={() => setIsModalOpen(true)}
                                    style={{ cursor: 'pointer', color: '#7a3db8' }}
                                >
                                    Questions?</span>Contact Us
                            </motion.h3>

                            <motion.p variants={sectionVariants} custom={12.2}>
                                If you have questions about this Privacy Policy or wish to exercise your rights:
                            </motion.p>

                            <div className="privacy-contact-items">
                                {newcontactInfo.map((item, index) => (
                                    <motion.a
                                        key={index}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="privacy-contact-link"
                                        variants={contactItemVariants}
                                        initial="initial"
                                        whileHover="hover"
                                    >
                                        <div className="privacy-contact-item">
                                            <div className="privacy-contact-icon">
                                                {item.icon}
                                            </div>
                                            <div className="privacy-contact-text">
                                                {item.text}
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>

                            <motion.div className="privacy-supervisory" variants={sectionVariants} custom={12.3}>
                                You also have the right to contact the{' '}
                                <strong>Office of the Privacy Commissioner of Canada</strong>.
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* FOOTER NOTE */}
                    <motion.div className="privacy-footer" variants={sectionVariants} custom={13}>
                        <p>By using our services, you acknowledge that you have read and understood this Privacy Policy.</p>
                    </motion.div>
                </motion.div>
            </div>

            {/* GENERAL INQUIRY MODAL */}
            <GeneralInquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                source="privacy-questions"
            />
        </>
    );
};

export default PrivacyContent;