import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, MapPin, Calendar, Users, User, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'
import { StatusBadge } from '@/components/reservas/StatusBadge'
import { CancelarButton } from '@/components/reservas/CancelarButton'
import { StatusTransitionBar } from '@/components/reservas/StatusTransitionBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BookingStatus, BookingHistoryEntry } from '@/types'

export default async function ReservaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, email, phone, cpf, passport_number, passport_expiry),
      assigned_user:users!bookings_assigned_to_fkey(id, full_name),
      transactions(*),
      tasks(*, assigned_user:users!tasks_assigned_to_fkey(id, full_name))
    `)
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !booking) notFound()

  const canEditCancel = profile.role === 'admin' || profile.role === 'gestor'
  const canViewCostPrice = profile.role === 'admin' || profile.role === 'gestor'
  const history = (booking.history ?? []) as BookingHistoryEntry[]

  const margin = canViewCostPrice && booking.cost_price
    ? booking.total_price - booking.cost_price
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/reservas" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{booking.destination}</h1>
              <StatusBadge status={booking.status as BookingStatus} />
            </div>
            <p className="text-xs font-mono text-blue-600 mt-0.5">{booking.reference_code}</p>
          </div>
        </div>
        {canEditCancel && booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="flex gap-2">
            <Link href={`/reservas/${booking.id}/editar`}>
              <button className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            </Link>
            <CancelarButton
              bookingId={booking.id}
              referenceCode={booking.reference_code}
            />
          </div>
        )}
      </div>

      {/* Status transition */}
      {canEditCancel && booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <StatusTransitionBar
          bookingId={booking.id}
          currentStatus={booking.status as BookingStatus}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Detalhes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes da Viagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={MapPin} label="Destino" value={booking.destination} />
              <InfoRow
                icon={Calendar}
                label="Partida"
                value={formatDate(booking.departure_date)}
              />
              {booking.return_date && (
                <InfoRow
                  icon={Calendar}
                  label="Retorno"
                  value={formatDate(booking.return_date)}
                />
              )}
              <InfoRow
                icon={Users}
                label="Passageiros"
                value={`${booking.pax_count} pessoa${booking.pax_count > 1 ? 's' : ''}`}
              />
              <InfoRow
                icon={User}
                label="Responsável"
                value={booking.assigned_user?.full_name ?? '—'}
              />
            </CardContent>
          </Card>

          {/* Cliente */}
          {booking.client && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Link
                  href={`/clientes/${booking.client.id}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {booking.client.full_name}
                </Link>
                {booking.client.email && (
                  <p className="text-gray-600">{booking.client.email}</p>
                )}
                {booking.client.phone && (
                  <p className="text-gray-600">{booking.client.phone}</p>
                )}
                {booking.client.passport_number && (
                  <p className="text-gray-500 text-xs">
                    Passaporte: {booking.client.passport_number}
                    {booking.client.passport_expiry && ` (val. ${formatDate(booking.client.passport_expiry)})`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-line">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancelamento */}
          {booking.status === 'cancelled' && booking.cancelled_reason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-base text-red-700">Motivo do Cancelamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600">{booking.cancelled_reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Transações */}
          {canViewCostPrice && booking.transactions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {booking.transactions.map((t: Record<string, unknown>) => (
                  <div
                    key={t.id as string}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{String(t.description ?? '')}</p>
                      {Boolean(t.due_date) && (
                        <p className="text-xs text-gray-500">Vence: {formatDate(String(t.due_date))}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          t.status === 'paid' ? 'bg-green-100 text-green-700' :
                          t.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.status === 'paid' ? 'Pago' : t.status === 'overdue' ? 'Vencido' : 'Pendente'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(t.amount as number)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tarefas */}
          {booking.tasks?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tarefas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {booking.tasks.map((t: Record<string, unknown>) => (
                  <div
                    key={t.id as string}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                  >
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        t.status === 'done' ? 'bg-green-500' :
                        t.priority === 'high' ? 'bg-red-500' :
                        t.priority === 'medium' ? 'bg-amber-500' :
                        'bg-gray-400'
                      }`}
                    />
                    <p className={`flex-1 ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {String(t.title ?? '')}
                    </p>
                    {Boolean(t.due_date) && (
                      <p className="text-xs text-gray-400">{formatDate(String(t.due_date))}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: financeiro + histórico */}
        <div className="space-y-5">
          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Valor total</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(booking.total_price)}
                </span>
              </div>
              {canViewCostPrice && booking.cost_price && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Custo real</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(booking.cost_price)}
                    </span>
                  </div>
                  {margin !== null && (
                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                      <span className="text-sm text-gray-500">Margem</span>
                      <span className={`text-sm font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(margin)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Histórico de status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-gray-400">Sem histórico registrado.</p>
              ) : (
                <ol className="space-y-3">
                  {history.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        {i < history.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="font-medium text-gray-700">
                          {h.from_status ? `${h.from_status} → ${h.to_status}` : h.to_status}
                        </p>
                        {h.note && (
                          <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDateTime(h.changed_at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
