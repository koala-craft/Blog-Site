import { Link } from '@tanstack/react-router'
import { useAuth } from '~/features/admin/useAuth'

export function HeaderNav() {
  const { user } = useAuth()

  return (
    <nav className="max-w-4xl mx-auto px-4 py-4 flex gap-6 items-center flex-wrap">
      <Link
        to="/"
        activeProps={{ className: 'font-bold text-cyan-400' }}
        activeOptions={{ exact: true }}
        className="hover:text-cyan-400 transition"
      >
        Home
      </Link>
      <Link
        to="/about"
        activeProps={{ className: 'font-bold text-cyan-400' }}
        className="hover:text-cyan-400 transition"
      >
        About
      </Link>
      {user && (
        <Link
          to="/admin"
          activeProps={{ className: 'font-bold text-cyan-400' }}
          className="hover:text-cyan-400 transition ml-auto"
        >
          管理
        </Link>
      )}
    </nav>
  )
}
