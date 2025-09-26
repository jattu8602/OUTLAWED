'use client'

import React from 'react'
import Link from 'next/link'
import Copy from '@/components/ui/textAnimation/Copy'
import { useSession, signIn } from 'next-auth/react'

const Navbar = () => {
  const { data: session } = useSession()
  const isLoggedIn = !!session

  const buttonClasses =
    'text-[#fcf2e8] text-sm md:text-base font-bold justify-center px-4 items-center cursor-pointer h-12 flex overflow-hidden rounded-2xl bg-[#141414] border border-[#333] transition-all duration-200 hover:bg-[#1c1c1c]'

  const buttonClassess =
    'text-[#fcf2e8] text-sm md:text-base font-bold justify-center px-4 items-center cursor-pointer h-12 flex overflow-hidden rounded-2xl bg-[#141414] border border-[#333] transition-all duration-200 hover:bg-[#AF4C0F] '


  return (
    <nav className="fixed top-0 left-0 w-screen px-4 md:px-[1.5em] py-4 md:py-[1.5em] flex justify-between z-20">
      <div className="flex justify-between items-start w-full">
        {/* Logo - only visible on desktop */}
        <Copy animateOnScroll={false} delay={0.2}>
          <Link
            href="https://www.outlawed.in/"
            className={`hidden md:flex ${buttonClasses} text-xl md:text-2xl`}
          >
            OUTLAWED
          </Link>
        </Copy>

        {/* Right side - Dashboard/Login button (same style as OUTLAWED) */}
        <div className="flex items-center justify-end">
          {isLoggedIn ? (
            <Link href="/dashboard" className={buttonClassess} >
              Dashboard
            </Link>
          ) : (
            <button onClick={() => signIn()} className={buttonClassess}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
