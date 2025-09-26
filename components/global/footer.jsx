'use client'

import { Instagram, Linkedin, Mail } from 'lucide-react'
import { useRef } from 'react'

export default function Footer() {
  const linkRefs = useRef([])

  return (
    <div className="w-full bg-[#141414] px-4 md:px-16 border-[#222] overflow-x-hidden">
      {/* ================= DESKTOP FOOTER ================= */}
      <div className="hidden md:flex min-h-screen flex-col justify-center items-center">
        <div className="w-full min-h-screen max-w-6xl bg-[#fcf2e8] border border-[#e5e5e5] rounded-2xl flex flex-col justify-between shadow-xl">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center w-full mx-auto mt-8 mb-8">
            <img
              src="/out.png"
              alt="Outlawed Logo"
              className="w-140 h-70 object-contain mx-auto"
            />
          </div>

          {/* Socials */}
          <div className="w-full mt-8">
            <h2 className="text-[#141414] font-bold uppercase text-base md:text-lg tracking-widest text-center">
              Connect
            </h2>
            <div className="flex flex-row justify-center items-center gap-6 w-full mt-2">
              <a
                href="https://www.instagram.com/daksh.madhyam/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#ffe4ec] flex items-center justify-center hover:bg-[#ffd6e6] transition-colors duration-200 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[#c13584] group-hover:text-[#a14c7e]" />
              </a>
              <a
                href="https://www.linkedin.com/company/daksh-madhyam/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#e6f0ff] flex items-center justify-center hover:bg-[#d6eaff] transition-colors duration-200 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[#0077b5] group-hover:text-[#4a90e2]" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=daksh.madhyam@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#ffeaea] flex items-center justify-center hover:bg-[#ffd6d6] transition-colors duration-200 group"
                aria-label="Mail"
              >
                <Mail className="w-5 h-5 text-[#ea4335] group-hover:text-[#e57373]" />
              </a>
            </div>
          </div>

          <div className="w-full text-center text-[#666] text-xs mt-8 mb-8">
            &copy; 2025 OUTLAWED. All rights reserved.
          </div>
        </div>
      </div>

      {/* ================= MOBILE FOOTER ================= */}
      <div className="flex md:hidden flex-col items-center justify-center py-6">
        <div className="w-full max-w-md bg-[#fcf2e8] border border-[#e5e5e5] rounded-xl shadow-lg py-6">
          {/* Smaller Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/out.png"
              alt="Outlawed Logo"
              className="w-200 object-contain"
            />
          </div>

          {/* Socials Compact */}
          <h2 className="text-[#141414] font-bold uppercase text-sm tracking-widest text-center">
            Connect
          </h2>
          <div className="flex flex-row justify-center items-center gap-4 mt-2">
            <a
              href="https://www.instagram.com/daksh.madhyam/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#ffe4ec] flex items-center justify-center hover:bg-[#ffd6e6] transition-colors duration-200"
            >
              <Instagram className="w-4 h-4 text-[#c13584]" />
            </a>
            <a
              href="https://www.linkedin.com/company/daksh-madhyam/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#e6f0ff] flex items-center justify-center hover:bg-[#d6eaff] transition-colors duration-200"
            >
              <Linkedin className="w-4 h-4 text-[#0077b5]" />
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=daksh.madhyam@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#ffeaea] flex items-center justify-center hover:bg-[#ffd6d6] transition-colors duration-200"
            >
              <Mail className="w-4 h-4 text-[#ea4335]" />
            </a>
          </div>

          {/* Copyright */}
          <div className="w-full text-center text-[#666] text-xs mt-4">
            &copy; 2025 OUTLAWED.
          </div>
        </div>
      </div>
    </div>
  )
}
