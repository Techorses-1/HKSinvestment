import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./FAQ.scss";

const faqData = [
  {
    question: "How long does it take to get access after subscribing?",
    answer:
      "Access will be provided within 24–48 hours after successful payment."
  },
  {
    question: "Do I need prior knowledge to use the platform?",
    answer:
      "Yes, you should have basic knowledge of buying and selling stocks and options to use the platform effectively."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time."
  },
  {
    question: "Can I get a refund for this subscription?",
    answer:
      "Currently, we do not offer refunds for subscriptions but you can cancel your subscription at any time. "
  },
  {
    question: "Do you offer a trial period?",
    answer:
      "Yes, we offer a 3-day trial period for new users."
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, your data is fully secure, and all payments are safely handled by our trusted third-party payment provider, Square."
  }
];

const FAQ = ({ bgColor = "default" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  // FIXED: More reliable scroll to appointment section
  const handleScheduleClick = () => {
    // Navigate to contact page with state
    navigate('/contact', { 
      state: { scrollTo: 'appointment-section' } 
    });
  };

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

  const headerVariants = {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      backgroundColor: "#e6daf8",
      boxShadow: "0 8px 25px rgba(122, 61, 184, 0.12)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const answerVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginTop: 0
    },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: 14,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.section
      className={`faq-section ${bgColor === "white" ? "faq-section-white" : ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* HEADER */}
      <motion.div
        className="faq-header"
        variants={headerVariants}
      >
        <motion.span
          className="faq-pill"
          variants={pillVariants}
        >
          FAQ
        </motion.span>
        <motion.h2
          variants={headerVariants}
        >
          Any questions?
        </motion.h2>
        <motion.p
          variants={headerVariants}
        >
          Let us walk you through it. <motion.span
            className="schedule-link"
            onClick={handleScheduleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              color: '#5e2690',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-block',
              borderBottom: '2px solid transparent',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottomColor = '#5e2690';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            Schedule
          </motion.span> your meeting now.
        </motion.p>
      </motion.div>

      {/* FAQ LIST */}
      <motion.div
        className="faq-list"
        variants={containerVariants}
      >
        <AnimatePresence>
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              className={`faq-item ${activeIndex === index ? "active" : ""}`}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              whileHover="hover"
              layout
            >
              <motion.div
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                whileTap={{ scale: 0.98 }}
              >
                <span className="faq-text">
                  <span className="faq-number">
                    ({String(index + 1).padStart(2, "0")})
                  </span>
                  {item.question}
                </span>

                {/* === PREMIUM SPIN: Circle NO animation, Only PLUS spins === */}
                <span className="faq-icon">
                  <motion.div
                    key={activeIndex === index ? "active" : "inactive"}
                    initial={{ rotate: 0 }}
                    animate={{
                      rotate: activeIndex === index ? [0, 360, 405, 405] : [405, 360, 0, 0]
                    }}
                    transition={{
                      duration: 0.8,
                      times: [0, 0.6, 0.8, 1],
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%"
                    }}
                  >
                    <FiPlus
                      style={{
                        display: "block",
                        width: "1em",
                        height: "1em"
                      }}
                    />
                  </motion.div>
                </span>
              </motion.div>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    className="faq-answer-wrapper"
                    variants={answerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <div className="faq-answer">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
};

export default FAQ;