export type UserRole = 'admin' | 'gestor' | 'atendente'
export type AgencyPlan = 'free' | 'starter' | 'pro'

export type BookingStatus = 'draft' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed'
export type TransactionType = 'income' | 'expense' | 'refund'
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'pix' | 'cartao' | 'boleto' | 'transferencia'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Agency {
  id: string
  name: string
  slug: string
  plan: AgencyPlan
  logo_url: string | null
  phone: string | null
  email: string | null
  cnpj: string | null
  created_at: string
}

export interface User {
  id: string
  agency_id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
}

export interface Client {
  id: string
  agency_id: string
  full_name: string
  email: string | null
  phone: string | null
  cpf: string | null
  birth_date: string | null
  passport_number: string | null
  passport_expiry: string | null
  notes: string | null
  tags: string[]
  created_by: string
  created_at: string
}

export interface Booking {
  id: string
  agency_id: string
  client_id: string
  assigned_to: string
  reference_code: string
  status: BookingStatus
  destination: string
  departure_date: string
  return_date: string | null
  pax_count: number
  total_price: number
  cost_price: number | null
  notes: string | null
  cancelled_reason: string | null
  created_at: string
  updated_at: string
  // joins
  client?: Client
  assigned_user?: User
}

export interface BookingHistoryEntry {
  from_status: BookingStatus
  to_status: BookingStatus
  changed_by: string
  changed_at: string
  note?: string
}

export interface Transaction {
  id: string
  agency_id: string
  booking_id: string | null
  type: TransactionType
  status: TransactionStatus
  amount: number
  due_date: string | null
  paid_at: string | null
  payment_method: PaymentMethod | null
  description: string | null
  created_by: string
  created_at: string
}

export interface Task {
  id: string
  agency_id: string
  booking_id: string | null
  assigned_to: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  created_at: string
  // joins
  assigned_user?: User
  booking?: Pick<Booking, 'id' | 'reference_code' | 'destination'>
}
