import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Metadata } from 'next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: {
    default: 'OUTLAWED | CLAT Exam Tests | CLAT Exam Preparation',
    template: '%s | OUTLAWED',
  },
  description:
    'Outlawed.in is a smart test-prep platform designed exclusively for CLAT aspirants. Powered by Daksh Madhyam, we help law students practice through expertly curated free and premium mock tests, crafted to match the exact CLAT exam pattern. Our mission is to make CLAT preparation affordable, accessible, and exam-focused — so every aspirant can test smarter, analyze performance deeply, and improve faster. Whether you are just starting out or aiming for a top rank, Outlawed.in is your trusted practice partner on the road to NLU success.',
  keywords: [
    'Outlawed',
    'CLAT',
    'CLAT 2026',
    'CLAT Preparation',
    'CLAT Mock Tests',
    'CLAT Free Tests',
    'CLAT Paid Tests',
    'CLAT Online Platform',
    'Law Entrance',
    'NLU Preparation',
    'Legal Aptitude',
    'Logical Reasoning',
    'Current Affairs',
    'Quantitative Techniques',
    'English for CLAT',
    'CLAT Practice',
    'CLAT Test Series',
    'CLAT 2025',
    'CLAT Coaching Alternative',
    'Daksh Madhyam',
  ],
  metadataBase: new URL('https://outlawed.in/'),
  openGraph: {
    title: 'Outlawed | CLAT Mock Tests & Preparation',
    description:
      'Outlawed.in by Daksh Madhyam — your smart CLAT preparation platform with free and paid mock tests, detailed analysis, and exam-focused practice.',
    url: 'https://outlawed.in/',
    siteName: 'Outlawed',
    locale: 'en_US',
    type: 'website',
  },

}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta
        name="google-site-verification"
        content="23j7kqfTKi8Qhtb7WXt4RA1xX_I1q83sxv4IFsW_kes"
      />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
