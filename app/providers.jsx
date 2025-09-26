'use client'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/lib/theme'
import { LayoutProvider } from '@/lib/contexts/LayoutContext'
import { Toaster } from 'react-hot-toast'
// import { Toaster as SonnerToaster } from 'sonner'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <LayoutProvider>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
            }}
          />
          {/* <SonnerToaster position="top-right" richColors /> */}
        </ThemeProvider>
      </LayoutProvider>
    </SessionProvider>
  )
}
