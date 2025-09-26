'use client'

import { Instagram, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#fbf6ef] font-sans text-[#161616]">
      {/* Outer container with soft cream background to match aesthetic */}
      <div className="px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[#eee] bg-white/60 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          {/* Upper content area */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 p-8 md:p-10 lg:p-12">
            {/* Brand + Logo */}
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/out.png"
                  alt="OUTLAWED Logo"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-xl font-extrabold tracking-wide">
                  OUTLAWED
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                Empower your study journey with clean design and powerful tools.
              </p>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-gray-900 mb-3 relative">
                Products
                <span className="absolute -bottom-1 left-0 h-[2px] w-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></span>
              </h3>
              <ul className="space-y-2">
                <FooterLink href="/dashboard/test">Practice</FooterLink>
                <FooterLink href="/dashboard/test-series">Materials</FooterLink>
                <FooterLink href="/dashboard/payments">Pricing</FooterLink>
                <FooterLink href="/dashboard">Dashboard</FooterLink>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-gray-900 mb-3 relative">
                About Us
                <span className="absolute -bottom-1 left-0 h-[2px] w-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></span>
              </h3>
              <ul className="space-y-2">
                <FooterLink href="/#about">Our Story</FooterLink>
                <FooterLink href="mailto:daksh.madhyam@gmail.com">
                  Contact
                </FooterLink>
                <FooterLink href="/#careers">Careers</FooterLink>
              </ul>
            </div>

            {/* Connect - prominent */}
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-gray-900 mb-3 relative">
                Connect
                <span className="absolute -bottom-1 left-0 h-[2px] w-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></span>
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                We'd love to hear from you
              </p>
              <div className="flex items-center gap-3">
                <SocialIcon
                  href="https://www.instagram.com/daksh.madhyam/"
                  ariaLabel="Instagram"
                  className="bg-[#ffe8f0] hover:bg-[#ffd9e8] text-[#c13584]"
                >
                  <Instagram className="w-4 h-4" />
                </SocialIcon>
                <SocialIcon
                  href="https://www.linkedin.com/company/daksh-madhyam/"
                  ariaLabel="LinkedIn"
                  className="bg-[#eaf2ff] hover:bg-[#dceaff] text-[#0a66c2]"
                >
                  <Linkedin className="w-4 h-4" />
                </SocialIcon>
                <SocialIcon
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=daksh.madhyam@gmail.com"
                  ariaLabel="Email"
                  className="bg-[#ffeded] hover:bg-[#ffdede] text-[#ea4335]"
                >
                  <Mail className="w-4 h-4" />
                </SocialIcon>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-8 md:px-10 lg:px-12 py-5">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2025 OUTLAWED. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
              <a className="hover:text-gray-900 transition-colors" href="/">
                Terms
              </a>
              <span className="text-gray-300">•</span>
              <a className="hover:text-gray-900 transition-colors" href="/">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }) {
  return (
    <li>
      <a
        href={href}
        className="group inline-flex items-center text-[13px] sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-gray-900 after:transition-all after:duration-300 group-hover:after:w-full">
          {children}
        </span>
      </a>
    </li>
  )
}

function SocialIcon({ href, ariaLabel, className = '', children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.03] ${className}`}
    >
      {children}
    </a>
  )
}
