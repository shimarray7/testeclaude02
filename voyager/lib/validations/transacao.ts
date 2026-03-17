import { z } from 'zod'

export const transacaoSchema = z.object({
  type:        z.enum(['income', 'expense', 'refund'] as const, { error: 'Tipo obrigatório' }),
  status:      z.enum(['pending', 'paid', 'overdue', 'cancelled'] as const).default('pending'),
  amount:      z.coerce.number().positive('Valor deve ser positivo'),
  description: z.string().min(3, 'Descrição obrigatória'),
  due_date:    z.string().optional(),
  paid_at:     z.string().optional(),
  booking_id:  z.string().uuid().optional().or(z.literal('')),
  category:    z.string().optional(),
  notes:       z.string().optional(),
})

export const marcarPagoSchema = z.object({
  paid_at: z.string().min(1, 'Data de pagamento obrigatória'),
})

export type TransacaoInput = z.infer<typeof transacaoSchema>
export type MarcarPagoInput = z.infer<typeof marcarPagoSchema>
