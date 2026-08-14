import React, { useRef } from 'react'
import CareerHero from './CareerHero/CareerHero'
import CareerForm from './CareerForm/CareerForm'

const Career = () => {
  const formRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <>
      <CareerHero onJoinClick={scrollToForm} />
      <div ref={formRef}>
        <CareerForm />
      </div>
    </>
  )
}

export default Career