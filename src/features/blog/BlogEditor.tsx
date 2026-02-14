/**
 * ブログ執筆 UX 最適化エディタ
 * - フルハイトのエディタ | ライブプレビュー分割
 * - メタデータはコンパクトなバーに集約
 * - Ctrl+S で保存
 * - 執筆に集中できるレイアウト
 */

import { useEffect, useRef, useState } from 'react'
import { MarkdownWithLinkCards } from '~/shared/components/MarkdownWithLinkCards'

const PROSE_BASE =
  'prose prose-invert prose-zinc max-w-none tracking-tight prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-p:text-[1.05rem] prose-p:leading-[1.7] prose-li:text-[1.05rem] prose-li:my-0.5 prose-headings:font-semibold'

export type BlogEditorMeta = {
  slug?: string
  title: string
  tags: string
  visibility: 'public' | 'private'
}

type BlogEditorProps = {
  meta: BlogEditorMeta
  onMetaChange: (meta: BlogEditorMeta) => void
  content: string
  onContentChange: (content: string) => void
  onSave: () => void | Promise<void>
  saving: boolean
  message: { type: 'success' | 'error'; text: string } | null
  /** 新規作成時は slug 編集可、編集時は表示のみ */
  slugEditable?: boolean
  /** 編集画面用の追加アクション（削除ボタン等） */
  extraActions?: React.ReactNode
}

export function BlogEditor({
  meta,
  onMetaChange,
  content,
  onContentChange,
  onSave,
  saving,
  message,
  slugEditable = false,
  extraActions,
}: BlogEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [showMeta, setShowMeta] = useState(false)
  const [viewMode, setViewMode] = useState<'both' | 'editor' | 'preview'>('both')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        onSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSave])

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] -mx-4">
      {/* コンパクトツールバー */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowMeta((s) => !s)}
            className="shrink-0 px-2 py-1.5 rounded text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            title={showMeta ? 'メタデータを閉じる' : 'メタデータを開く'}
          >
            {showMeta ? '▲' : '▼'} メタ
          </button>
          <span className="text-zinc-500 text-sm truncate">
            {meta.title || '無題'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* モバイル: 表示切替 */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`px-2 py-1 rounded text-xs ${
                viewMode === 'editor'
                  ? 'bg-cyan-600/30 text-cyan-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded text-xs ${
                viewMode === 'preview'
                  ? 'bg-cyan-600/30 text-cyan-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              プレビュー
            </button>
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-2 py-1 rounded text-xs ${
                viewMode === 'both'
                  ? 'bg-cyan-600/30 text-cyan-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              両方
            </button>
          </div>
          {extraActions}
          <button
            type="button"
            onClick={() => onSave()}
            disabled={saving}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
          >
            {saving ? '保存中...' : '保存 (Ctrl+S)'}
          </button>
        </div>
      </div>

      {/* メタデータパネル（折りたたみ） */}
      {showMeta && (
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/30 shrink-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {slugEditable && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">スラッグ</label>
              <input
                type="text"
                value={meta.slug ?? ''}
                onChange={(e) => onMetaChange({ ...meta, slug: e.target.value })}
                placeholder="my-post"
                className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">タイトル</label>
            <input
              type="text"
              value={meta.title}
              onChange={(e) => onMetaChange({ ...meta, title: e.target.value })}
              placeholder="記事のタイトル"
              className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">タグ（カンマ区切り）</label>
            <input
              type="text"
              value={meta.tags}
              onChange={(e) => onMetaChange({ ...meta, tags: e.target.value })}
              placeholder="タグ1, タグ2"
              className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">公開</label>
            <select
              value={meta.visibility}
              onChange={(e) =>
                onMetaChange({
                  ...meta,
                  visibility: e.target.value as 'public' | 'private',
                })
              }
              className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="public">公開</option>
              <option value="private">非公開</option>
            </select>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`px-4 py-2 text-sm shrink-0 ${
            message.type === 'success' ? 'text-green-400' : 'text-amber-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* エディタ + プレビュー */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <div
          className={`flex-1 flex flex-col min-w-0 min-h-[200px] ${
            viewMode === 'preview' ? 'hidden' : ''
          }`}
        >
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="# 見出し&#10;&#10;ここから書き始めてください..."
            className="blog-editor-textarea flex-1 w-full px-6 py-5 bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none font-mono text-[15px] leading-[1.8]"
            style={{ tabSize: 2 }}
            spellCheck={false}
          />
        </div>

        <div
          className={`flex-1 flex flex-col min-w-0 min-h-[200px] overflow-auto border-t lg:border-t-0 lg:border-l border-zinc-800 ${
            viewMode === 'editor' ? 'hidden' : ''
          }`}
        >
          <div className="px-6 py-5 max-w-[100ch] mx-auto w-full">
            <h1 className="text-2xl font-bold text-zinc-100 mb-4">
              {meta.title || '無題'}
            </h1>
            <MarkdownWithLinkCards
              content={content || '*本文を入力するとプレビューが表示されます*'}
              proseClass={`${PROSE_BASE} prose-sm`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
