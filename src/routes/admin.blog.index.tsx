import { createFileRoute, Link } from '@tanstack/react-router'
import { getAdminBlogPosts } from '~/features/blog/api'
import type { BlogPost } from '~/features/blog/types'

export const Route = createFileRoute('/admin/blog/')({
  component: AdminBlogIndex,
  loader: () => getAdminBlogPosts(),
})

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0] ?? dateStr
}

function AdminBlogIndex() {
  const posts = Route.useLoaderData()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">ブログ管理</h1>
        <Link
          to="/admin/blog/new"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded transition"
        >
          新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-500 mb-4">記事がありません。</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p: BlogPost) => (
            <li key={p.slug}>
              <Link
                to="/admin/blog/$slug"
                params={{ slug: p.slug }}
                className="flex items-center justify-between p-4 bg-zinc-800 rounded hover:bg-zinc-700 transition"
              >
                <div>
                  <span className="font-medium">{p.title}</span>
                  {p.visibility === 'private' && (
                    <span className="ml-2 text-xs text-zinc-500">(非公開)</span>
                  )}
                  {p.tags.length > 0 && (
                    <span className="ml-2 text-sm text-zinc-500">
                      {p.tags.join(', ')}
                    </span>
                  )}
                </div>
                <span className="text-sm text-zinc-500">{formatDate(p.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
