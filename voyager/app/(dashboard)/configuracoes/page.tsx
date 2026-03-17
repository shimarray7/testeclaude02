'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, UserPlus } from 'lucide-react'
import { AgenciaForm } from '@/components/configuracoes/AgenciaForm'
import { EquipeTable, type TeamMember } from '@/components/configuracoes/EquipeTable'
import { InviteModal } from '@/components/configuracoes/InviteModal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Agency {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  address?: string
  timezone?: string
  currency?: string
}

interface CurrentUser {
  id: string
  role: string
}

const TABS = [
  { id: 'agencia', label: 'Agência' },
  { id: 'equipe',  label: 'Equipe' },
]

export default function ConfiguracoesPage() {
  const [tab, setTab]           = useState('agencia')
  const [agency, setAgency]     = useState<Agency | null>(null)
  const [members, setMembers]   = useState<TeamMember[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading]   = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/configuracoes').then((r) => r.json()),
      fetch('/api/perfil').then((r) => r.json()),
    ]).then(([ag, pf]) => {
      setAgency(ag)
      setCurrentUser({ id: pf.id, role: pf.role })
    }).finally(() => setLoading(false))
  }, [])

  const fetchMembers = useCallback(() => {
    fetch('/api/equipe')
      .then((r) => r.json())
      .then((j) => setMembers(j.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'equipe') fetchMembers()
  }, [tab, fetchMembers])

  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Agência */}
      {tab === 'agencia' && (
        loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : (
          <AgenciaForm
            isAdmin={isAdmin}
            defaultValues={{
              name:     agency?.name     ?? '',
              email:    agency?.email    ?? '',
              phone:    agency?.phone    ?? '',
              website:  agency?.website  ?? '',
              address:  agency?.address  ?? '',
              timezone: agency?.timezone ?? '',
              currency: agency?.currency ?? 'BRL',
            }}
          />
        )
      )}

      {/* Tab: Equipe */}
      {tab === 'equipe' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Convidar membro
              </Button>
            </div>
          )}

          {members.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : (
            <EquipeTable
              members={members}
              currentUserId={currentUser?.id ?? ''}
              isAdmin={isAdmin}
              onRefetch={fetchMembers}
            />
          )}
        </div>
      )}

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onSuccess={fetchMembers}
        />
      )}
    </div>
  )
}
