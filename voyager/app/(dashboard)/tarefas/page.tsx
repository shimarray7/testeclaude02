import { CheckSquare } from 'lucide-react'

export default function TarefasPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
      </div>
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <CheckSquare className="mx-auto h-10 w-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Módulo de Tarefas</p>
        <p className="text-sm text-gray-400 mt-1">Será implementado em módulo futuro.</p>
      </div>
    </div>
  )
}
