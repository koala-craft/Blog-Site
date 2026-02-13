import { createFileRoute, Link } from '@tanstack/react-router'
import { getArticles } from '~/features/articles/api'
import { getScraps } from '~/features/scraps/api'
import { fetchTaskSummary } from '~/features/tasks/api'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const [articles, scraps, taskSummary] = await Promise.all([
      getArticles(),
      getScraps(),
      fetchTaskSummary(),
    ])
    return { articles, scraps, taskSummary }
  },
})

function HomePage() {
  const { articles, scraps, taskSummary } = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Obsidian Log</h1>
      <p className="text-zinc-400 mb-12">
        ブログ × タスク管理の可視化
      </p>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <section>
          <h2 className="text-xl font-semibold mb-4">最新記事</h2>
          <ul className="space-y-2">
            {articles.slice(0, 5).map((a) => (
              <li key={a.slug}>
                <Link
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="text-cyan-400 hover:underline"
                >
                  {a.title}
                </Link>
              </li>
            ))}
            {articles.length === 0 && (
              <li className="text-zinc-500">記事がありません</li>
            )}
          </ul>
          <Link to="/articles" className="text-sm text-cyan-400 mt-2 inline-block hover:underline">
            一覧を見る →
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">タスク消化率</h2>
          <div className="text-2xl font-mono">
            {taskSummary.total > 0
              ? `${taskSummary.done} / ${taskSummary.total}`
              : '---'}
          </div>
          <Link to="/tasks" className="text-sm text-cyan-400 mt-2 inline-block hover:underline">
            タスク一覧 →
          </Link>
        </section>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">最新スクラップ</h2>
        <ul className="space-y-2">
          {scraps.slice(0, 5).map((s) => (
            <li key={s.slug}>
              <Link
                to="/scraps/$slug"
                params={{ slug: s.slug }}
                className="text-cyan-400 hover:underline"
              >
                {s.title}
              </Link>
            </li>
          ))}
          {scraps.length === 0 && (
            <li className="text-zinc-500">スクラップがありません</li>
          )}
        </ul>
        <Link to="/scraps" className="text-sm text-cyan-400 mt-2 inline-block hover:underline">
          一覧を見る →
        </Link>
      </section>
    </div>
  )
}
