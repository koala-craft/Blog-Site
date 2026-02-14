/**
 * config.json の取得・更新 API（サーバー関数）
 * config モジュールはハンドラー内で動的 import（クライアントバンドルに fs を含めない）
 */

import { createServerFn } from '@tanstack/react-start'
import type { AppConfig } from '~/shared/lib/config'
import { getSupabase } from '~/shared/lib/supabase'
import {
  parseRepoUrl,
  isValidGithubRepoUrl,
  getFileSha,
  updateFileOnGitHub,
} from '~/shared/lib/github'

const CONFIG_PATH = '.obsidian-log/config.json'

function getGitHubUsername(user: { user_metadata?: Record<string, unknown> }): string | null {
  const meta = user.user_metadata
  if (!meta) return null
  const name = (meta.user_name ?? meta.user_login ?? meta.login) as string | undefined
  return typeof name === 'string' ? name : null
}

export const getConfig = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AppConfig> => {
    const { getConfigForServer } = await import('~/shared/lib/config')
    return getConfigForServer()
  }
)

export type SetConfigInput = {
  accessToken: string
  providerToken?: string
  github_repo_url: string
  zenn_username: string
  admins: string[]
}

export const setConfig = createServerFn({ method: 'POST' })
  .inputValidator((data: SetConfigInput) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase が設定されていません' }

    const { data: { user }, error } = await supabase.auth.getUser(data.accessToken)
    if (error || !user) return { success: false, error: '認証が必要です' }

    const username = getGitHubUsername(user)
    if (!username) return { success: false, error: 'GitHub ユーザー名を取得できません' }

    const { isAdminByUsername } = await import('~/shared/lib/config')
    const isAdmin = await isAdminByUsername(username)
    if (!isAdmin) return { success: false, error: '管理者権限がありません' }

    const { getConfigForServer } = await import('~/shared/lib/config')
    let repoUrl = data.github_repo_url
    if (!repoUrl || !isValidGithubRepoUrl(repoUrl)) {
      const current = await getConfigForServer()
      repoUrl = current.github_repo_url
    }
    if (!repoUrl || !isValidGithubRepoUrl(repoUrl)) {
      const envUrl = process.env.GITHUB_REPO_URL ?? ''
      if (isValidGithubRepoUrl(envUrl)) repoUrl = envUrl
    }
    if (!repoUrl || !isValidGithubRepoUrl(repoUrl)) {
      return { success: false, error: 'GitHub リポジトリ URL を設定してください' }
    }

    const parsed = parseRepoUrl(repoUrl)
    if (!parsed) return { success: false, error: 'リポジトリ URL を解析できません' }

    const token = data.providerToken ?? process.env.GITHUB_TOKEN
    if (!token) return { success: false, error: 'GitHub トークンが必要です。ログインし直すか、GITHUB_TOKEN を設定してください' }

    const config: AppConfig = {
      github_repo_url: repoUrl,
      zenn_username: data.zenn_username.trim(),
      admins: Array.isArray(data.admins) ? data.admins.filter((a): a is string => typeof a === 'string') : [],
    }

    const content = JSON.stringify(config, null, 2)
    const sha = await getFileSha(parsed.owner, parsed.repo, CONFIG_PATH, token)

    return updateFileOnGitHub(
      parsed.owner,
      parsed.repo,
      CONFIG_PATH,
      content,
      'chore: update obsidian-log config',
      token,
      sha
    )
  })
