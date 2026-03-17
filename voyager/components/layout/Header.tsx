'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  atendente: 'Atendente',
}

interface HeaderProps {
  fullName?: string
  role?: UserRole
  onMenuClick?: () => void
}

export function Header({ fullName, role, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Mobile menu button */}
      <button
        className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
            {fullName?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-medium text-gray-800 leading-tight">{fullName ?? 'Usuário'}</p>
            {role && (
              <p className="text-xs text-gray-500 leading-tight">{roleLabels[role]}</p>
            )}
          </div>
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
        </button>

        {dropdownOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => { setDropdownOpen(false); router.push('/perfil') }}
              >
                <User className="h-4 w-4" />
                Meu perfil
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
