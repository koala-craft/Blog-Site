import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { extractLinks, isContentOnlyLinks } from '~/shared/lib/contentLinks'
import { LinkCard } from './LinkCard'

interface MarkdownWithLinkCardsProps {
  content: string
  proseClass?: string
  /** br の縦余白（例: "0.25em", "0.5em"）。未指定時は CSS 変数 --prose-br-spacing のデフォルト値 */
  brSpacing?: string
}

const DEFAULT_PROSE =
  'prose prose-invert prose-zinc max-w-none prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-p:leading-[1.7] prose-li:my-0.5'

function ProseLineBreak() {
  return <span className="prose-line-break" aria-hidden="true" />
}

/**
 * 1行がリンクのみの場合はリンクカードとして表示、
 * それ以外は通常の Markdown として表示
 */
export function MarkdownWithLinkCards({
  content,
  proseClass = DEFAULT_PROSE,
  brSpacing,
}: MarkdownWithLinkCardsProps) {
  if (!content.trim()) return null

  const lines = content.split('\n')
  const hasLinkOnlyLine = lines.some((line) => isContentOnlyLinks(line))

  const proseStyle = {
    '--prose-br-spacing': brSpacing ?? '0.25em',
  } as React.CSSProperties

  const markdownComponents = {
    br: () => <ProseLineBreak />,
  }

  if (!hasLinkOnlyLine) {
    return (
      <div className={proseClass} style={proseStyle}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="space-y-4" style={proseStyle}>
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <ProseLineBreak key={i} />
        }
        if (isContentOnlyLinks(trimmed)) {
          const links = extractLinks(trimmed)
          if (links.length === 0) return <ProseLineBreak key={i} />
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={markdownComponents}
            >
              {line}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
