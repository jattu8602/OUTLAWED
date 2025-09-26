'use client'

import MainLayout from '@/components/layout/main-layout'

export default function AdminLayout({ children }) {
  return <MainLayout isAdmin={true}>{children}</MainLayout>
}



