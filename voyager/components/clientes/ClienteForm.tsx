'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { clienteSchema, type ClienteInput } from '@/lib/validations/cliente'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClienteFormProps {
  mode: 'create' | 'edit'
  clienteId?: string
  defaultValues?: Partial<ClienteInput>
}

export function ClienteForm({ mode, clienteId, defaultValues }: ClienteFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: defaultValues ?? {},
  })

  async function onSubmit(data: ClienteInput) {
    const url    = mode === 'create' ? '/api/clientes' : `/api/clientes/${clienteId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error?.message ?? 'Erro ao salvar cliente')
      return
    }

    toast.success(mode === 'create' ? 'Cliente criado com sucesso!' : 'Cliente atualizado!')
    router.push(`/clientes/${json.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nome completo *</Label>
            <Input
              id="full_name"
              placeholder="Ex: João da Silva"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="birth_date">Data de nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                error={errors.birth_date?.message}
                {...register('birth_date')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Input
                id="nationality"
                placeholder="Ex: Brasileiro"
                error={errors.nationality?.message}
                {...register('nationality')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              {...register('cpf')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="joao@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              placeholder="+55 (11) 90000-0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Passaporte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documento de Viagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="passport_number">Nº do passaporte</Label>
              <Input
                id="passport_number"
                placeholder="AA000000"
                error={errors.passport_number?.message}
                {...register('passport_number')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passport_expiry">Validade do passaporte</Label>
              <Input
                id="passport_expiry"
                type="date"
                error={errors.passport_expiry?.message}
                {...register('passport_expiry')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            placeholder="Preferências, restrições, anotações internas..."
            rows={3}
            {...register('notes')}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
