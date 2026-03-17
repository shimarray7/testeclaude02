'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PlaneTakeoff,
  Users,
  DollarSign,
  CheckSquare,
  Settings,
  X,
  Plane,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'gestor', 'atendente'] as UserRole[],
  },
  {
    href: '/reservas',
    label: 'Reservas',
    icon: PlaneTakeoff,
    roles: ['admin', 'gestor', 'atendente'] as UserRole[],
  },
  {
    href: '/clientes',
    label: 'Clientes',
    icon: Users,
    roles: ['admin', 'gestor', 'atendente'] as UserRole[],
  },
  {
    href: '/financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    roles: ['admin', 'gestor'] as UserRole[],
  },
  {
    href: '/tarefas',
    label: 'Tarefas',
    icon: CheckSquare,
    roles: ['admin', 'gestor', 'atendente'] as UserRole[],
  },
  {
    href: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    roles: ['admin'] as UserRole[],
  },
]

interface SidebarProps {
  role?: UserRole
  agencyName?: string
  onClose?: () => void
  mobile?: boolean
}

export function Sidebar({ role, agencyName, onClose, mobile }: SidebarProps) {
  const pathname = usePathname()
  const visibleItems = navItems.filter((item) =>
    !role || item.roles.includes(role)
  )

  return (
    <aside className="flex h-full w-60 flex-col bg-slate-900 text-white">
      {/* Logo / Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-bold">Voyager</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Agency name */}
      {agencyName && (
        <div className="px-5 py-2.5 border-b border-slate-700">
          <p className="text-xs text-slate-400 truncate">{agencyName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: version */}
      <div className="px-5 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">MVP v1.0</p>
      </div>
    </aside>
  )
}
