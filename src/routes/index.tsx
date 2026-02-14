import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, FileText } from 'lucide-react'
import { SiZenn } from 'react-icons/si'
import { getArticles } from '~/features/articles/api'
import { getScraps } from '~/features/scraps/api'
import { getBlogPosts } from '~/features/blog/api'
import { getSiteHeader } from '~/features/admin/siteConfig'
import { parseScrapTitle } from '~/features/scraps/parseScrapTitle'
import { BlogCard } from '~/shared/components/BlogCard'
import { ContactCTA } from '~/shared/components/ContactCTA'
import { TopCard } from '~/shared/components/TopCard'

const DEFAULT_TITLE = 'Obsidian Log'
const DEFAULT_SUBTITLE = 'ブログアプリ'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const [articles, scraps, blogPosts, header] = await Promise.all([
      getArticles(),
      getScraps(),
      getBlogPosts(),
      getSiteHeader(),
    ])
    return {
      articles,
      scraps,
      blogPosts,
      siteTitle: header.title || DEFAULT_TITLE,
      siteSubtitle: header.subtitle || DEFAULT_SUBTITLE,
    }
  },
})

function HomePage() {
  const { articles, scraps, blogPosts, siteTitle, siteSubtitle } =
    Route.useLoaderData()

  return (
    <div className="min-h-screen">
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="mb-12 lg:mb-16">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            {siteTitle}
          </h1>
          <p className="mt-2 text-zinc-500 text-sm sm:text-base">
            {siteSubtitle}
          </p>
        </header>

        {/* ブログセクション見出し */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-200 tracking-tight">Blog</h2>
          <Link
            to="/blog"
            className="text-sm text-zinc-500 hover:text-cyan-400 transition-colors"
          >
            View all →
          </Link>
        </div>

        {/* マガジン風グリッド: 画像参考レイアウト */}
        {blogPosts.length > 0 ? (
          <div
            className="grid gap-3 sm:gap-4 lg:gap-5 mb-16"
            style={{
              gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(2, minmax(0, auto))',
            }}
          >
            {/* 1件目: 大ブロック（左・2行占有・縦幅いっぱい） */}
            {blogPosts[0] && (
              <div className="col-span-12 lg:col-span-8 lg:row-span-2 min-h-[340px] lg:min-h-[65vh]">
                <ul className="list-none p-0 m-0 h-full">
                  <BlogCard key={blogPosts[0].slug} post={blogPosts[0]} featured />
                </ul>
              </div>
            )}

            {/* 2件目: 右上（横長） */}
            {blogPosts[1] && (
              <div className="col-span-12 lg:col-span-4 min-h-0">
                <ul className="list-none p-0 m-0 h-full">
                  <BlogCard
                    key={blogPosts[1].slug}
                    post={blogPosts[1]}
                    compact="wide"
                  />
                </ul>
              </div>
            )}

            {/* 3件目: 右下左（正方形） */}
            {blogPosts[2] && (
              <div className="col-span-12 lg:col-span-2 min-h-0">
                <ul className="list-none p-0 m-0 h-full">
                  <BlogCard
                    key={blogPosts[2].slug}
                    post={blogPosts[2]}
                    compact="square"
                  />
                </ul>
              </div>
            )}

            {/* 4件目: 右下右（縦長） */}
            {blogPosts[3] && (
              <div className="col-span-12 lg:col-span-2 min-h-0">
                <ul className="list-none p-0 m-0 h-full">
                  <BlogCard
                    key={blogPosts[3].slug}
                    post={blogPosts[3]}
                    compact="tall"
                  />
                </ul>
              </div>
            )}

          </div>
        ) : (
          <p className="text-zinc-600 text-sm py-6 mb-16">ブログがありません</p>
        )}

        {/* Zenn 投稿エリア */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3ea8ff]/15 text-[#3ea8ff]">
              <SiZenn className="w-6 h-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-200">Zenn</h2>
              <p className="text-xs text-zinc-500">技術記事・スクラップ</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:divide-x lg:divide-zinc-800/80">
          <section className="min-w-0 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400">
                  <BookOpen className="w-4 h-4" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-zinc-200">Articles</h3>
              </div>
              <Link
                to="/articles"
                className="text-sm text-zinc-500 hover:text-cyan-400 transition-colors shrink-0"
              >
                View all →
              </Link>
            </div>
            <ul className="space-y-2">
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
                      className="pointer-events-auto px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-500 hover:bg-zinc-700/60 hover:text-zinc-300 text-xs"
                    >
                      {t}
                    </Link>
                  ))}
                  {a.tags.length > 0 && <span className="text-zinc-600">·</span>}
                  <span>{a.createdAt}</span>
                </TopCard>
              ))}
              {articles.length === 0 && (
                <li className="text-zinc-600 text-sm py-6">記事がありません</li>
              )}
            </ul>
          </section>

          <section className="min-w-0 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <FileText className="w-4 h-4" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-zinc-200">Scraps</h3>
              </div>
              <Link
                to="/scraps"
                className="text-sm text-zinc-500 hover:text-cyan-400 transition-colors shrink-0"
              >
                View all →
              </Link>
            </div>
            <ul className="space-y-2">
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
                        className="pointer-events-auto px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-500 hover:bg-zinc-700/60 hover:text-zinc-300 text-xs"
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
                <li className="text-zinc-600 text-sm py-6">スクラップがありません</li>
              )}
            </ul>
          </section>
          </div>
        </div>
      </div>
      <ContactCTA />
    </div>
  )
}
