import { createFileRoute, Link } from '@tanstack/react-router'
import { getArticles } from '~/features/articles/api'
import { getScraps } from '~/features/scraps/api'
import { getBlogPosts } from '~/features/blog/api'
import { parseScrapTitle } from '~/features/scraps/parseScrapTitle'
import { TopCard } from '~/shared/components/TopCard'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const [articles, scraps, blogPosts] = await Promise.all([
      getArticles(),
      getScraps(),
      getBlogPosts(),
    ])
    return { articles, scraps, blogPosts }
  },
})

function HomePage() {
  const { articles, scraps, blogPosts } = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Obsidian Log</h1>

      {/* blog エリア */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-400 mb-6">blog</h2>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">diary</h3>
            <Link to="/blog" className="text-sm text-cyan-400 hover:underline">
              View all →
            </Link>
          </div>
          <ul className="space-y-3">
            {blogPosts.slice(0, 5).map((p) => (
              <TopCard
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                ariaLabel={`ブログ「${p.title}」を読む`}
                title={p.title}
              >
                {p.tags.map((t) => (
                  <Link
                    key={t}
                    to="/blog"
                    search={{ tag: t }}
                    className="pointer-events-auto px-2 py-0.5 rounded bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600/60 hover:text-zinc-300"
                  >
                    {t}
                  </Link>
                ))}
                {p.tags.length > 0 && <span className="text-zinc-600">·</span>}
                <span>{p.createdAt}</span>
              </TopCard>
            ))}
            {blogPosts.length === 0 && (
              <li className="text-zinc-500 py-4">ブログがありません</li>
            )}
          </ul>
        </div>
      </section>

      {/* Zenn エリア */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-400 mb-6">Zenn</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Articles</h3>
              <Link to="/articles" className="text-sm text-cyan-400 hover:underline">
                View all →
              </Link>
            </div>
            <ul className="space-y-3">
              {articles.slice(0, 5).map((a) => (
                <TopCard
                  key={a.slug}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  ariaLabel={`記事「${a.title}」を読む`}
                  title={a.title}
                >
                  {a.tags.map((t) => (
                    <Link
                      key={t}
                      to="/articles"
                      search={{ tag: t }}
                      className="pointer-events-auto px-2 py-0.5 rounded bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600/60 hover:text-zinc-300"
                    >
                      {t}
                    </Link>
                  ))}
                  {a.tags.length > 0 && <span className="text-zinc-600">·</span>}
                  <span>{a.createdAt}</span>
                </TopCard>
              ))}
              {articles.length === 0 && (
                <li className="text-zinc-500 py-4">記事がありません</li>
              )}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Scraps</h3>
              <Link to="/scraps" className="text-sm text-cyan-400 hover:underline">
                View all →
              </Link>
            </div>
            <ul className="space-y-3">
              {scraps.slice(0, 5).map((s) => {
                const { displayTitle, tags } = parseScrapTitle(s.title)
                return (
                  <TopCard
                    key={s.slug}
                    to="/scraps/$slug"
                    params={{ slug: s.slug }}
                    ariaLabel={`スクラップ「${displayTitle || s.title}」を読む`}
                    title={displayTitle || s.title}
                  >
                    {tags.map((t) => (
                      <Link
                        key={t}
                        to="/scraps"
                        search={{ tag: t }}
                        className="pointer-events-auto px-2 py-0.5 rounded bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600/60 hover:text-zinc-300"
                      >
                        {t}
                      </Link>
                    ))}
                    {tags.length > 0 && <span className="text-zinc-600">·</span>}
                    <span>{s.created_at}</span>
                    <span className="text-zinc-600">·</span>
                    <span>コメント {s.comments.length}件</span>
                    {s.comments[0]?.author && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span>by {s.comments[0].author}</span>
                      </>
                    )}
                  </TopCard>
                )
              })}
              {scraps.length === 0 && (
                <li className="text-zinc-500 py-4">スクラップがありません</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
