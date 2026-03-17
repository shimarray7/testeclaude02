'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User, Agency } from '@/types'

interface AuthState {
  supabaseUser: SupabaseUser | null
  profile: User | null
  agency: Agency | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    supabaseUser: null,
    profile: null,
    agency: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    async function loadUser(supabaseUser: SupabaseUser | null) {
      if (!supabaseUser) {
        setState({ supabaseUser: null, profile: null, agency: null, loading: false })
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*, agencies(*)')
        .eq('id', supabaseUser.id)
        .single()

      setState({
        supabaseUser,
        profile: profile ?? null,
        agency: profile?.agencies ?? null,
        loading: false,
      })
    }

    supabase.auth.getUser().then(({ data: { user } }) => loadUser(user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
