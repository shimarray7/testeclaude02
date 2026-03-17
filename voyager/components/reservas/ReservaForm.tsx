'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { reservaSchema, type ReservaInput } from '@/lib/validations/reserva'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client, User } from '@/types'

interface ReservaFormProps {
  mode: 'create' | 'edit'
  bookingId?: string
  defaultValues?: Partial<ReservaInput>
  canViewCostPrice?: boolean
}

export function ReservaForm({ mode, bookingId, defaultValues, canViewCostPrice }: ReservaFormProps) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [clientSearch, setClientSearch] = useState('')
  // unused but kept for future filters

  const form = useForm<ReservaInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(reservaSchema) as any,
    defaultValues: {
      pax_count: 1,
      ...defaultValues,
    },
  })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  // Load clients for selector
  useEffect(() => {
    const q = clientSearch ? `?search=${clientSearch}&limit=30` : '?limit=30'
    fetch(`/api/clientes${q}`)
      .then((r) => r.json())
      .then((j) => setClients(j.data ?? []))
      .catch(() => {})
  }, [clientSearch])

  // Load team members
  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((j) => setUsers(j.data ?? []))
      .catch(() => {})
  }, [])

  async function onSubmit(data: ReservaInput) {
    const url = mode === 'create' ? '/api/reservas' : `/api/reservas/${bookingId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error?.message ?? 'Erro ao salvar reserva')
      return
    }

    toast.success(mode === 'create' ? 'Reserva criada com sucesso!' : 'Reserva atualizada!')
    router.push(`/reservas/${json.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client_search">Buscar cliente</Label>
            <Input
              id="client_search"
              placeholder="Digite o nome do cliente..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_id">Cliente *</Label>
            <select
              id="client_id"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('client_id')}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} {c.email ? `— ${c.email}` : ''}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="text-xs text-red-500">{errors.client_id.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Destino e datas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes da Viagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="destination">Destino *</Label>
            <Input
              id="destination"
              placeholder="Ex: Paris, França"
              error={errors.destination?.message}
              {...register('destination')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="departure_date">Data de partida *</Label>
              <Input
                id="departure_date"
                type="date"
                error={errors.departure_date?.message}
                {...register('departure_date')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="return_date">Data de retorno</Label>
              <Input
                id="return_date"
                type="date"
                error={errors.return_date?.message}
                {...register('return_date')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pax_count">Nº de passageiros *</Label>
            <Input
              id="pax_count"
              type="number"
              min={1}
              error={errors.pax_count?.message}
              {...register('pax_count')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="total_price">Valor total (R$) *</Label>
              <Input
                id="total_price"
                type="number"
                step="0.01"
                placeholder="0,00"
                error={errors.total_price?.message}
                {...register('total_price')}
              />
            </div>
            {canViewCostPrice && (
              <div className="space-y-1.5">
                <Label htmlFor="cost_price">Custo real (R$)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  error={errors.cost_price?.message}
                  {...register('cost_price')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Responsável e observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responsável & Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assigned_to">Responsável *</Label>
            <select
              id="assigned_to"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('assigned_to')}
            >
              <option value="">Selecione um responsável</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
            {errors.assigned_to && (
              <p className="text-xs text-red-500">{errors.assigned_to.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre a reserva..."
              rows={3}
              {...register('notes')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Criar Reserva' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
