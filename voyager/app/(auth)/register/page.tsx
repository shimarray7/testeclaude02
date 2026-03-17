'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plane, ArrowRight } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    // Redirect to onboarding to create the agency
    router.push('/onboarding')
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
        <CardTitle className="text-xl">Criar sua conta</CardTitle>
        <CardDescription>Passo 1 de 2 — Dados pessoais</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-2 flex-1 rounded-full bg-blue-600" />
          <div className="h-2 flex-1 rounded-full bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              placeholder="Seu nome"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirmar senha</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Repita a senha"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />
          </div>

          {serverError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Próximo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
