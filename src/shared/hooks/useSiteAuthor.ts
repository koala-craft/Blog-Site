import { Route } from '~/routes/__root/route'

/**
 * ルートローダーで取得した authorName を返す。
 * 記事・ブログ・Work の著者表示に使用。
 */
export function useSiteAuthor(): string {
  const rootData = Route.useLoaderData()
  return rootData.authorName
}
