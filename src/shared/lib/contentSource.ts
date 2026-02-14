/**
 * コンテンツ取得元の判定（サーバー用）
 * site_config から GitHub URL を取得し、使用するかローカルにフォールバックするか判定
 */

import { getSupabase } from './supabase'
import { isValidGithubRepoUrl } from './github'

export async function getGithubRepoUrlForServer(): Promise<string> {
  const supabase = getSupabase()
  if (!supabase) return ''
  const { data } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'github_repo_url')
    .maybeSingle()
  const url = (data?.value as string) ?? ''
  if (!isValidGithubRepoUrl(url)) return ''
  return url
}

export async function getZennUsernameForServer(): Promise<string> {
  const supabase = getSupabase()
  if (!supabase) return ''
  const { data } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'zenn_username')
    .maybeSingle()
  const value = (data?.value as string) ?? ''
  return value.trim()
}
