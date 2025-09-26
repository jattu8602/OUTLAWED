import React from 'react'
import TextReveal from '@/components/landing/about'

const MobileHero = () => {
  return (
    <>
      <section className="hero host-grotesk relative w-screen min-h-screen p-6 flex items-center justify-center text-[#141414] overflow-hidden border-24 border-[#141414]">
        <img
          src="/outm.png"
          alt="Mobile Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>
      <TextReveal />
    </>
  )
}

export default MobileHero
