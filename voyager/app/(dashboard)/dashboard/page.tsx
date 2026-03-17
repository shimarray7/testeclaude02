'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, PlaneTakeoff, Users, CheckSquare,
  DollarSign, AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { BookingsByStatus } from '@/components/dashboard/BookingsByStatus'
import { RecentBookings } from '@/components/dashboard/RecentBookings'
import { UrgentTasks } from '@/components/dashboard/UrgentTasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardData {
  kpis: {
    total_bookings: number
    new_bookings: number
    confirmed_bookings: number
    total_clients: number
    pending_tasks: number
    overdue_tasks: number
    revenue_period: number
  }
  bookings_by_status: Record<string, number>
  recent_bookings: unknown[]
  urgent_tasks: unknown[]
  chart_data: { date: string; income: number; expense: number; result: number }[]
  period_days: number
  role: string
}

const PERIODS = [
  { value: '7',  label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
]

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod]   = useState('30')

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch(`/api/dashboard?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const canSeeFinancials = data?.role !== 'atendente'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 h-9 text-sm border-l first:border-l-0 border-gray-300 transition-colors ${
                period === p.value
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Reservas"
            value={data.kpis.total_bookings}
            sub={`+${data.kpis.new_bookings} nos últimos ${period} dias`}
            icon={PlaneTakeoff}
            color="blue"
          />
          <KpiCard
            label="Clientes"
            value={data.kpis.total_clients}
            sub={`${data.kpis.confirmed_bookings} reservas confirmadas`}
            icon={Users}
            color="purple"
          />
          <KpiCard
            label="Tarefas pendentes"
            value={data.kpis.pending_tasks}
            sub={data.kpis.overdue_tasks > 0 ? `${data.kpis.overdue_tasks} vencida${data.kpis.overdue_tasks > 1 ? 's' : ''}` : 'Sem vencidas'}
            icon={data.kpis.overdue_tasks > 0 ? AlertCircle : CheckSquare}
            color={data.kpis.overdue_tasks > 0 ? 'red' : 'green'}
          />
          {canSeeFinancials ? (
            <KpiCard
              label={`Receita (${period}d)`}
              value={formatCurrency(data.kpis.revenue_period)}
              sub="transações pagas no período"
              icon={DollarSign}
              color="green"
            />
          ) : (
            <KpiCard
              label="Confirmadas"
              value={data.kpis.confirmed_bookings}
              sub="reservas ativas"
              icon={PlaneTakeoff}
              color="green"
            />
          )}
        </div>
      ) : null}

      {/* Charts row */}
      {canSeeFinancials && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-52 w-full rounded-lg" />
              ) : (
                <RevenueChart data={data?.chart_data ?? []} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reservas por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full rounded-lg" />
              ) : (
                <BookingsByStatus data={data?.bookings_by_status ?? {}} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity row */}
      <div className={`grid grid-cols-1 ${canSeeFinancials ? 'lg:grid-cols-2' : ''} gap-5`}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PlaneTakeoff className="h-4 w-4 text-gray-400" />
              Reservas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : (
              <RecentBookings bookings={(data?.recent_bookings ?? []) as Parameters<typeof RecentBookings>[0]['bookings']} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-gray-400" />
              Tarefas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : (
              <UrgentTasks tasks={(data?.urgent_tasks ?? []) as Parameters<typeof UrgentTasks>[0]['tasks']} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
