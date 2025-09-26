'use client'
import { useState, useEffect } from 'react'
import Hero from './hero'
import MobileHero from './mobile-hero'
import { useIsMobile } from '@/hooks/useIsMobile'

// ============================================================================
// RESPONSIVE HERO COMPONENT
// ============================================================================
// This component automatically switches between desktop and mobile hero
// based on screen size and device capabilities
// ============================================================================

const ResponsiveHero = () => {
  const isMobile = useIsMobile()

  return <>{isMobile ? <MobileHero /> : <Hero />}</>
}

export default ResponsiveHero
