/**
 * サイト設定（site_config テーブル）
 * 管理者のみ編集可能（RLS で制御）
 */

import { getSupabase } from '~/shared/lib/supabase'

const GITHUB_REPO_URL_REGEX = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/
const VALUE_MAX_LENGTH = 500

export function validateGithubRepoUrl(value: string): { valid: boolean; error?: string } {
  if (value === '') return { valid: true }
  if (value.length > VALUE_MAX_LENGTH) {
    return { valid: false, error: `500文字以内で入力してください` }
  }
  if (!GITHUB_REPO_URL_REGEX.test(value)) {
    return {
      valid: false,
      error: 'https://github.com/{owner}/{repo} の形式で入力してください',
    }
  }
  return { valid: true }
}

export async function getGithubRepoUrl(): Promise<string> {
  const supabase = getSupabase()
  if (!supabase) return ''
  const { data } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'github_repo_url')
    .maybeSingle()
  return (data?.value as string) ?? ''
}

export async function setGithubRepoUrl(url: string): Promise<{ success: boolean; error?: string }> {
  const validation = validateGithubRepoUrl(url)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { success: false, error: 'Supabase が設定されていません' }
  }

  const { error } = await supabase
    .from('site_config')
    .upsert(
      {
        key: 'github_repo_url',
        value: url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}
