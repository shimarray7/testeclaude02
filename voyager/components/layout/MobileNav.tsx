'use client'

import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import type { UserRole } from '@/types'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  role?: UserRole
  agencyName?: string
}

export function MobileNav({ open, onClose, role, agencyName }: MobileNavProps) {
  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 flex h-full w-60 animate-in slide-in-from-left">
        <Sidebar role={role} agencyName={agencyName} onClose={onClose} mobile />
      </div>
    </div>
  )
}
