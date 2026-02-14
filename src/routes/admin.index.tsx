import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">管理ダッシュボード</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/admin/blog"
          className="block p-6 bg-zinc-800 rounded hover:bg-zinc-700 transition"
        >
          <h2 className="text-xl font-semibold mb-2">ブログ</h2>
          <p className="text-zinc-400 text-sm">ブログ記事の作成・編集・削除</p>
        </Link>
        <Link
          to="/admin/settings"
          className="block p-6 bg-zinc-800 rounded hover:bg-zinc-700 transition"
        >
          <h2 className="text-xl font-semibold mb-2">サイト設定</h2>
          <p className="text-zinc-400 text-sm">GitHub URL 等の設定</p>
        </Link>
      </div>
    </div>
  )
}
