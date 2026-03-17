import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Mail, Phone, Calendar, Globe, FileText, PlaneTakeoff } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/reservas/StatusBadge'
import { DeleteClienteButton } from '@/components/clientes/DeleteClienteButton'
import type { BookingStatus } from '@/types'

export default async function ClienteDetailPage({
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

  const { data: cliente, error } = await supabase
    .from('clients')
    .select(`
      *,
      bookings(
        id, reference_code, destination, status, departure_date, total_price
      )
    `)
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !cliente) notFound()

  const canDelete = profile.role === 'admin' || profile.role === 'gestor'

  const totalSpent = (cliente.bookings ?? [])
    .filter((b: { status: string }) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum: number, b: { total_price: number }) => sum + b.total_price, 0)

  const activeBookings = (cliente.bookings ?? []).filter(
    (b: { status: string }) => ['draft', 'pending_payment', 'confirmed'].includes(b.status)
  )

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{cliente.full_name}</h1>
            {cliente.nationality && (
              <p className="text-sm text-gray-500 mt-0.5">{cliente.nationality}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clientes/${cliente.id}/editar`}>
            <button className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
          </Link>
          {canDelete && (
            <DeleteClienteButton
              clienteId={cliente.id}
              clienteName={cliente.full_name}
              hasActiveBookings={activeBookings.length > 0}
            />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total em reservas"
          value={String((cliente.bookings ?? []).length)}
          sub="reservas criadas"
        />
        <StatCard
          label="Volume gerado"
          value={formatCurrency(totalSpent)}
          sub="confirmadas + concluídas"
        />
        <StatCard
          label="Reservas ativas"
          value={String(activeBookings.length)}
          sub="em aberto"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-1 space-y-5">
          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {cliente.email ? (
                <a
                  href={`mailto:${cliente.email}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  {cliente.email}
                </a>
              ) : (
                <p className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" /> —
                </p>
              )}
              {cliente.phone ? (
                <a
                  href={`tel:${cliente.phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  {cliente.phone}
                </a>
              ) : (
                <p className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-4 w-4" /> —
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dados pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {cliente.birth_date && (
                <InfoRow icon={Calendar} label="Nascimento" value={formatDate(cliente.birth_date)} />
              )}
              {cliente.cpf && (
                <InfoRow icon={FileText} label="CPF" value={cliente.cpf} mono />
              )}
              {cliente.nationality && (
                <InfoRow icon={Globe} label="Nacionalidade" value={cliente.nationality} />
              )}
            </CardContent>
          </Card>

          {/* Passaporte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Passaporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {cliente.passport_number ? (
                <>
                  <p className="font-mono font-semibold text-gray-800">{cliente.passport_number}</p>
                  {cliente.passport_expiry && (
                    <p className="text-xs text-gray-500">
                      Validade:{' '}
                      <PassportExpiry expiry={cliente.passport_expiry} />
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-400">Não informado</p>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {cliente.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-line">{cliente.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: reservas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <PlaneTakeoff className="h-4 w-4 text-gray-400" />
                  Histórico de Reservas
                </CardTitle>
                <Link href={`/reservas/nova?client_id=${cliente.id}`}>
                  <button className="text-xs text-blue-600 hover:underline">+ Nova reserva</button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {(cliente.bookings ?? []).length === 0 ? (
                <div className="py-8 text-center">
                  <PlaneTakeoff className="mx-auto h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">Nenhuma reserva encontrada.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(cliente.bookings as {
                    id: string
                    reference_code: string
                    destination: string
                    status: string
                    departure_date: string
                    total_price: number
                  }[]).map((b) => (
                    <Link
                      key={b.id}
                      href={`/reservas/${b.id}`}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold text-blue-600">{b.reference_code}</p>
                        <p className="text-sm font-medium text-gray-800 mt-0.5">{b.destination}</p>
                        <p className="text-xs text-gray-400">{formatDate(b.departure_date)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={b.status as BookingStatus} />
                        <p className="text-sm font-semibold text-gray-700">{formatCurrency(b.total_price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className={`font-medium text-gray-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function PassportExpiry({ expiry }: { expiry: string }) {
  const today   = new Date()
  const exp     = new Date(expiry)
  const diffMs  = exp.getTime() - today.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const label =
    diffDays < 0   ? `Vencido em ${formatDate(expiry)}` :
    diffDays < 180 ? `${formatDate(expiry)} (atenção: vence em breve)` :
    formatDate(expiry)

  const color =
    diffDays < 0   ? 'text-red-600 font-semibold' :
    diffDays < 180 ? 'text-amber-600 font-semibold' :
    'text-gray-800'

  return <span className={color}>{label}</span>
}
