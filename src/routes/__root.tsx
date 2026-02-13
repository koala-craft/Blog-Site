/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/shared/components/DefaultCatchBoundary'
import { NotFound } from '~/shared/components/NotFound'
import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Obsidian Log' },
      {
        name: 'description',
        content: 'ブログ × タスク管理の可視化',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <header className="border-b border-zinc-800">
          <nav className="max-w-4xl mx-auto px-4 py-4 flex gap-6">
            <Link
              to="/"
              activeProps={{ className: 'font-bold text-cyan-400' }}
              activeOptions={{ exact: true }}
              className="hover:text-cyan-400 transition"
            >
              トップ
            </Link>
            <Link
              to="/articles"
              activeProps={{ className: 'font-bold text-cyan-400' }}
              className="hover:text-cyan-400 transition"
            >
              記事
            </Link>
            <Link
              to="/scraps"
              activeProps={{ className: 'font-bold text-cyan-400' }}
              className="hover:text-cyan-400 transition"
            >
              スクラップ
            </Link>
            <Link
              to="/tasks"
              activeProps={{ className: 'font-bold text-cyan-400' }}
              className="hover:text-cyan-400 transition"
            >
              タスク
            </Link>
            <Link
              to="/admin"
              activeProps={{ className: 'font-bold text-cyan-400' }}
              className="hover:text-cyan-400 transition ml-auto"
            >
              管理
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
