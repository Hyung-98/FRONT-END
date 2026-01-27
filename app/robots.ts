import { getClientEnvConfig } from '@/lib/config/env'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const config = getClientEnvConfig()
  const siteUrl = config.nextPublicSiteUrl || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
