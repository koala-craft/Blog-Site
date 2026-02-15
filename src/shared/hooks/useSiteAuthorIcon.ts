import { Route } from '~/routes/__root/route'

/**
 * ルートローダーで取得した authorIcon を返す。
 */
export function useSiteAuthorIcon(): string {
  const rootData = Route.useLoaderData()
  return rootData.authorIcon
}
