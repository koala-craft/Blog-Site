/**
 * GitHub API によるコンテンツ取得
 * SSRF 対策: URL は呼び出し元で検証済みであること
 */

const GITHUB_API = 'https://api.github.com'
const FETCH_TIMEOUT_MS = 20_000

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = FETCH_TIMEOUT_MS, ...init } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}
const GITHUB_REPO_URL_REGEX = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/

export function isValidGithubRepoUrl(url: string): boolean {
  return url !== '' && GITHUB_REPO_URL_REGEX.test(url)
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/?$/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

interface GitHubFile {
  name: string
  path: string
  type: string
  download_url: string | null
  content?: string
  encoding?: string
}

const GITHUB_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'Obsidian-Log (https://github.com)',
}

export async function fetchDirectory(
  owner: string,
  repo: string,
  path: string
): Promise<{ name: string; download_url: string }[]> {
  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined
  const headers: Record<string, string> = { ...GITHUB_HEADERS }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetchWithTimeout(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  )
  if (!res.ok) return []

  const data = (await res.json()) as GitHubFile | GitHubFile[]
  const items = Array.isArray(data) ? data : [data]
  return items
    .filter((f) => f.type === 'file' && f.download_url)
    .map((f) => ({ name: f.name, download_url: f.download_url! }))
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined
  const headers: Record<string, string> = { ...GITHUB_HEADERS }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetchWithTimeout(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  )
  if (!res.ok) return null

  const data = (await res.json()) as GitHubFile
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8')
  }
  if (data.download_url) {
    const raw = await fetchWithTimeout(data.download_url, { headers })
    if (raw.ok) return raw.text()
  }
  return null
}

export async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  token: string
): Promise<string | null> {
  const headers: Record<string, string> = {
    ...GITHUB_HEADERS,
    Authorization: `Bearer ${token}`,
  }
  const res = await fetchWithTimeout(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  )
  if (!res.ok) return null
  const data = (await res.json()) as { sha?: string }
  return data.sha ?? null
}

export async function updateFileOnGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  token: string,
  sha?: string | null
): Promise<{ success: boolean; error?: string }> {
  const headers: Record<string, string> = {
    ...GITHUB_HEADERS,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
  }
  if (sha) body.sha = sha

  const res = await fetchWithTimeout(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { method: 'PUT', headers, body: JSON.stringify(body) }
  )

  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    return { success: false, error: err.message ?? res.statusText }
  }
  return { success: true }
}

export async function deleteFileOnGitHub(
  owner: string,
  repo: string,
  path: string,
  message: string,
  token: string,
  sha: string
): Promise<{ success: boolean; error?: string }> {
  const headers: Record<string, string> = {
    ...GITHUB_HEADERS,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  const body = { message, sha }

  const res = await fetchWithTimeout(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { method: 'DELETE', headers, body: JSON.stringify(body) }
  )

  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    return { success: false, error: err.message ?? res.statusText }
  }
  return { success: true }
}

export async function fetchRawFile(downloadUrl: string): Promise<string | null> {
  // SSRF 対策: raw.githubusercontent.com のみ許可
  if (!downloadUrl.startsWith('https://raw.githubusercontent.com/')) return null

  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined
  const headers: Record<string, string> = { ...GITHUB_HEADERS }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetchWithTimeout(downloadUrl, { headers })
  if (!res.ok) return null
  return res.text()
}
