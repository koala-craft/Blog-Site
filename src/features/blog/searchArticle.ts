import type { BlogPost } from './types'

export function getBlogPostPreview(post: BlogPost, maxLength = 100): string {
  const raw = post.content ?? ''
  const plain = raw
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.length > maxLength ? plain.slice(0, maxLength) + '…' : plain
}

export function getBlogPostSearchText(post: BlogPost): string {
  return `${post.title} ${post.content}`.toLowerCase()
}

export function blogPostMatchesSearch(post: BlogPost, query: string): boolean {
  if (!query.trim()) return true
  const searchText = getBlogPostSearchText(post)
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return terms.every((term) => searchText.includes(term))
}
