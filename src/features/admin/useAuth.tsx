import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabase } from '~/shared/lib/supabase'
import { checkIsAdmin, signInWithGitHub, signOut } from './auth'

export type AuthState = {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminChecked, setAdminChecked] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    const init = async () => {
      const isOAuthCallback =
        typeof window !== 'undefined' &&
        /[#&](access_token|refresh_token|code)=/.test(
          window.location.hash + window.location.search
        )

      let { data: { session } } = await supabase.auth.getSession()

      // OAuth コールバック直後はハッシュ処理が完了するまで待つ（ログイン画面の一瞬表示を防ぐ）
      if (!session?.user && isOAuthCallback) {
        for (let i = 0; i < 5; i++) {
          await new Promise((r) => setTimeout(r, 200))
          const retry = await supabase.auth.getSession()
          if (retry.data.session?.user) {
            session = retry.data.session
            break
          }
        }
      }

      if (!session?.user) {
        setUser(null)
        setIsAdmin(false)
        setAdminChecked(true)
        setLoading(false)
        return
      }
      setUser(session.user)
      const admin = await checkIsAdmin(session.user.id)
      setIsAdmin(admin)
      setAdminChecked(true)
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          setAdminChecked(false)
          const admin = await checkIsAdmin(session.user.id)
          setIsAdmin(admin)
          setAdminChecked(true)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAdmin(false)
          setAdminChecked(true)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 管理者チェック完了まで loading 扱い（ForbiddenMessage の一瞬表示を防ぐ）
  const effectiveLoading = loading || (user !== null && !adminChecked)

  return {
    user,
    isAdmin,
    loading: effectiveLoading,
    signIn: () => signInWithGitHub(),
    signOut,
  }
}
