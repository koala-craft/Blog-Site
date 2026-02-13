/**
 * GitHub API によるコンテンツ取得
 * SSRF 対策: URL は呼び出し元で検証済みであること
 */

const GITHUB_API = 'https://api.github.com'
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

  const res = await fetch(
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

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  )
  if (!res.ok) return null

  const data = (await res.json()) as GitHubFile
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8')
  }
  if (data.download_url) {
    const raw = await fetch(data.download_url)
    if (raw.ok) return raw.text()
  }
  return null
}

export async function fetchRawFile(downloadUrl: string): Promise<string | null> {
  // SSRF 対策: raw.githubusercontent.com のみ許可
  if (!downloadUrl.startsWith('https://raw.githubusercontent.com/')) return null

  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined
  const headers: Record<string, string> = { ...GITHUB_HEADERS }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(downloadUrl, { headers })
  if (!res.ok) return null
  return res.text()
}
