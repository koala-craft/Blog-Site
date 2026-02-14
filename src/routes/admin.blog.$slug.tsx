import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { getBlogPost } from '~/features/blog/api'
import { updateBlogPost, deleteBlogPost } from '~/features/blog/blogAdminApi'
import { getSession } from '~/features/admin/auth'
import { BlogEditor, type BlogEditorMeta } from '~/features/blog/BlogEditor'

export const Route = createFileRoute('/admin/blog/$slug')({
  component: AdminBlogEdit,
  loader: async ({ params }) => {
    const post = await getBlogPost({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return { post }
  },
})

function AdminBlogEdit() {
  const { post: initialPost } = Route.useLoaderData()
  const [meta, setMeta] = useState<BlogEditorMeta>({
    title: initialPost.title,
    tags: initialPost.tags.join(', '),
    visibility: initialPost.visibility,
  })
  const [content, setContent] = useState(initialPost.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    setMeta({
      title: initialPost.title,
      tags: initialPost.tags.join(', '),
      visibility: initialPost.visibility,
    })
    setContent(initialPost.content)
  }, [initialPost])

  const handleSave = useCallback(async () => {
    setMessage(null)
    const session = await getSession()
    if (!session) {
      setMessage({ type: 'error', text: 'ログインが必要です' })
      return
    }

    setSaving(true)
    const result = await updateBlogPost({
      data: {
        accessToken: session.session.access_token,
        providerToken: session.session.provider_token ?? undefined,
        slug: initialPost.slug,
        title: meta.title.trim() || initialPost.slug,
        content,
        tags: meta.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        visibility: meta.visibility,
      },
    })
    setSaving(false)

    if (result.success) {
      setMessage({ type: 'success', text: '保存しました' })
    } else {
      setMessage({ type: 'error', text: result.error ?? '保存に失敗しました' })
    }
  }, [initialPost.slug, meta, content])

  const handleDelete = async () => {
    const session = await getSession()
    if (!session) return

    setDeleting(true)
    const result = await deleteBlogPost({
      data: {
        accessToken: session.session.access_token,
        providerToken: session.session.provider_token ?? undefined,
        slug: initialPost.slug,
      },
    })
    setDeleting(false)
    setShowDeleteConfirm(false)

    if (result.success) {
      window.location.href = '/admin/blog'
    } else {
      setMessage({ type: 'error', text: result.error ?? '削除に失敗しました' })
    }
  }

  return (
    <div className="-mx-4 -mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <h1 className="text-xl font-semibold text-zinc-200 truncate">
          編集: {initialPost.slug}
        </h1>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/blog/$slug"
            params={{ slug: initialPost.slug }}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            プレビュー
          </Link>
          <Link
            to="/admin/blog"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            一覧へ
          </Link>
        </div>
      </div>

      <BlogEditor
        meta={meta}
        onMetaChange={setMeta}
        content={content}
        onContentChange={setContent}
        onSave={handleSave}
        saving={saving}
        message={message}
        slugEditable={false}
        extraActions={
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={saving || deleting}
            className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 rounded-lg transition"
          >
            削除
          </button>
        }
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">記事を削除しますか？</h3>
            <p className="text-zinc-400 text-sm mb-4">
              「{initialPost.title}」を削除すると元に戻せません。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded transition"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
