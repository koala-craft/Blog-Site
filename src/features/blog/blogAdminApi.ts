/**
 * ブログ CRUD API（管理者専用）
 * GitHub に直接書き込む。provider_token または GITHUB_TOKEN が必要
 */

import { createServerFn } from '@tanstack/react-start'
import { getSupabase } from '~/shared/lib/supabase'
import { getGithubRepoUrlForServer } from '~/shared/lib/contentSource'
import {
  parseRepoUrl,
  isValidGithubRepoUrl,
  getFileSha,
  updateFileOnGitHub,
  deleteFileOnGitHub,
} from '~/shared/lib/github'
import { validateSlug } from '~/shared/lib/slug'
import type { BlogPost } from './types'

const BLOG_DIR = 'blog'

function getGitHubUsername(user: { user_metadata?: Record<string, unknown> }): string | null {
  const meta = user.user_metadata
  if (!meta) return null
  const name = (meta.user_name ?? meta.user_login ?? meta.login) as string | undefined
  return typeof name === 'string' ? name : null
}

function buildFrontmatter(post: {
  title: string
  createdAt: string
  updatedAt: string
  tags: string[]
  visibility: 'public' | 'private'
}): string {
  const lines = [
    '---',
    `title: ${post.title}`,
    `createdAt: ${post.createdAt}`,
    `updatedAt: ${post.updatedAt}`,
    `tags: [${post.tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]`,
    `visibility: ${post.visibility}`,
    '---',
    '',
  ]
  return lines.join('\n')
}

function buildMarkdownContent(post: BlogPost): string {
  const front = buildFrontmatter(post)
  return front + (post.content ?? '')
}

export type CreateBlogPostInput = {
  accessToken: string
  providerToken?: string
  slug: string
  title: string
  content: string
  tags?: string[]
  visibility?: 'public' | 'private'
}

export const createBlogPost = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateBlogPostInput) => data)
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

    if (!validateSlug(data.slug)) {
      return { success: false, error: 'スラッグは英数字・ハイフン・アンダースコアのみ使用できます' }
    }

    const githubUrl = await getGithubRepoUrlForServer()
    if (!githubUrl || !isValidGithubRepoUrl(githubUrl)) {
      return { success: false, error: 'GitHub リポジトリ URL を設定してください' }
    }

    const parsed = parseRepoUrl(githubUrl)
    if (!parsed) return { success: false, error: 'リポジトリ URL を解析できません' }

    const token = data.providerToken ?? process.env.GITHUB_TOKEN
    if (!token) {
      return { success: false, error: 'GitHub トークンが必要です。ログインし直すか、GITHUB_TOKEN を設定してください' }
    }

    const now = new Date().toISOString().split('T')[0] ?? ''
    const post: BlogPost = {
      slug: data.slug,
      title: data.title.trim() || data.slug,
      content: data.content ?? '',
      createdAt: now,
      updatedAt: now,
      tags: Array.isArray(data.tags) ? data.tags : [],
      visibility: data.visibility === 'private' ? 'private' : 'public',
    }

    const content = buildMarkdownContent(post)
    const path = `${BLOG_DIR}/${data.slug}.md`

    return updateFileOnGitHub(
      parsed.owner,
      parsed.repo,
      path,
      content,
      `blog: add ${data.slug}`,
      token,
      undefined
    )
  })

export type UpdateBlogPostInput = {
  accessToken: string
  providerToken?: string
  slug: string
  title: string
  content: string
  tags?: string[]
  visibility?: 'public' | 'private'
}

export const updateBlogPost = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateBlogPostInput) => data)
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

    if (!validateSlug(data.slug)) {
      return { success: false, error: 'スラッグは英数字・ハイフン・アンダースコアのみ使用できます' }
    }

    const githubUrl = await getGithubRepoUrlForServer()
    if (!githubUrl || !isValidGithubRepoUrl(githubUrl)) {
      return { success: false, error: 'GitHub リポジトリ URL を設定してください' }
    }

    const parsed = parseRepoUrl(githubUrl)
    if (!parsed) return { success: false, error: 'リポジトリ URL を解析できません' }

    const token = data.providerToken ?? process.env.GITHUB_TOKEN
    if (!token) {
      return { success: false, error: 'GitHub トークンが必要です。ログインし直すか、GITHUB_TOKEN を設定してください' }
    }

    const path = `${BLOG_DIR}/${data.slug}.md`
    const sha = await getFileSha(parsed.owner, parsed.repo, path, token)
    if (!sha) return { success: false, error: '記事が見つかりません' }

    const { getBlogPost } = await import('./api')
    const existing = await getBlogPost({ data: { slug: data.slug } })
    const now = new Date().toISOString().split('T')[0] ?? ''

    const post: BlogPost = {
      slug: data.slug,
      title: data.title.trim() || data.slug,
      content: data.content ?? '',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      tags: Array.isArray(data.tags) ? data.tags : [],
      visibility: data.visibility === 'private' ? 'private' : 'public',
    }

    const content = buildMarkdownContent(post)

    return updateFileOnGitHub(
      parsed.owner,
      parsed.repo,
      path,
      content,
      `blog: update ${data.slug}`,
      token,
      sha
    )
  })

export type DeleteBlogPostInput = {
  accessToken: string
  providerToken?: string
  slug: string
}

export const deleteBlogPost = createServerFn({ method: 'POST' })
  .inputValidator((data: DeleteBlogPostInput) => data)
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

    if (!validateSlug(data.slug)) {
      return { success: false, error: 'スラッグが不正です' }
    }

    const githubUrl = await getGithubRepoUrlForServer()
    if (!githubUrl || !isValidGithubRepoUrl(githubUrl)) {
      return { success: false, error: 'GitHub リポジトリ URL を設定してください' }
    }

    const parsed = parseRepoUrl(githubUrl)
    if (!parsed) return { success: false, error: 'リポジトリ URL を解析できません' }

    const token = data.providerToken ?? process.env.GITHUB_TOKEN
    if (!token) {
      return { success: false, error: 'GitHub トークンが必要です。ログインし直すか、GITHUB_TOKEN を設定してください' }
    }

    const path = `${BLOG_DIR}/${data.slug}.md`
    const sha = await getFileSha(parsed.owner, parsed.repo, path, token)
    if (!sha) return { success: false, error: '記事が見つかりません' }

    return deleteFileOnGitHub(
      parsed.owner,
      parsed.repo,
      path,
      `blog: delete ${data.slug}`,
      token,
      sha
    )
  })
