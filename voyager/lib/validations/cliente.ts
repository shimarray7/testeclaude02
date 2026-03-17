import { z } from 'zod'

export const clienteSchema = z.object({
  full_name:        z.string().min(2, 'Nome completo obrigatório'),
  email:            z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone:            z.string().optional(),
  cpf:              z.string().optional(),
  passport_number:  z.string().optional(),
  passport_expiry:  z.string().optional(),
  birth_date:       z.string().optional(),
  nationality:      z.string().optional(),
  notes:            z.string().optional(),
})

export type ClienteInput = z.infer<typeof clienteSchema>
