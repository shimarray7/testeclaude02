import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Placeholder — Dashboard module will be built in a later iteration */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <LayoutDashboard className="mx-auto h-10 w-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Dashboard em construção</p>
        <p className="text-sm text-gray-400 mt-1">
          KPIs, gráficos e atividade recente serão exibidos aqui.
        </p>
      </div>
    </div>
  )
}
