/**
 * GitHub raw 画像のプロキシ（プライベートリポジトリ対応）
 * GET /api/blog-assets/proxy?url=...
 */

import { createFileRoute } from '@tanstack/react-router'
import { fetchRawFileBinary, parseRepoUrl } from '~/shared/lib/github'
import { getGithubRepoUrlForServer } from '~/shared/lib/contentSource'

const RAW_PREFIX = 'https://raw.githubusercontent.com/'

/** owner/repo が一致し、かつ blog/assets/ 配下の画像のみ許可（他ファイルの漏洩防止） */
function isAllowedUrl(url: string, allowedOwner: string, allowedRepo: string): boolean {
  if (!url.startsWith(RAW_PREFIX)) return false
  const path = url.slice(RAW_PREFIX.length)
  const parts = path.split('/')
  if (parts.length < 6) return false // owner/repo/branch/blog/assets/...
  const [owner, repo, , ...rest] = parts
  const filePath = rest.join('/')
  // パストラバーサル対策: .. を含むパスを拒否
  if (filePath.includes('..')) return false
  const allowedExt = /\.(png|jpg|jpeg|gif|webp)$/i
  return (
    owner === allowedOwner &&
    repo === allowedRepo &&
    filePath.startsWith('blog/assets/') &&
    allowedExt.test(filePath)
  )
}

export const Route = createFileRoute('/api/blog-assets/proxy')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const targetUrl = url.searchParams.get('url')
        if (!targetUrl) {
          return new Response('Missing url', { status: 400 })
        }

        let decodedUrl: string
        try {
          decodedUrl = decodeURIComponent(targetUrl)
        } catch {
          return new Response('Invalid url', { status: 400 })
        }

        const githubUrl = await getGithubRepoUrlForServer()
        const parsed = parseRepoUrl(githubUrl)
        if (!parsed || !isAllowedUrl(decodedUrl, parsed.owner, parsed.repo)) {
          return new Response('Forbidden', { status: 403 })
        }

        const buffer = await fetchRawFileBinary(decodedUrl)
        if (!buffer) {
          return new Response('Not Found', { status: 404 })
        }

        const ext = decodedUrl.split('.').pop()?.toLowerCase() ?? 'png'
        const mime: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          webp: 'image/webp',
        }
        const contentType = mime[ext] ?? 'image/png'

        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
