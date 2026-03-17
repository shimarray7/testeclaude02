'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:           { label: 'Rascunho',         color: '#d1d5db' },
  pending_payment: { label: 'Aguard. Pagamento', color: '#f59e0b' },
  confirmed:       { label: 'Confirmada',        color: '#3b82f6' },
  completed:       { label: 'Concluída',         color: '#22c55e' },
  cancelled:       { label: 'Cancelada',         color: '#ef4444' },
}

interface BookingsByStatusProps {
  data: Record<string, number>
}

export function BookingsByStatus({ data }: BookingsByStatusProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({
      name:  STATUS_CONFIG[status]?.label ?? status,
      value: count,
      color: STATUS_CONFIG[status]?.color ?? '#9ca3af',
    }))

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Nenhuma reserva ainda
      </div>
    )
  }

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span className="text-xs text-gray-500">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
