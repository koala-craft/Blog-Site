export interface BlogPost {
  slug: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags: string[]
  visibility: 'public' | 'private'
}
