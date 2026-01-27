import { getAllSlugs } from '@/lib/supabase/posts'
import { getClientEnvConfig } from '@/lib/config/env'
import { MetadataRoute } from 'next'

function getSiteUrl(): string {
  const config = getClientEnvConfig()
  return config.nextPublicSiteUrl || 'http://localhost:3000'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const slugs = await getAllSlugs()

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // 동적 포스트 페이지
  const postPages: MetadataRoute.Sitemap = slugs.map(slug => ({
    url: `${siteUrl}/detail/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  return [...staticPages, ...postPages]
}
