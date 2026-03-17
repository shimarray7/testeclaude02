import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from './DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*, agencies(name)')
    .eq('id', user.id)
    .single()

  // First login — user has no profile yet → finish onboarding
  if (!profile) {
    redirect('/onboarding')
  }

  return (
    <DashboardShell
      fullName={profile.full_name}
      role={profile.role}
      agencyName={profile.agencies?.name}
    >
      {children}
    </DashboardShell>
  )
}
