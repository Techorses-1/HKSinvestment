import React from 'react'
import HeroSection from './HeroSection/HeroSection'
import About from './About/About'
import Services from './Services/Services'  
import CTA from './Cta/CTA'
import FAQ from './Faqs/FAQ'
import Testimonials from './Reviews/Testimonials'

const Home = () => {
  return (
    <>
    <HeroSection/>
    <About/>
    <Services/>  
    {/* <Pricing/>  */}
    <CTA/>

    <Testimonials/> 
    {/* <FAQ/>  */}
    </>
  )
}

export default Home