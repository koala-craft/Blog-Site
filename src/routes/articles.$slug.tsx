import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getArticle } from '~/features/articles/api'
import { MarkdownWithLinkCards } from '~/shared/components/MarkdownWithLinkCards'
import { getZennUsernameForServer } from '~/shared/lib/contentSource'

export const Route = createFileRoute('/articles/$slug')({
  component: ArticleDetail,
  loader: async ({ params }) => {
    const [article, zennUsername] = await Promise.all([
      getArticle({ data: { slug: params.slug } }),
      getZennUsernameForServer(),
    ])
    if (!article) throw notFound()
    return { article, zennUsername }
  },
})

function ArticleDetail() {
  const { article, zennUsername } = Route.useLoaderData()
  const zennArticleUrl =
    zennUsername && article
      ? `https://zenn.dev/${zennUsername}/articles/${article.slug}`
      : null

  return (
    <article className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.map((t) => (
              <Link
                key={t}
                to="/articles"
                search={{ tag: t }}
                className="text-sm px-2.5 py-1 rounded bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-300"
              >
                {t}
              </Link>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
          <p className="text-zinc-500 text-sm -mt-2">{article.createdAt}</p>
          {zennArticleUrl && (
            <a
              href={zennArticleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:underline"
            >
              Zenn で見る ↗
            </a>
          )}
        </div>
        <div className="prose-p:leading-relaxed prose-li:my-0.5">
          <MarkdownWithLinkCards
            content={article.content}
            proseClass="prose prose-invert prose-zinc prose-lg max-w-none prose-headings:font-semibold prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-p:leading-relaxed prose-li:my-0.5"
          />
        </div>
    </article>
  )
}
