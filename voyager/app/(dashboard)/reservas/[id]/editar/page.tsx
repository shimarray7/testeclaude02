import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ReservaForm } from '@/components/reservas/ReservaForm'

export default async function EditarReservaPage({
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

  if (!profile || profile.role === 'atendente') {
    redirect('/reservas')
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !booking) notFound()

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    redirect(`/reservas/${params.id}`)
  }

  const canViewCostPrice = profile.role === 'admin' || profile.role === 'gestor'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/reservas/${params.id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar Reserva</h1>
          <p className="text-xs font-mono text-blue-600">{booking.reference_code}</p>
        </div>
      </div>

      <ReservaForm
        mode="edit"
        bookingId={booking.id}
        canViewCostPrice={canViewCostPrice}
        defaultValues={{
          client_id:      booking.client_id,
          assigned_to:    booking.assigned_to,
          destination:    booking.destination,
          departure_date: booking.departure_date,
          return_date:    booking.return_date ?? undefined,
          pax_count:      booking.pax_count,
          total_price:    booking.total_price,
          cost_price:     booking.cost_price ?? undefined,
          notes:          booking.notes ?? undefined,
        }}
      />
    </div>
  )
}
