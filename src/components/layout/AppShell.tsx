import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { useIsMobile } from '@/hooks/useMediaQuery'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
