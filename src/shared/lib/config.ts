/**
 * config.json（.obsidian-log/config.json）の読み書き
 * 環境変数 GITHUB_REPO_URL で指定したリポジトリから取得
 * 未設定時はローカル content/.obsidian-log/config.json を参照
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  parseRepoUrl,
  fetchFileContent,
  isValidGithubRepoUrl,
} from './github'

export interface AppConfig {
  github_repo_url: string
  zenn_username: string
  admins: string[]
}

const CONFIG_PATH = '.obsidian-log/config.json'

/** サーバー専用。ブラウザでは空文字を返す（process.cwd が存在しないため） */
function getContentDir(): string {
  if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
    return ''
  }
  return path.join(process.cwd(), 'content')
}

function getLocalConfigPath(): string {
  const contentDir = getContentDir()
  return contentDir ? path.join(contentDir, '.obsidian-log', 'config.json') : ''
}

const DEFAULT_CONFIG: AppConfig = {
  github_repo_url: '',
  zenn_username: '',
  admins: [],
}

function getRepoUrlFromEnv(): string {
  const url =
    (typeof process !== 'undefined' ? process.env?.GITHUB_REPO_URL : undefined) ?? ''
  return typeof url === 'string' && isValidGithubRepoUrl(url) ? url : ''
}

function parseConfigJson(raw: string): AppConfig {
  try {
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return {
      github_repo_url: typeof parsed.github_repo_url === 'string' ? parsed.github_repo_url : '',
      zenn_username: typeof parsed.zenn_username === 'string' ? parsed.zenn_username : '',
      admins: Array.isArray(parsed.admins)
        ? parsed.admins.filter((a): a is string => typeof a === 'string')
        : [],
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

function readLocalConfig(): AppConfig | null {
  const localPath = getLocalConfigPath()
  if (!localPath || !fs.existsSync(localPath)) return null
  try {
    const raw = fs.readFileSync(localPath, 'utf-8')
    return parseConfigJson(raw)
  } catch {
    return null
  }
}

/**
 * サーバー用: config.json を取得
 * 1. env GITHUB_REPO_URL から GitHub を取得
 * 2. 失敗時はローカル content/.obsidian-log/config.json
 */
export async function getConfigForServer(): Promise<AppConfig> {
  const envUrl = getRepoUrlFromEnv()
  if (envUrl) {
    const parsed = parseRepoUrl(envUrl)
    if (parsed) {
      try {
        const content = await fetchFileContent(
          parsed.owner,
          parsed.repo,
          CONFIG_PATH
        )
        if (content) return parseConfigJson(content)
      } catch {
        // fallback to local
      }
    }
  }

  const local = readLocalConfig()
  if (local) return local

  return { ...DEFAULT_CONFIG }
}

/**
 * サーバー用: GitHub リポジトリ URL を取得
 * config または env から
 */
export async function getGithubRepoUrlForServer(): Promise<string> {
  const config = await getConfigForServer()
  if (config.github_repo_url && isValidGithubRepoUrl(config.github_repo_url)) {
    return config.github_repo_url
  }
  return getRepoUrlFromEnv()
}

/**
 * サーバー用: Zenn ユーザー名を取得
 */
export async function getZennUsernameForServer(): Promise<string> {
  const config = await getConfigForServer()
  return config.zenn_username.trim()
}

/**
 * サーバー用: GitHub ユーザー名が管理者かチェック
 */
export async function isAdminByUsername(username: string): Promise<boolean> {
  if (!username || typeof username !== 'string') return false
  const config = await getConfigForServer()
  if (config.admins.length === 0) return false
  const normalized = username.trim().toLowerCase()
  return config.admins.some((a) => a.trim().toLowerCase() === normalized)
}
