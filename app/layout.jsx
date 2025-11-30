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
    default: 'TestVerse | All Exam Tests | Exam Preparation Platform',
    template: '%s | TestVerse',
  },
  description:
    'outlawed-iota.vercel.app is a smart test-prep platform designed for all competitive exam aspirants. Powered by Daksh Madhyam, we help students practice through expertly curated free and premium mock tests, crafted to match the exact exam patterns. Our mission is to make exam preparation affordable, accessible, and focused — so every aspirant can test smarter, analyze performance deeply, and improve faster. Whether you are just starting out or aiming for a top rank, outlawed-iota.vercel.app is your trusted practice partner on the road to success.',
  keywords: [
    'TestVerse',
    'Exam Preparation',
    'Mock Tests',
    'Free Tests',
    'Paid Tests',
    'Online Platform',
    'Competitive Exams',
    'Entrance Exams',
    'Aptitude Tests',
    'Reasoning',
    'Current Affairs',
    'Quantitative Techniques',
    'English',
    'Practice Tests',
    'Test Series',
    'Coaching Alternative',
    'Daksh Madhyam',
    'CLAT',
    'JEE',
    'NEET',
    'UPSC',
    'CAT',
  ],
  metadataBase: new URL('https://outlawed-iota.vercel.app/'),
  openGraph: {
    title: 'TestVerse | Mock Tests & Preparation for All Exams',
    description:
      'outlawed-iota.vercel.app — your smart exam preparation platform with free and paid mock tests, detailed analysis, and exam-focused practice for all competitive exams.',
    url: 'https://outlawed-iota.vercel.app/',
    siteName: 'TestVerse',
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
