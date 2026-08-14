import React, { useEffect } from 'react'
import PricingSection from './PricingSection/PricingSection'
import PricingHero from './PricingHero/PricingHero'
import FAQ from '../Home/Faqs/FAQ'
import FinancialAnalysis from './FinancialAnalysis/FinancialAnalysis'

const PricingPage = () => {
  // Add useEffect to scroll to top on page load
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // or 'smooth' if you want smooth scrolling
    });
  }, []); // Empty dependency array means it runs once when component mounts

  const scrollToPricing = () => {
    // Use getElementById to find the pricing section
    const pricingSection = document.getElementById('pricing-plans-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      <PricingHero onViewPlansClick={scrollToPricing} />
      <div id="pricing-plans-section">  {/* Add ID here */}
        <PricingSection />

      </div>
      <FinancialAnalysis/>
      <FAQ /> 
    </>
  )
}

export default PricingPage