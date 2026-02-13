import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { getScrap } from '~/features/scraps/api'

export const Route = createFileRoute('/scraps/$slug')({
  component: ScrapDetail,
  loader: async ({ params }) => {
    const scrap = await getScrap({ data: { slug: params.slug } })
    if (!scrap) throw notFound()
    return scrap
  },
})

function ScrapDetail() {
  const scrap = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/scraps" className="text-cyan-400 hover:underline mb-4 inline-block">
        ← 一覧に戻る
      </Link>
      <article>
        <h1 className="text-3xl font-bold mb-4">{scrap.title}</h1>
        <p className="text-zinc-500 text-sm mb-6">{scrap.created_at}</p>
        <div className="space-y-6">
          {scrap.comments.map((c, i) => (
            <CommentBlock key={i} comment={c} />
          ))}
        </div>
      </article>
    </div>
  )
}

function CommentBlock({
  comment,
}: {
  comment: { body_markdown: string; children?: { body_markdown: string }[] }
}) {
  return (
    <div className="border-l-2 border-zinc-600 pl-4">
      <div className="prose prose-invert prose-zinc prose-sm max-w-none prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {comment.body_markdown}
        </ReactMarkdown>
      </div>
      {comment.children?.map((c, i) => (
        <div key={i} className="ml-4 mt-2 prose prose-invert prose-zinc prose-sm max-w-none prose-a:text-cyan-400">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {c.body_markdown}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  )
}
