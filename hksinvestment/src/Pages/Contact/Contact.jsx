import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom' // Add this import
import ContactHero from './ContactHero/ContactHero'
import AppointmentSection from './AppointmentSection/AppointmentSection'

const Contact = () => {
  const location = useLocation(); // Add this hook

  // Handle scrolling to appointment section if state exists
  useEffect(() => {
    if (location.state?.scrollTo === 'appointment-section') {
      const element = document.getElementById('appointment-section');
      if (element) {
        // Small delay to ensure the page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <ContactHero/>
      <AppointmentSection/> 
    </>
  )
}

export default Contact;