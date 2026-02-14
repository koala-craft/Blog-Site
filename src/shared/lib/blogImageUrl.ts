import { isSafeImageUrl } from './safeUrl'

/**
 * ブログ画像 URL の変換
 * raw.githubusercontent.com はプロキシ経由で取得（プライベートリポジトリ対応）
 * XSS 対策: javascript:, data:text/html 等の危険な URL はブロック
 */
export function getBlogImageSrc(src: string): string {
  if (!isSafeImageUrl(src)) {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  }
  if (src.startsWith('https://raw.githubusercontent.com/')) {
    return `/api/blog-assets/proxy?url=${encodeURIComponent(src)}`
  }
  if (src.includes(' ') || /[\u3000-\u9FFF]/.test(src)) {
    return encodeURI(src)
  }
  return src
}
