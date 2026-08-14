import React, { useState } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import "./CTA.scss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CTA = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9+\-\s()]*$/, "Phone number is not valid"),
    message: Yup.string()
      .max(500, "Message must be 500 characters or less")
  });

  const API_URL = import.meta.env.VITE_API_URL || 'https://hksinvenstmentbackend.onrender.com/api';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
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

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await fetch(`${API_URL}/contact/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.warning(data.message || 'Please wait 48 hours between messages');
          return;
        }
        throw new Error(data.message || 'Failed to submit form');
      }

      if (data.success) {
        toast.success('Thank you for your message! We will contact you soon.');
        resetForm();
        setIsModalOpen(false);
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle button click - redirect to contact page with appointment section
  const handleButtonClick = () => {
    navigate('/contact', {
      state: { scrollTo: 'appointment-section' }
    });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <motion.section
        className="cta-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div
          className="cta-container"
          variants={containerVariants}
        >
          {/* TWO HEADINGS: desktop (unchanged) + mobile (three lines) */}
          <div className="cta-headings">
            <motion.h2
              className="desktop-heading"
              variants={textVariants}
            >
              Get Free Consultation With Trusted & <br />
              Professional{" "}
              <motion.span
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Licensed
              </motion.span>{" "}
              Financial Advisor.
            </motion.h2>

            <motion.h2
              className="mobile-heading"
              variants={textVariants}
            >
              Get Free Consultation With<br />
              Trusted & Professional<br />
              <motion.span
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Licensed
              </motion.span>{" "}
              Financial Advisor.
            </motion.h2>
          </div>

          <motion.button
            className="cta-btn"
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={handleButtonClick}
          >
            <span className="cta-btn-fill"></span>
            <span className="cta-btn-text">Book a Free Consultation</span>
            <span className="cta-btn-arrow">
              <FiArrowRight />
            </span>
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Modal is still here but not used by default - can be used in future */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="cta-modal-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              className="cta-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                className="cta-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <FiX />
              </button>

              <h3 className="cta-modal-title">Contact Our Advisors</h3>
              <p className="cta-modal-subtitle">Fill out the form below and our team will get back to you within 24 hours.</p>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  phone: '',
                  message: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="cta-form">
                    <div className="cta-form-row-2col">
                      <div className="cta-form-group">
                        <label htmlFor="name">
                          Full Name <span className="required">*</span>
                        </label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          className={`cta-form-input ${touched.name && errors.name ? 'error' : ''}`}
                          placeholder="Enter your full name"
                          disabled={isSubmitting}
                        />
                        <ErrorMessage name="name" component="div" className="error-message" />
                      </div>

                      <div className="cta-form-group">
                        <label htmlFor="email">
                          Email Address <span className="required">*</span>
                        </label>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          className={`cta-form-input ${touched.email && errors.email ? 'error' : ''}`}
                          placeholder="your@email.com"
                          disabled={isSubmitting}
                        />
                        <ErrorMessage name="email" component="div" className="error-message" />
                      </div>
                    </div>

                    <div className="cta-form-row-full">
                      <div className="cta-form-group">
                        <label htmlFor="phone">
                          Phone Number <span className="required">*</span>
                        </label>
                        <Field
                          type="tel"
                          id="phone"
                          name="phone"
                          className={`cta-form-input ${touched.phone && errors.phone ? 'error' : ''}`}
                          placeholder="+1 (123) 456-7890"
                          disabled={isSubmitting}
                        />
                        <ErrorMessage name="phone" component="div" className="error-message" />
                      </div>
                    </div>

                    <div className="cta-form-row-full">
                      <div className="cta-form-group">
                        <label htmlFor="message">Message (Optional)</label>
                        <Field
                          as="textarea"
                          id="message"
                          name="message"
                          className={`cta-form-textarea ${touched.message && errors.message ? 'error' : ''}`}
                          placeholder="Tell us about your investment needs..."
                          rows="4"
                          disabled={isSubmitting}
                        />
                        <ErrorMessage name="message" component="div" className="error-message" />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      className={`cta-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <span>Sending...</span>
                          <div className="spinner"></div>
                        </>
                      ) : (
                        <>
                          Submit Message
                          <FiArrowRight className="cta-submit-arrow" />
                        </>
                      )}
                    </motion.button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CTA;