'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { inviteSchema, type InviteInput } from '@/lib/validations/configuracoes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InviteModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function InviteModal({ onClose, onSuccess }: InviteModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inviteSchema) as any,
    defaultValues: { role: 'atendente' },
  })

  async function onSubmit(data: InviteInput) {
    const res = await fetch('/api/equipe/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Erro ao convidar')
      return
    }
    toast.success(`Convite enviado para ${data.email}`)
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Convidar Membro</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite_email">E-mail *</Label>
            <Input
              id="invite_email"
              type="email"
              placeholder="colaborador@agencia.com.br"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite_role">Papel *</Label>
            <select
              id="invite_role"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('role')}
            >
              <option value="atendente">Atendente — visualiza clientes e reservas</option>
              <option value="gestor">Gestor — gerencia tudo, exceto configurações</option>
              <option value="admin">Administrador — acesso total</option>
            </select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
            O convidado receberá um e-mail para criar a senha e acessar a plataforma.
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Enviar convite</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
