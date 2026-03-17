import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DRE {
  receitas_realizadas: number
  receitas_previstas:  number
  despesas_realizadas: number
  despesas_previstas:  number
  reembolsos:          number
  resultado_realizado: number
  resultado_previsto:  number
}

export function DRESummary({ dre }: { dre: DRE }) {
  const cards = [
    {
      label:    'Receitas realizadas',
      value:    dre.receitas_realizadas,
      sub:      `+ ${formatCurrency(dre.receitas_previstas)} previsto`,
      icon:     TrendingUp,
      color:    'text-green-600',
      bg:       'bg-green-50',
      border:   'border-green-200',
      iconBg:   'bg-green-100',
    },
    {
      label:    'Despesas realizadas',
      value:    dre.despesas_realizadas,
      sub:      `+ ${formatCurrency(dre.despesas_previstas)} previsto`,
      icon:     TrendingDown,
      color:    'text-red-600',
      bg:       'bg-red-50',
      border:   'border-red-200',
      iconBg:   'bg-red-100',
    },
    {
      label:    'Reembolsos',
      value:    dre.reembolsos,
      sub:      'pendentes + realizados',
      icon:     AlertCircle,
      color:    'text-amber-600',
      bg:       'bg-amber-50',
      border:   'border-amber-200',
      iconBg:   'bg-amber-100',
    },
    {
      label:    'Resultado realizado',
      value:    dre.resultado_realizado,
      sub:      `Previsto: ${formatCurrency(dre.resultado_previsto)}`,
      icon:     CheckCircle,
      color:    dre.resultado_realizado >= 0 ? 'text-blue-600' : 'text-red-600',
      bg:       dre.resultado_realizado >= 0 ? 'bg-blue-50' : 'bg-red-50',
      border:   dre.resultado_realizado >= 0 ? 'border-blue-200' : 'border-red-200',
      iconBg:   dre.resultado_realizado >= 0 ? 'bg-blue-100' : 'bg-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border ${card.border} ${card.bg} p-4 space-y-3`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-600">{card.label}</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${card.iconBg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${card.color}`}>
            {formatCurrency(card.value)}
          </p>
          <p className="text-xs text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
