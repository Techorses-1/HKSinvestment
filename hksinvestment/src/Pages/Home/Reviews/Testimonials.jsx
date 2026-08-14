import React, { useRef, useState } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import { FaArrowLeft, FaArrowRight as FaArrowRightIcon } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "./Testimonials.scss";

const reviews = [
    {
        name: "Rajesh M.",
        text: "Been with them for 10 months now. Portfolio growing steady at 12-14% returns. Their SIP recommendations actually work better than my previous advisor. The market research team really understands US markets."
    },
    {
        name: "Priya K.",
        text: "Was skeptical at first but friend recommended. Saved almost $2,000 in taxes through their planning. They explain everything in simple terms - no confusing jargon. Worth every penny."
    },
    {
        name: "Vikram S.",
        text: "Finally found a balanced financial advisor. Not too conservative or aggressive. At 48, I finally have clear retirement strategy. Tax optimization advice alone covered our annual vacation expenses."
    },
    {
        name: "Ananya R.",
        text: "Knew nothing about investing. Started with basic SIP and grew from $50K to $76K in 18 months. Advisor calls monthly to check progress. Really feels like they care about your long-term goals."
    },
    {
        name: "Suresh P.",
        text: "Managing own investments for years but switched after cousin recommended. Their market research gives real edge over retail investors. Helped stay disciplined during 2024 market drops - paid off massively."
    },
    {
        name: "Michael C.",
        text: "Bank wealth management fees were killing returns. Switched 8 months ago and difference is huge. 401(k) rollover setup way more tax-efficient. Support responds within hours whenever I have questions."
    },
    {
        name: "Sarah M.",
        text: "I'm pretty hands-off with investing. Their wealth management handles everything - rebalancing, tax, monitoring. Consistent 11-13% returns. Way better than my old roboadvisor."
    },
    {
        name: "James P.",
        text: "Self-employed retirement planning is tough. They helped structure 401(k) strategy and even found corporate investment options I never knew existed. Portfolio grown 15% in a year. Transparent fees too."
    }
];

// Modal Component - UPDATED with API integration
const ReviewModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="testimonial-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="testimonial-modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="testimonial-close-modal"
                    onClick={onClose}
                    type="button"
                >
                    <FiX />
                </button>

                <h3>Leave a Review</h3>
                <p className="testimonial-modal-subtitle">Share your experience with us. We value your feedback!</p>

                <Formik
                    initialValues={{ name: "", number: "", review: "" }}
                    validate={values => {
                        const errors = {};
                        if (!values.name) errors.name = "Name is required";
                        if (!values.number) errors.number = "Phone number is required";
                        if (!values.review) errors.review = "Review is required";
                        return errors;
                    }}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            // Make API call to backend
                            const response = await fetch(`${import.meta.env.VITE_API_URL}/review`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    name: values.name.trim(),
                                    number: values.number.trim(),
                                    review: values.review.trim()
                                })
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data.message || 'Failed to submit review');
                            }

                            if (data.success) {
                                toast.success(data.message || "Thank you for your review! 🙏", {
                                    position: "top-right",
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true
                                });
                                resetForm();
                                onClose();
                            } else {
                                throw new Error(data.message || 'Failed to submit review');
                            }

                        } catch (error) {
                            console.error('Error submitting review:', error);
                            toast.error(error.message || "Failed to submit review. Please try again.", {
                                position: "top-right",
                                autoClose: 4000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true
                            });
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form>
                            <div className="testimonial-form-group">
                                <label htmlFor="name">
                                    Full Name <span className="required">*</span>
                                </label>
                                <Field
                                    type="text"
                                    name="name"
                                    id="name"
                                    className={`testimonial-form-input ${touched.name && errors.name ? 'error' : ''}`}
                                    placeholder="Enter your full name"
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage name="name" component="div" className="testimonial-error" />
                            </div>

                            <div className="testimonial-form-group">
                                <label htmlFor="number">
                                    Phone Number <span className="required">*</span>
                                </label>
                                <Field
                                    type="tel"
                                    name="number"
                                    id="number"
                                    className={`testimonial-form-input ${touched.number && errors.number ? 'error' : ''}`}
                                    placeholder="+1 (123) 456-7890"
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage name="number" component="div" className="testimonial-error" />
                            </div>

                            <div className="testimonial-form-group">
                                <label htmlFor="review">
                                    Your Review <span className="required">*</span>
                                </label>
                                <Field
                                    as="textarea"
                                    name="review"
                                    id="review"
                                    rows="4"
                                    className={`testimonial-form-textarea ${touched.review && errors.review ? 'error' : ''}`}
                                    placeholder="Tell us about your experience..."
                                    disabled={isSubmitting}
                                />
                                <ErrorMessage name="review" component="div" className="testimonial-error" />
                            </div>

                            <div className="testimonial-modal-actions">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="testimonial-cancel-btn"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="testimonial-submit-btn"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </motion.div>
        </motion.div>
    );
};

const Testimonials = () => {
    const swiperRef = useRef(null);
    const desktopSwiperRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const pillVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: "backOut" }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        },
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.02 },
        tap: { scale: 0.98 }
    };

    const sliderArrowVariants = {
        initial: {
            background: "#5e2690",
            scale: 1,
            rotate: 0
        },
        hover: {
            background: "#7a3db8",
            scale: 1.1,
            rotate: 360,
            transition: { duration: 0.4, ease: "easeInOut" }
        },
        tap: { scale: 0.9 }
    };

    const getDesktopSlides = () => {
        const slides = [];
        const total = reviews.length;

        if (total <= 3) {
            slides.push({
                reviews: reviews.slice(0, total),
                startIndex: 0
            });
            return slides;
        }

        // First slide: reviews 0,1,2
        slides.push({
            reviews: reviews.slice(0, 3),
            startIndex: 0
        });

        // Calculate remaining reviews after first slide
        const remaining = total - 3;

        if (remaining <= 3) {
            // For 4-6 reviews: add one more slide with last 3 reviews
            slides.push({
                reviews: reviews.slice(total - 3, total),
                startIndex: total - 3
            });
        } else {
            // For 7+ reviews: add middle slide + last slide
            // Add second slide with next 3 reviews (positions 3,4,5)
            slides.push({
                reviews: reviews.slice(3, 6),
                startIndex: 3
            });

            // Add third slide with last 3 reviews
            slides.push({
                reviews: reviews.slice(total - 3, total),
                startIndex: total - 3
            });
        }

        return slides;
    };

    const desktopSlides = getDesktopSlides();

    return (
        <>
            <motion.section
                className="testimonial-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                {/* HEADER */}
                <motion.div
                    className="testimonial-header"
                    variants={headerVariants}
                >
                    <div>
                        <motion.span
                            className="testimonial-pill"
                            variants={pillVariants}
                        >
                            Testimonial
                        </motion.span>
                        <motion.h2 variants={headerVariants}>
                            Reviews that <br />
                            <motion.span
                                initial={{ opacity: 0.8 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            >
                                make us blush
                            </motion.span>
                        </motion.h2>
                    </div>

                    <motion.button
                        className="testimonial-review-btn desktop-only"
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span className="testimonial-review-btn-fill"></span>
                        <span className="testimonial-review-btn-text">Leave a review</span>
                        <span className="testimonial-review-btn-arrow">
                            <FiArrowRight />
                        </span>
                    </motion.button>
                </motion.div>

                {/* DESKTOP CAROUSEL – ALWAYS 3 REVIEWS PER SLIDE */}
                <div className="testimonial-desktop-carousel desktop-only">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        onSwiper={(swiper) => (desktopSwiperRef.current = swiper)}
                        slidesPerView={1}
                        spaceBetween={0}
                        loop={false}
                        autoplay={false}
                        navigation={{
                            prevEl: '.testimonial-desktop-swiper-prev',
                            nextEl: '.testimonial-desktop-swiper-next',
                        }}
                        className="testimonial-desktop-swiper"
                        watchOverflow={true}
                        allowTouchMove={false}
                    >
                        {desktopSlides.map((slide, slideIndex) => (
                            <SwiperSlide key={slideIndex}>
                                <div className="testimonial-grid-three">
                                    {slide.reviews.map((review, idx) => {
                                        return (
                                            <motion.div
                                                key={`desktop-${slideIndex}-${idx}`}
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true, margin: "-50px" }}
                                                variants={cardVariants}
                                                transition={{ delay: idx * 0.1 }}
                                                className="testimonial-grid-item"
                                            >
                                                <ReviewCard
                                                    {...review}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Desktop Navigation Arrows */}
                    {desktopSlides.length > 1 && (
                        <div className="testimonial-desktop-slider-arrows">
                            <motion.button
                                className="testimonial-desktop-swiper-prev"
                                variants={sliderArrowVariants}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                                disabled={desktopSwiperRef.current?.isBeginning}
                            >
                                <FaArrowLeft />
                            </motion.button>
                            <motion.button
                                className="testimonial-desktop-swiper-next"
                                variants={sliderArrowVariants}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                                disabled={desktopSwiperRef.current?.isEnd}
                            >
                                <FaArrowRightIcon />
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* MOBILE SLIDER – WITH ICONS */}
                <div className="testimonial-mobile">
                    <Swiper
                        modules={[Autoplay]}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        slidesPerView={1}
                        spaceBetween={20}
                        loop
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                    >
                        {reviews.map((item, i) => (
                            <SwiperSlide key={i}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <ReviewCard
                                        {...item}
                                        mobile
                                    />
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="testimonial-slider-arrows">
                        <motion.button
                            onClick={() => swiperRef.current?.slidePrev()}
                            variants={sliderArrowVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <FaArrowLeft />
                        </motion.button>
                        <motion.button
                            onClick={() => swiperRef.current?.slideNext()}
                            variants={sliderArrowVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <FaArrowRightIcon />
                        </motion.button>
                    </div>

                    <motion.button
                        className="testimonial-review-btn mobile-only"
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span className="testimonial-review-btn-fill"></span>
                        <span className="testimonial-review-btn-text">Leave a review</span>
                        <span className="testimonial-review-btn-arrow">
                            <FiArrowRight />
                        </span>
                    </motion.button>
                </div>
            </motion.section>

            <AnimatePresence>
                {isModalOpen && <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>

            {/* UPDATED: ToastContainer with closeOnClick and proper settings */}
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </>
    );
};

// ReviewCard component - uses icons for ALL views
const ReviewCard = ({ name, text, mobile }) => {
    const avatarVariants = {
        hover: {
            scale: 1.1,
            borderColor: "#7a3db8",
            transition: { duration: 0.3, ease: "easeInOut" }
        }
    };

    return (
        <div className={`testimonial-card ${mobile ? "testimonial-mobile-card" : ""}`}>
            <div className="testimonial-user">
                <motion.div
                    className="testimonial-avatar"
                    whileHover="hover"
                    variants={avatarVariants}
                >
                    <FaUserCircle className="testimonial-avatar-icon" />
                </motion.div>
                <motion.strong
                    initial={{ opacity: 0.8 }}
                    whileHover={{
                        opacity: 1,
                        color: "#7a3db8",
                        transition: { duration: 0.2 }
                    }}
                >
                    {name}
                </motion.strong>
            </div>
            <motion.p
                initial={{ opacity: 0.9 }}
                whileHover={{
                    opacity: 1,
                    color: "#f0f0f0",
                    transition: { duration: 0.2 }
                }}
            >
                {text}
            </motion.p>
        </div>
    );
};

export default Testimonials;