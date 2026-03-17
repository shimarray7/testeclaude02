import { z } from 'zod'

export const tarefaSchema = z.object({
  title:       z.string().min(2, 'Título obrigatório'),
  description: z.string().optional(),
  status:      z.enum(['todo', 'in_progress', 'done'] as const).default('todo'),
  priority:    z.enum(['low', 'medium', 'high'] as const).default('medium'),
  assigned_to: z.string().uuid('Selecione um responsável').optional().or(z.literal('')),
  booking_id:  z.string().uuid().optional().or(z.literal('')),
  due_date:    z.string().optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done'] as const),
})

export type TarefaInput = z.infer<typeof tarefaSchema>
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
