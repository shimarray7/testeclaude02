'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { tarefaSchema, type TarefaInput } from '@/lib/validations/tarefa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User    { id: string; full_name: string }
interface Booking { id: string; reference_code: string; destination: string }

interface TarefaFormProps {
  mode: 'create' | 'edit'
  tarefaId?: string
  defaultValues?: Partial<TarefaInput>
  redirectTo?: string
}

const PRIORITIES = [
  { value: 'low',    label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high',   label: 'Alta' },
]

const STATUSES = [
  { value: 'todo',        label: 'A fazer' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'done',        label: 'Concluída' },
]

export function TarefaForm({ mode, tarefaId, defaultValues, redirectTo = '/tarefas' }: TarefaFormProps) {
  const router = useRouter()
  const [users, setUsers]     = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TarefaInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tarefaSchema) as any,
    defaultValues: { status: 'todo', priority: 'medium', ...defaultValues },
  })

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((j) => setUsers(j.data ?? []))
      .catch(() => {})
    fetch('/api/reservas?limit=100')
      .then((r) => r.json())
      .then((j) => setBookings(j.data ?? []))
      .catch(() => {})
  }, [])

  async function onSubmit(data: TarefaInput) {
    const url    = mode === 'create' ? '/api/tarefas' : `/api/tarefas/${tarefaId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error?.message ?? 'Erro ao salvar tarefa')
      return
    }

    toast.success(mode === 'create' ? 'Tarefa criada!' : 'Tarefa atualizada!')
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Detalhes da Tarefa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Confirmar passagens com a companhia aérea"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais sobre a tarefa..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                {...register('priority')}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                {...register('status')}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Atribuição & Prazo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="assigned_to">Responsável</Label>
              <select
                id="assigned_to"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                {...register('assigned_to')}
              >
                <option value="">Sem responsável</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Prazo</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="booking_id">Reserva vinculada</Label>
            <select
              id="booking_id"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('booking_id')}
            >
              <option value="">Sem vínculo</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.reference_code} — {b.destination}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Criar Tarefa' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
