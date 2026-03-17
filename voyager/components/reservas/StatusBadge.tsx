import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types'

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'warning' | 'success' | 'destructive' }> = {
  draft:           { label: 'Rascunho',        variant: 'secondary' },
  pending_payment: { label: 'Aguard. Pagamento', variant: 'warning' },
  confirmed:       { label: 'Confirmada',       variant: 'success' },
  cancelled:       { label: 'Cancelada',        variant: 'destructive' },
  completed:       { label: 'Concluída',        variant: 'default' },
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, variant } = statusConfig[status] ?? { label: status, variant: 'secondary' }
  return <Badge variant={variant}>{label}</Badge>
}
