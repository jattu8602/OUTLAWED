'use client'
import Head from 'next/head'
import AboutSection from '@/components/landing/about'
import FAQ from '@/components/landing/faq'
import InfoCard from '@/components/landing/info-card'
import SponsorsSection from '@/components/landing/sponsors'
import ResponsiveHero from '@/components/landing/responsive-hero'
import Loader from '@/components/ui/Loader'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/global/nav'
import Footer from '@/components/global/footer'
import { ReactLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const [loading, setLoading] = useState(true)
  const lenisRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    if (loading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      window.scrollTo(0, 0)
    }
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [loading])

  // GSAP Smooth Scrolling Setup (only for this page)
  useEffect(() => {
    // Set lagSmoothing to 0 (no smoothing)
    gsap.ticker.lagSmoothing(0)

    // Wait for Lenis to be available
    const checkLenis = () => {
      const lenis = lenisRef.current?.lenis
      if (lenis) {
        // Attach ScrollTrigger update to Lenis scroll event
        lenis.on('scroll', ScrollTrigger.update)

        // Also attach to the global window object for debugging
        if (typeof window !== 'undefined') {
          window.ScrollTrigger = ScrollTrigger
          window.gsap = gsap
        }

        return true
      }
      return false
    }

    // Try immediately
    if (!checkLenis()) {
      // If not available, try again after a short delay
      const timer = setTimeout(() => {
        checkLenis()
      }, 100)

      return () => clearTimeout(timer)
    }

    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)

    return () => {
      gsap.ticker.remove(update)
      const lenis = lenisRef.current?.lenis
      if (lenis) {
        lenis.off('scroll', ScrollTrigger.update)
      }
    }
  }, [])

  return (
    <ReactLenis root options={{ autoRaf: true }} ref={lenisRef}>
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#fff',
            zIndex: 10000,
            opacity: loading ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <Loader />
        </div>
      )}
      <div
        className="bg-[#141414] min-h-screen w-screen overflow-x-clip"
        style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.9s ease' }}
      >
        <Navbar />
        <ResponsiveHero />
        <InfoCard />
        <FAQ />
        <Footer />
      </div>
    </ReactLenis>
  )
}
