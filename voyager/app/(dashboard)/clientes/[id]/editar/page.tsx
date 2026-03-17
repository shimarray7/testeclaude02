import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ClienteForm } from '@/components/clientes/ClienteForm'

export default async function EditarClientePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  const { data: cliente, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !cliente) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/clientes/${params.id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-sm text-gray-500">{cliente.full_name}</p>
        </div>
      </div>

      <ClienteForm
        mode="edit"
        clienteId={cliente.id}
        defaultValues={{
          full_name:       cliente.full_name,
          email:           cliente.email ?? '',
          phone:           cliente.phone ?? '',
          cpf:             cliente.cpf ?? '',
          passport_number: cliente.passport_number ?? '',
          passport_expiry: cliente.passport_expiry ?? '',
          birth_date:      cliente.birth_date ?? '',
          nationality:     cliente.nationality ?? '',
          notes:           cliente.notes ?? '',
        }}
      />
    </div>
  )
}
