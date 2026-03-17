'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Plane, CheckCircle } from 'lucide-react'
import { agencySchema, type AgencyInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgencyInput>({ resolver: zodResolver(agencySchema) })

  async function onSubmit(data: AgencyInput) {
    setServerError(null)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 1. Create agency
    const slug = generateSlug(data.name) + '-' + Math.random().toString(36).slice(2, 6)
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        name: data.name,
        slug,
        phone: data.phone || null,
        cnpj: data.cnpj || null,
        email: data.email || user.email,
      })
      .select()
      .single()

    if (agencyError) {
      setServerError('Erro ao criar agência. Tente novamente.')
      return
    }

    // 2. Create user profile with admin role
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        agency_id: agency.id,
        full_name: user.user_metadata.full_name || user.email!.split('@')[0],
        role: 'admin',
      })

    if (userError) {
      setServerError('Erro ao configurar perfil. Tente novamente.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Plane className="h-7 w-7" />
            <span className="text-2xl font-bold text-gray-900">Voyager</span>
          </div>
        </div>
        <CardTitle className="text-xl">Configure sua agência</CardTitle>
        <CardDescription>Passo 2 de 2 — Dados da agência</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-2 flex-1 rounded-full bg-blue-600" />
          <div className="h-2 flex-1 rounded-full bg-blue-600" />
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 p-3 mb-5">
          <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Você será o <strong>administrador</strong> da agência e poderá convidar colaboradores depois.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome da agência *</Label>
            <Input
              id="name"
              placeholder="Ex: Viagens Sol & Mar"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cnpj">CNPJ (opcional)</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0001-00"
              error={errors.cnpj?.message}
              {...register('cnpj')}
            />
          </div>

          {serverError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            <CheckCircle className="h-4 w-4" />
            Criar minha agência
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
