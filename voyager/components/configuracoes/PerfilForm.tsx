'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  perfilSchema, changePasswordSchema,
  type PerfilInput, type ChangePasswordInput,
} from '@/lib/validations/configuracoes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const ROLE_LABELS: Record<string, string> = {
  admin:     'Administrador',
  gestor:    'Gestor',
  atendente: 'Atendente',
}

interface PerfilFormProps {
  defaultValues: Partial<PerfilInput> & { email?: string; role?: string }
}

export function PerfilForm({ defaultValues }: PerfilFormProps) {
  const [changingPwd, setChangingPwd] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(perfilSchema) as any,
    defaultValues,
  })

  const pwdForm = useForm<ChangePasswordInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(changePasswordSchema) as any,
  })

  async function onSubmit(data: PerfilInput) {
    const res = await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) toast.error(json.error ?? 'Erro ao salvar')
    else toast.success('Perfil atualizado!')
  }

  async function onChangePassword(data: ChangePasswordInput) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.new_password })
    if (error) toast.error(error.message)
    else {
      toast.success('Senha alterada com sucesso!')
      pwdForm.reset()
      setChangingPwd(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meu Perfil</CardTitle>
            <CardDescription>
              {defaultValues.email && (
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {defaultValues.email}
                </span>
              )}
              {defaultValues.role && (
                <span className="ml-2 text-xs text-gray-500">
                  · {ROLE_LABELS[defaultValues.role] ?? defaultValues.role}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nome completo *</Label>
              <Input
                id="full_name"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                Salvar perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          {!changingPwd ? (
            <Button variant="outline" onClick={() => setChangingPwd(true)}>
              Alterar senha
            </Button>
          ) : (
            <form onSubmit={pwdForm.handleSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current_password">Senha atual</Label>
                <Input
                  id="current_password"
                  type="password"
                  error={pwdForm.formState.errors.current_password?.message}
                  {...pwdForm.register('current_password')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_password">Nova senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  error={pwdForm.formState.errors.new_password?.message}
                  {...pwdForm.register('new_password')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  error={pwdForm.formState.errors.confirm_password?.message}
                  {...pwdForm.register('confirm_password')}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => { setChangingPwd(false); pwdForm.reset() }}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={pwdForm.formState.isSubmitting}>
                  Salvar senha
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
