'use client'

import type { UserRole } from '@/types'

interface Permissions {
  canViewAllBookings: boolean
  canCreateBooking: boolean
  canCancelBooking: boolean
  canViewCostPrice: boolean
  canAccessFinancials: boolean
  canManageUsers: boolean
  canManageAgencySettings: boolean
  canExportData: boolean
}

export function usePermissions(role: UserRole | undefined): Permissions {
  if (!role) {
    return {
      canViewAllBookings: false,
      canCreateBooking: false,
      canCancelBooking: false,
      canViewCostPrice: false,
      canAccessFinancials: false,
      canManageUsers: false,
      canManageAgencySettings: false,
      canExportData: false,
    }
  }

  const isAdmin = role === 'admin'
  const isGestor = role === 'gestor'
  const isAtendente = role === 'atendente'

  return {
    canViewAllBookings:      isAdmin || isGestor,
    canCreateBooking:        true,
    canCancelBooking:        isAdmin || isGestor,
    canViewCostPrice:        isAdmin || isGestor,
    canAccessFinancials:     isAdmin || isGestor,
    canManageUsers:          isAdmin,
    canManageAgencySettings: isAdmin,
    canExportData:           isAdmin || isGestor,
  }
}
