import { createFileRoute, Link } from '@tanstack/react-router'
import { getArticles } from '~/features/articles/api'

export const Route = createFileRoute('/articles/')({
  component: ArticlesIndex,
  loader: () => getArticles(),
})

function ArticlesIndex() {
  const articles = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">記事一覧</h1>
      <ul className="space-y-4">
        {articles.map((a) => (
          <li key={a.slug} className="border-b border-zinc-700 pb-4">
            <Link
              to="/articles/$slug"
              params={{ slug: a.slug }}
              className="text-xl text-cyan-400 hover:underline"
            >
              {a.title}
            </Link>
            <p className="text-sm text-zinc-500 mt-1">{a.createdAt}</p>
          </li>
        ))}
        {articles.length === 0 && (
          <li className="text-zinc-500">記事がありません</li>
        )}
      </ul>
    </div>
  )
}
