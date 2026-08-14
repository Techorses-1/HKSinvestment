import React from "react";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiInstagram, 
  FiArrowRight,
  FiUser,
  FiMessageSquare 
} from "react-icons/fi";
import { FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import "./ContactSection.scss";

const ContactSection = () => {
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

  const iconVariants = {
    initial: { scale: 1, color: "#7a3db8" },
    hover: {
      scale: 1.2,
      color: "#5e2690",
      rotate: 360,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
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

  const buttonVariants = {
    initial: {
      background: "#5e2690",
      color: "#fff"
    },
    hover: {
      background: "#fff",
      color: "#5e2690",
      border: "2px solid #5e2690",
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const arrowVariants = {
    hover: {
      rotate: 45,
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9\-\+ ]+$/, "Invalid phone number")
      .notRequired(),
    reason: Yup.string()
      .required("Please select a reason"),
    message: Yup.string()
      .max(500, "Message must be less than 500 characters")
      .notRequired()
  });

  // Initial form values
  const initialValues = {
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: ""
  };

  // Handle form submission
  const handleSubmit = (values, { resetForm, setSubmitting }) => {
    console.log("Form submitted:", values);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent successfully! We'll contact you soon.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      
      resetForm();
      setSubmitting(false);
    }, 1000);
  };

  const reasonOptions = [
    "Financial Advising",
    "Investment Planning", 
    "Retirement Planning",
    "Tax Optimization",
    "Portfolio Management",
    "General Inquiry"
  ];

  const socialIcons = [
    { Icon: FiInstagram, label: "Instagram" },
    { Icon: FaFacebookF, label: "Facebook" },
    { Icon: FaLinkedinIn, label: "LinkedIn" },
    { Icon: FaYoutube, label: "YouTube" }
  ];

  const contactInfo = [
    {
      icon: <FiPhone />,
      text: "+358 415737082",
      type: "phone"
    },
    {
      icon: <FiMail />,
      text: "hk.sangani80@gmail.com",
      type: "email"
    },
    {
      icon: <FiMapPin />,
      text: "Uomarinne 1 B 20 Vantaa 01600 Uusimaa Finland",
      type: "address"
    }
  ];

  return (
    <>
      <ToastContainer />
      <motion.section 
        className="contact-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="contact-section-header">
          <motion.span 
            className="contact-pill"
            variants={itemVariants}
          >
            Get in Touch
          </motion.span>
          <motion.h2
            variants={itemVariants}
          >
            Ready to start your <span>financial journey</span>?
          </motion.h2>
          <motion.p
            variants={itemVariants}
          >
            Fill out the form below and our financial experts will contact you within 24 hours.
          </motion.p>
        </div>

        <div className="contact-content">
          {/* LEFT SIDE - CONTACT INFO */}
          <motion.div 
            className="contact-info"
            variants={itemVariants}
          >
            <div className="contact-info-content">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Contact Information
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Connect with our financial advisors for personalized guidance and support.
              </motion.p>

              {/* CONTACT ITEMS */}
              <div className="contact-items">
                {contactInfo.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="contact-item"
                    variants={contactItemVariants}
                    initial="initial"
                    whileHover="hover"
                    custom={index}
                  >
                    <div className="contact-item-icon">
                      {item.icon}
                    </div>
                    <div className="contact-item-text">
                      {item.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* SOCIAL ICONS */}
              <motion.div 
                className="contact-socials"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h4>Follow Us</h4>
                <div className="social-icons">
                  {socialIcons.map((social, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      className="social-icon"
                      variants={iconVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      <social.Icon />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - FORM */}
          <motion.div 
            className="contact-form-wrapper"
            variants={itemVariants}
          >
            <div className="contact-form-container">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="contact-form">
                    {/* NAME FIELD */}
                    <div className="form-group">
                      <label htmlFor="name">
                        <FiUser /> Full Name *
                      </label>
                      <Field 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="Enter your full name"
                        className={`form-input ${errors.name && touched.name ? 'error' : ''}`}
                      />
                      <ErrorMessage name="name" component="div" className="error-message" />
                    </div>

                    {/* EMAIL FIELD */}
                    <div className="form-group">
                      <label htmlFor="email">
                        <FiMail /> Email Address *
                      </label>
                      <Field 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Enter your email"
                        className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                      />
                      <ErrorMessage name="email" component="div" className="error-message" />
                    </div>

                    {/* PHONE FIELD */}
                    <div className="form-group">
                      <label htmlFor="phone">
                        <FiPhone /> Phone Number
                      </label>
                      <Field 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        placeholder="Enter your phone number"
                        className="form-input"
                      />
                      <ErrorMessage name="phone" component="div" className="error-message" />
                    </div>

                    {/* REASON SELECT */}
                    <div className="form-group">
                      <label htmlFor="reason">
                        <FiMessageSquare /> Reason for Contact *
                      </label>
                      <Field 
                        as="select" 
                        id="reason" 
                        name="reason"
                        className={`form-select ${errors.reason && touched.reason ? 'error' : ''}`}
                      >
                        <option value="">Select a reason</option>
                        {reasonOptions.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="reason" component="div" className="error-message" />
                    </div>

                    {/* MESSAGE TEXTAREA */}
                    <div className="form-group">
                      <label htmlFor="message">
                        <FiMessageSquare /> Additional Message
                      </label>
                      <Field 
                        as="textarea" 
                        id="message" 
                        name="message" 
                        placeholder="Tell us more about your financial goals..."
                        rows="4"
                        className="form-textarea"
                      />
                      <ErrorMessage name="message" component="div" className="error-message" />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <motion.button 
                      type="submit" 
                      className="submit-btn"
                      variants={buttonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <motion.span
                        variants={arrowVariants}
                      >
                        <FiArrowRight />
                      </motion.span>
                    </motion.button>
                  </Form>
                )}
              </Formik>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
};

export default ContactSection;