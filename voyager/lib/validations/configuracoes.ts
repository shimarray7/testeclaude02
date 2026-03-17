import { z } from 'zod'

export const agenciaSchema = z.object({
  name:     z.string().min(2, 'Nome da agência obrigatório'),
  email:    z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone:    z.string().optional(),
  website:  z.string().url('URL inválida').optional().or(z.literal('')),
  address:  z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
})

export const perfilSchema = z.object({
  full_name:   z.string().min(2, 'Nome obrigatório'),
  phone:       z.string().optional(),
  avatar_url:  z.string().url().optional().or(z.literal('')),
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(6, 'Senha atual obrigatória'),
  new_password:     z.string().min(8, 'Mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password'],
})

export const inviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  role:  z.enum(['admin', 'gestor', 'atendente'] as const, { error: 'Selecione um papel' }),
})

export const updateRoleSchema = z.object({
  role:      z.enum(['admin', 'gestor', 'atendente'] as const).optional(),
  is_active: z.boolean().optional(),
})

export type AgenciaInput       = z.infer<typeof agenciaSchema>
export type PerfilInput        = z.infer<typeof perfilSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type InviteInput        = z.infer<typeof inviteSchema>
export type UpdateRoleInput    = z.infer<typeof updateRoleSchema>
