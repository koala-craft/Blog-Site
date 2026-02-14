import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabase, resetSupabaseClient } from '~/shared/lib/supabase'
import type { CheckAdminResult } from './auth'
import {
  checkIsAdmin,
  clearAdminCache,
  setAdminCache,
  signInWithGitHub,
  signOut,
} from './auth'
import {
  AUTH_TIMEOUT_MS,
  INIT_DELAY_MS,
  OAUTH_CALLBACK_DELAY_MS,
  OAUTH_CALLBACK_RETRY_COUNT,
  resolveAdminState,
  VISIBILITY_DELAY_MS,
} from './authFlow'

export type AuthState = {
  user: User | null
  isAdmin: boolean
  loading: boolean
  /** OAuth コールバック処理中（セッション確定を待っている間はログイン画面を出さない） */
  oauthCallbackPending: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminChecked, setAdminChecked] = useState(false)
  const [oauthCallbackPending, setOauthCallbackPending] = useState(() => {
    if (typeof window === 'undefined') return false
    return /[#&](access_token|refresh_token|code)=/.test(
      window.location.hash + window.location.search
    )
  })

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    const init = async () => {
      try {
        await new Promise((r) => setTimeout(r, INIT_DELAY_MS))
        const authTimeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), AUTH_TIMEOUT_MS)
        )

        const run = async () => {
          const isOAuthCallback =
            typeof window !== 'undefined' &&
            /[#&](access_token|refresh_token|code)=/.test(
              window.location.hash + window.location.search
            )

          let { data: { session } } = await supabase.auth.getSession()

          if (!session?.user && isOAuthCallback) {
            for (let i = 0; i < OAUTH_CALLBACK_RETRY_COUNT; i++) {
              await new Promise((r) => setTimeout(r, OAUTH_CALLBACK_DELAY_MS))
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
            if (isOAuthCallback) {
              setOauthCallbackPending(true)
              setTimeout(() => setOauthCallbackPending(false), 5_000)
            }
            setLoading(false)
            return
          }

          setOauthCallbackPending(false)
          setUser(session.user)
          const { isAdmin: admin } = await resolveAdminState(supabase, session, {
            useCache: true,
          })
          setIsAdmin(admin)
          setAdminChecked(true)
          setLoading(false)

          if (admin) {
            supabase.auth
              .refreshSession()
              .then(({ data: { session: r } }) => {
                const s = r ?? session
                return checkIsAdmin(s?.access_token ?? '')
              })
              .then((res: CheckAdminResult) => {
                if (res.ok && res.isAdmin) setAdminCache(session.user.id, true)
              })
              .catch((e) => {
                if (import.meta.env.DEV) console.error('[Auth] background refresh failed', e)
              })
          }
        }

        await Promise.race([run(), authTimeoutPromise])
      } catch (e) {
        if (import.meta.env.DEV) console.error('[Auth] init failed', e)
        setOauthCallbackPending(false)
        setUser(null)
        setIsAdmin(false)
        setAdminChecked(true)
        setLoading(false)
      }
    }

    init()

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        resetSupabaseClient()
        const freshSupabase = getSupabase()
        if (!freshSupabase) return
        await new Promise((r) => setTimeout(r, VISIBILITY_DELAY_MS))
        const { data: { session } } = await freshSupabase.auth.getSession()
        if (!session?.user) return
        setUser(session.user)
        const { isAdmin: admin } = await resolveAdminState(freshSupabase, session, {
          useCache: true,
        })
        setIsAdmin(admin)
        setAdminChecked(true)
      } catch (e) {
        if (import.meta.env.DEV) console.error('[Auth] visibilitychange failed', e)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          if (import.meta.env.DEV) {
            console.log('[Auth] トークン自動リフレッシュ完了', {
              expiresAt: session?.expires_at
                ? new Date(session.expires_at * 1000).toLocaleString()
                : null,
            })
          }
          return
        }
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            setOauthCallbackPending(false)
            setUser(session.user)
            setAdminChecked(false)
            const supabase = getSupabase()
            const { isAdmin: admin } = supabase
              ? await Promise.race([
                  resolveAdminState(supabase, session, { useCache: false }),
                  new Promise<{ isAdmin: boolean }>((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), AUTH_TIMEOUT_MS)
                  ),
                ])
              : { isAdmin: false }
            if (admin) setAdminCache(session.user.id, true)
            setIsAdmin(admin)
            setAdminChecked(true)
          } else if (event === 'SIGNED_OUT') {
            clearAdminCache()
            setUser(null)
            setIsAdmin(false)
            setAdminChecked(true)
          }
        } catch (e) {
          if (import.meta.env.DEV) console.error('[Auth] onAuthStateChange failed', e)
          setIsAdmin(false)
          setAdminChecked(true)
        }
        setLoading(false)
      }
    )

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      subscription.unsubscribe()
    }
  }, [])

  const effectiveLoading =
    loading ||
    oauthCallbackPending ||
    (user !== null && !adminChecked)

  return {
    user,
    isAdmin,
    loading: effectiveLoading,
    oauthCallbackPending,
    signIn: () => signInWithGitHub(),
    signOut,
  }
}
