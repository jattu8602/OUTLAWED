'use client'

import { useState, useEffect, useRef } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import gsap from 'gsap'
import { Button } from './button'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'

export const PillMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const timelineRef = useRef(null)
  const containerRef = useRef(null)
  const menuRef = useRef(null)
  const { data: session } = useSession()

  const isLoggedIn = !!session

  // GSAP animation setup
  useEffect(() => {
    if (!containerRef.current) return

    const items = gsap.utils.toArray < HTMLElement > '.menu-item'

    timelineRef.current = gsap.timeline({
      paused: true,
      onUpdate: function () {
        setProgress(this.progress())
      },
    })

    timelineRef.current
      .to(containerRef.current, {
        height: '200px',
        width: '14rem',
        duration: 0.6,
        ease: 'power3.out',
      })
      .to(
        items,
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.3'
      )

    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      timelineRef.current?.play()
    } else {
      timelineRef.current?.reverse()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getItemOpacity = (index) => {
    const baseProgress = progress
    const itemDelay = index * 0.08
    const itemProgress = Math.max(
      0,
      Math.min(1, (baseProgress - itemDelay) / 0.3)
    )

    if (!isOpen && progress < 1) {
      return Math.max(0, Math.min(1, progress))
    }

    return itemProgress
  }

  return (
    <div className="relative z-50" ref={menuRef}>
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <div
          ref={containerRef}
          className="h-14 w-12 md:w-auto rounded-2xl bg-[#141414] border border-[#333] flex items-center justify-between px-2"
        >
          {/* Desktop: direct button */}
          <div className="hidden md:flex">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-3 py-3 text-[#e6d9cf] rounded-lg font-black text-sm hover:bg-[#feaac0] hover:text-[#141414] transition-colors duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-3 py-3 text-[#e6d9cf] rounded-lg font-black text-sm hover:bg-[#feaac0] hover:text-[#141414] transition-colors duration-200"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile: hamburger + collapsible */}
          <div className="md:hidden flex">
            <Collapsible.Trigger asChild>
              <Button className="flex items-center justify-center w-8 h-12 text-[#fcf2e8] hover:bg-[#222] rounded-2xl transition-colors duration-200 p-2">
                <div className="flex flex-col justify-center items-center w-5 h-5 relative">
                  <div
                    className={`w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                      isOpen ? 'rotate-45 translate-y-1' : ''
                    }`}
                  ></div>
                  <div
                    className={`w-5 h-0.5 bg-current mt-1 transition-all duration-300 ease-in-out ${
                      isOpen ? 'opacity-0' : ''
                    }`}
                  ></div>
                  <div
                    className={`w-5 h-0.5 bg-current mt-1 transition-all duration-300 ease-in-out ${
                      isOpen ? '-rotate-45 -translate-y-1' : ''
                    }`}
                  ></div>
                </div>
              </Button>
            </Collapsible.Trigger>
          </div>
        </div>

        {/* Mobile collapsible content */}
        <Collapsible.Content>
          <div className="mt-4 flex flex-col gap-2 px-3 md:hidden">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="menu-item translate-y-4 flex items-center justify-center px-4 py-3 bg-[#fcf2e8] text-[#141414] rounded-xl font-black text-base hover:bg-[#e6d9cf] transition-colors duration-200"
                style={{
                  opacity: getItemOpacity(0),
                  transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn()}
                className="menu-item translate-y-4 flex items-center justify-center px-4 py-3 bg-[#fcf2e8] text-[#141414] rounded-xl font-black text-base hover:bg-[#e6d9cf] transition-colors duration-200"
                style={{
                  opacity: getItemOpacity(0),
                  transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                Login
              </button>
            )}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}
