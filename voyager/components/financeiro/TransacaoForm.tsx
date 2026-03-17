'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { transacaoSchema, type TransacaoInput } from '@/lib/validations/transacao'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Booking { id: string; reference_code: string; destination: string }

interface TransacaoFormProps {
  mode: 'create' | 'edit'
  transacaoId?: string
  defaultValues?: Partial<TransacaoInput>
}

const TYPES = [
  { value: 'income',  label: 'Receita' },
  { value: 'expense', label: 'Despesa' },
  { value: 'refund',  label: 'Reembolso' },
]

const STATUSES = [
  { value: 'pending',   label: 'Pendente' },
  { value: 'paid',      label: 'Pago' },
  { value: 'overdue',   label: 'Vencido' },
  { value: 'cancelled', label: 'Cancelado' },
]

const CATEGORIES = [
  'Passagem Aérea', 'Hospedagem', 'Pacote Turístico', 'Seguro Viagem',
  'Transfer', 'Passeio', 'Consultoria', 'Outros',
]

export function TransacaoForm({ mode, transacaoId, defaultValues }: TransacaoFormProps) {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransacaoInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transacaoSchema) as any,
    defaultValues: { status: 'pending', ...defaultValues },
  })

  useEffect(() => {
    fetch('/api/reservas?limit=100')
      .then((r) => r.json())
      .then((j) => setBookings(j.data ?? []))
      .catch(() => {})
  }, [])

  async function onSubmit(data: TransacaoInput) {
    const url    = mode === 'create' ? '/api/financeiro' : `/api/financeiro/${transacaoId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error?.message ?? 'Erro ao salvar transação')
      return
    }

    toast.success(mode === 'create' ? 'Transação criada!' : 'Transação atualizada!')
    router.push('/financeiro')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Dados da Transação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="type">Tipo *</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                {...register('type')}
              >
                <option value="">Selecione</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Passagem aérea GRU–CDG"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                error={errors.amount?.message}
                {...register('amount')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                {...register('category')}
              >
                <option value="">Sem categoria</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Datas & Vínculo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Vencimento</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paid_at">Data de pagamento</Label>
              <Input id="paid_at" type="date" {...register('paid_at')} />
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

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={2} placeholder="Anotações internas..." {...register('notes')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Criar Transação' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
