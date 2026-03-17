'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ShieldCheck, UserX, UserCheck } from 'lucide-react'

export interface TeamMember {
  id: string
  full_name: string
  email: string
  phone?: string
  role: 'admin' | 'gestor' | 'atendente'
  is_active: boolean
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  admin:     'Administrador',
  gestor:    'Gestor',
  atendente: 'Atendente',
}

const ROLE_STYLES: Record<string, string> = {
  admin:     'bg-purple-100 text-purple-700',
  gestor:    'bg-blue-100 text-blue-700',
  atendente: 'bg-gray-100 text-gray-600',
}

interface Props {
  members: TeamMember[]
  currentUserId: string
  isAdmin: boolean
  onRefetch: () => void
}

export function EquipeTable({ members, currentUserId, isAdmin, onRefetch }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleRoleChange(id: string, role: string) {
    setLoading(id)
    const res = await fetch(`/api/equipe/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    setLoading(null)
    if (res.ok) { toast.success('Papel atualizado!'); onRefetch() }
    else { const j = await res.json(); toast.error(j.error ?? 'Erro') }
  }

  async function handleToggleActive(id: string, current: boolean) {
    setLoading(id)
    const res = await fetch(`/api/equipe/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    setLoading(null)
    if (res.ok) {
      toast.success(current ? 'Usuário desativado.' : 'Usuário reativado.')
      onRefetch()
    } else {
      const j = await res.json(); toast.error(j.error ?? 'Erro')
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Membro</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Papel</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              {isAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => {
              const isSelf = m.id === currentUserId
              return (
                <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${!m.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {m.full_name}
                      {isSelf && <span className="ml-2 text-xs text-blue-500 font-normal">(você)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && !isSelf ? (
                      <select
                        value={m.role}
                        disabled={loading === m.id}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="text-xs font-semibold rounded-full px-2 py-1 border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="admin">Administrador</option>
                        <option value="gestor">Gestor</option>
                        <option value="atendente">Atendente</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[m.role]}`}>
                        <ShieldCheck className="h-3 w-3" />
                        {ROLE_LABELS[m.role]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <button
                          disabled={loading === m.id}
                          onClick={() => handleToggleActive(m.id, m.is_active)}
                          title={m.is_active ? 'Desativar usuário' : 'Reativar usuário'}
                          className={`p-1.5 rounded-md transition-colors ${
                            m.is_active
                              ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {m.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {members.map((m) => (
          <div key={m.id} className={`p-4 flex items-center justify-between gap-3 ${!m.is_active ? 'opacity-50' : ''}`}>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {m.full_name}
                {m.id === currentUserId && <span className="ml-1 text-xs text-blue-500">(você)</span>}
              </p>
              <p className="text-xs text-gray-400 truncate">{m.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[m.role]}`}>
                {ROLE_LABELS[m.role]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
