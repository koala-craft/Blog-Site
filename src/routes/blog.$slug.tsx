import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getBlogPost } from '~/features/blog/api'
import { MarkdownWithLinkCards } from '~/shared/components/MarkdownWithLinkCards'

const PROSE_BASE =
  'prose prose-invert prose-zinc max-w-none tracking-tight prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-p:text-[1.05rem] prose-p:leading-[1.7] prose-li:text-[1.05rem] prose-li:my-0.5 prose-headings:font-semibold'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogDetail,
  loader: async ({ params }) => {
    const post = await getBlogPost({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return { post }
  },
})

function BlogDetail() {
  const { post } = Route.useLoaderData()

  return (
    <article className="mx-auto px-4 py-8 pb-60 sm:px-6">
      <header className="mx-auto max-w-[100ch]">
        <h1 className="text-2xl font-bold text-zinc-100 leading-tight tracking-tight mb-4">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((t) => (
              <Link
                key={t}
                to="/blog"
                search={{ tag: t }}
                className="text-sm px-3 py-1.5 rounded-full bg-zinc-700/60 text-zinc-300 hover:bg-zinc-600/60 hover:text-zinc-100 transition"
              >
                {t}
              </Link>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-500">
          <time dateTime={post.createdAt}>{post.createdAt}</time>
          {post.updatedAt !== post.createdAt && (
            <span>更新: {post.updatedAt}</span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[100ch]">
        <MarkdownWithLinkCards
          content={post.content}
          proseClass={`${PROSE_BASE} prose-sm`}
        />
      </div>
    </article>
  )
}
