import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { useAuth } from '~/features/admin/useAuth'
import { ForbiddenMessage } from '~/features/admin/ForbiddenMessage'
import { LoginForm } from '~/features/admin/LoginForm'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { user, isAdmin, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-zinc-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link to="/" className="text-zinc-500 hover:underline">
            ← サイトに戻る
          </Link>
        </nav>
        <LoginForm onSignIn={signIn} />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link to="/" className="text-zinc-500 hover:underline">
            ← サイトに戻る
          </Link>
        </nav>
        <ForbiddenMessage onSignOut={signOut} />
      </div>
    )
  }

  const displayName =
    user.user_metadata?.user_name ??
    user.user_metadata?.full_name ??
    user.email ??
    '管理者'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="mb-8 flex gap-4 items-center flex-wrap">
        <Link to="/admin" className="text-cyan-400 hover:underline">
          ダッシュボード
        </Link>
        <Link to="/admin/tasks" className="text-cyan-400 hover:underline">
          タスク管理
        </Link>
        <Link to="/admin/settings" className="text-cyan-400 hover:underline">
          サイト設定
        </Link>
        <Link to="/" className="text-zinc-500 hover:underline ml-auto">
          サイトに戻る
        </Link>
        <span className="text-zinc-500 text-sm">{displayName}</span>
        <button
          type="button"
          onClick={signOut}
          className="text-zinc-500 hover:text-zinc-300 text-sm"
        >
          ログアウト
        </button>
      </nav>
      <Outlet />
    </div>
  )
}
