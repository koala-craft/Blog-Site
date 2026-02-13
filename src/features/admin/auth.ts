import type { User, Session } from '@supabase/supabase-js'
import { getSupabase } from '~/shared/lib/supabase'

export async function signInWithGitHub(redirectTo?: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error('Supabase is not configured')
    return
  }
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectTo ?? `${url}/admin`,
    },
  })
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  return { user: session.user, session }
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { data } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
