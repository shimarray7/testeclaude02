'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import type { UserRole } from '@/types'

interface DashboardShellProps {
  children: React.ReactNode
  fullName?: string
  role?: UserRole
  agencyName?: string
}

export function DashboardShell({ children, fullName, role, agencyName }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full flex-shrink-0">
        <Sidebar role={role} agencyName={agencyName} />
      </div>

      {/* Mobile drawer */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role={role}
        agencyName={agencyName}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          fullName={fullName}
          role={role}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
