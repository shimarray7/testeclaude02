import { PlaneTakeoff } from 'lucide-react'

export default function ReservasPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <PlaneTakeoff className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
      </div>
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <PlaneTakeoff className="mx-auto h-10 w-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Módulo de Reservas</p>
        <p className="text-sm text-gray-400 mt-1">Será implementado no próximo módulo.</p>
      </div>
    </div>
  )
}
