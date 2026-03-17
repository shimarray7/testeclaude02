import { z } from 'zod'

export const reservaSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  assigned_to: z.string().uuid('Selecione um responsável'),
  destination: z.string().min(2, 'Destino obrigatório'),
  departure_date: z.string().min(1, 'Data de partida obrigatória'),
  return_date: z.string().optional(),
  pax_count: z.coerce.number().int().min(1, 'Mínimo 1 passageiro'),
  total_price: z.coerce.number().positive('Valor deve ser positivo'),
  cost_price: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
})

export const cancelarReservaSchema = z.object({
  cancelled_reason: z.string().min(10, 'Informe o motivo do cancelamento (mínimo 10 caracteres)'),
})

export const statusTransitionSchema = z.object({
  status: z.enum(['draft', 'pending_payment', 'confirmed', 'completed', 'cancelled']),
  note: z.string().optional(),
})

export type ReservaInput = z.infer<typeof reservaSchema>
export type CancelarReservaInput = z.infer<typeof cancelarReservaSchema>
