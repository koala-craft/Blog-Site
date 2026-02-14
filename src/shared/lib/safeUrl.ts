/**
 * XSS 対策: 危険な URL スキームをブロック
 */

/** リンク（a href）用: http/https のみ許可 */
export function isSafeLinkUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('javascript:')) return false
  if (trimmed.startsWith('data:')) return false
  if (trimmed.startsWith('vbscript:')) return false
  if (trimmed.startsWith('file:')) return false
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
}

/** 画像（img src）用: http/https および data:image/* のみ許可 */
export function isSafeImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('javascript:')) return false
  if (trimmed.startsWith('vbscript:')) return false
  if (trimmed.startsWith('file:')) return false
  if (trimmed.startsWith('data:')) {
    return trimmed.startsWith('data:image/')
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
}
