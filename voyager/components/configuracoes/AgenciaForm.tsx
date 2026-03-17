'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { agenciaSchema, type AgenciaInput } from '@/lib/validations/configuracoes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const TIMEZONES = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Noronha',
]

const CURRENCIES = [
  { value: 'BRL', label: 'BRL — Real Brasileiro' },
  { value: 'USD', label: 'USD — Dólar Americano' },
  { value: 'EUR', label: 'EUR — Euro' },
]

interface AgenciaFormProps {
  defaultValues: Partial<AgenciaInput>
  isAdmin: boolean
}

export function AgenciaForm({ defaultValues, isAdmin }: AgenciaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AgenciaInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(agenciaSchema) as any,
    defaultValues,
  })

  async function onSubmit(data: AgenciaInput) {
    const res = await fetch('/api/configuracoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) toast.error(json.error ?? 'Erro ao salvar')
    else toast.success('Configurações salvas!')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações da Agência</CardTitle>
          <CardDescription>Dados públicos da sua agência.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome da agência *</Label>
            <Input
              id="name"
              disabled={!isAdmin}
              placeholder="Ex: Voyager Turismo Ltda."
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" disabled={!isAdmin} {...register('email')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" disabled={!isAdmin} {...register('phone')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://suaagencia.com.br" disabled={!isAdmin} error={errors.website?.message} {...register('website')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" disabled={!isAdmin} {...register('address')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Fuso horário</Label>
              <select
                id="timezone"
                disabled={!isAdmin}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500"
                {...register('timezone')}
              >
                <option value="">Selecione</option>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Moeda</Label>
              <select
                id="currency"
                disabled={!isAdmin}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500"
                {...register('currency')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Salvar configurações
          </Button>
        </div>
      )}

      {!isAdmin && (
        <p className="text-sm text-gray-400 text-center">
          Apenas administradores podem editar as configurações da agência.
        </p>
      )}
    </form>
  )
}
