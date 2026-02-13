import { createFileRoute, Link } from '@tanstack/react-router'
import { getScraps } from '~/features/scraps/api'

export const Route = createFileRoute('/scraps/')({
  component: ScrapsIndex,
  loader: () => getScraps(),
})

function ScrapsIndex() {
  const scraps = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">スクラップ一覧</h1>
      <ul className="space-y-4">
        {scraps.map((s) => (
          <li key={s.slug} className="border-b border-zinc-700 pb-4">
            <Link
              to="/scraps/$slug"
              params={{ slug: s.slug }}
              className="text-xl text-cyan-400 hover:underline"
            >
              {s.title}
            </Link>
            <p className="text-sm text-zinc-500 mt-1">{s.created_at}</p>
          </li>
        ))}
        {scraps.length === 0 && (
          <li className="text-zinc-500">スクラップがありません</li>
        )}
      </ul>
    </div>
  )
}
