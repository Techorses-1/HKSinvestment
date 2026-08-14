import { motion } from "framer-motion";
import "./FinancialAnalysis.scss";
import { useNavigate } from "react-router-dom";


const FinancialAnalysis = () => { 


    const navigate = useNavigate();

    const handleScheduleClick = () => {
    // Navigate to contact page with state
    navigate('/contact', { 
      state: { scrollTo: 'appointment-section' } 
    });
  };
    return (
        <section className="financial-analysis-section"> {/* Changed from motion.section to section */}
            <div className="analysis-container">
                {/* Header */}
                <motion.div 
                    className="analysis-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <span className="analysis-pill">Financial Planning</span>
                    <h2>Need a complete financial roadmap?</h2>
                    <p>Get a personalized <span>1-on-1</span> financial <span className="mobile-br"><br /></span>analysis session</p>
                </motion.div>

                {/* Analysis Card */}
                <motion.div 
                    className="analysis-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ y: -8 }}
                >
                    <div className="analysis-card-inner">
                        {/* Header Box - Like pricing card header */}
                        <div className="analysis-header-box">
                            <h3>Financial Need Analysis</h3>
                            <p>Complete financial health check</p>
                        </div>

                        {/* Body Box - Like pricing card body */}
                        <div className="analysis-body-box">
                            <div className="price">
                                <span className="amount">30USD</span>
                                <span className="duration">/person</span>
                            </div>

                            <ul className="analysis-list">
                                <li>Complete income, expense & cash flow review</li>
                                <li>Debt repayment strategy</li>
                                <li>TFSA & RRSP contribution strategy</li>
                                <li>Emergency fund & risk projection assessment</li>
                                <li>Life & critical illness insurance</li>
                                <li>Tax-saving plan</li>
                                <li>Long-term wealth & dividend income strategy</li>
                                <li>Personalized financial roadmap</li>
                                <li>1-on-1 consultation session</li>
                            </ul>

                            <motion.button
                                className="analysis-button"
                                onClick={handleScheduleClick}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Schedule your first free meeting
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinancialAnalysis;