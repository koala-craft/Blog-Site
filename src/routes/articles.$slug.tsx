import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { getArticle } from '~/features/articles/api'

export const Route = createFileRoute('/articles/$slug')({
  component: ArticleDetail,
  loader: async ({ params }) => {
    const article = await getArticle({ data: { slug: params.slug } })
    if (!article) throw notFound()
    return article
  },
})

function ArticleDetail() {
  const article = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/articles" className="text-cyan-400 hover:underline mb-4 inline-block">
        ← 一覧に戻る
      </Link>
      <article className="prose prose-invert prose-zinc prose-lg max-w-none prose-headings:font-semibold prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline">
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        <p className="text-zinc-500 text-sm mb-8 -mt-2">{article.createdAt}</p>
        <div className="prose-p:leading-relaxed prose-li:my-0.5">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{article.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}
