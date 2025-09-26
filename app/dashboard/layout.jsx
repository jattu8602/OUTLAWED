'use client'

import { usePathname } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()

  // If we're on a test page, render without dashboard layout
  if (
    pathname?.startsWith('/dashboard/test/') ||
    pathname?.startsWith('/dashboard/lexia/test/')
  ) {
    return <>{children}</>
  }

  // Otherwise, render with dashboard layout
  return <MainLayout isAdmin={false}>{children}</MainLayout>
}
