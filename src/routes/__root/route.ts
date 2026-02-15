import { createRootRoute } from '@tanstack/react-router'
import { getConfig } from '~/features/admin/configApi'

export const Route = createRootRoute({
  loader: async () => {
    const config = await getConfig()
    return {
      zennUsername: config.zenn_username?.trim() ?? '',
      authorName: config.author_name?.trim() ?? '',
      authorIcon: config.author_icon?.trim() ?? '',
      siteTitle: config.site_title?.trim() ?? '',
    }
  },
})
