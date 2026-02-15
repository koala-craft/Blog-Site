import { Route } from '~/routes/__root/route'

/**
 * ルートローダーで取得した zennUsername を返す。
 * Zenn リンク（記事・スクラップの「Zenn で見る」）の生成に使用。
 */
export function useZennUsername(): string {
  const rootData = Route.useLoaderData()
  return rootData.zennUsername
}
