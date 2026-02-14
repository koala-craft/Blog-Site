import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { extractLinks, isContentOnlyLinks } from '~/shared/lib/contentLinks'
import { LinkCard } from './LinkCard'

interface MarkdownWithLinkCardsProps {
  content: string
  proseClass?: string
}

const DEFAULT_PROSE =
  'prose prose-invert prose-zinc max-w-none prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-p:leading-[1.7] prose-li:my-0.5'

/**
 * 1行がリンクのみの場合はリンクカードとして表示、
 * それ以外は通常の Markdown として表示
 */
export function MarkdownWithLinkCards({
  content,
  proseClass = DEFAULT_PROSE,
}: MarkdownWithLinkCardsProps) {
  if (!content.trim()) return null

  const lines = content.split('\n')
  const hasLinkOnlyLine = lines.some((line) => isContentOnlyLinks(line))

  if (!hasLinkOnlyLine) {
    return (
      <div className={proseClass}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <br key={i} />
        }
        if (isContentOnlyLinks(trimmed)) {
          const links = extractLinks(trimmed)
          if (links.length === 0) return <br key={i} />
          return (
            <div key={i} className="space-y-3">
              {links.map((link, j) => (
                <LinkCard
                  key={`${link.url}-${j}`}
                  text={link.text}
                  url={link.url}
                />
              ))}
            </div>
          )
        }
        return (
          <div key={i} className={proseClass}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {line}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
