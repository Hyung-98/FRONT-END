import { getClientEnvConfig } from '@/lib/config/env'
import { getAllPosts } from '@/lib/supabase/posts'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1시간마다 재검증

function getSiteUrl(): string {
  const config = getClientEnvConfig()
  return config.nextPublicSiteUrl || 'http://localhost:3000'
}

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) {
    return new Date().toUTCString()
  }
  try {
    // "JANUARY 23, 2025" 형식을 Date 객체로 변환
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      // 파싱 실패 시 현재 날짜 사용
      return new Date().toUTCString()
    }
    return date.toUTCString()
  } catch {
    return new Date().toUTCString()
  }
}

function escapeXml(unsafe: string | undefined | null): string {
  if (!unsafe) {
    return ''
  }
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  try {
    const posts = await getAllPosts()
    const siteUrl = getSiteUrl()
    const feedUrl = `${siteUrl}/feed.xml`
    const siteName = 'Frontend Developer Blog'
    const siteDescription = '프론트엔드 개발 면접 질문 및 학습 자료 모음'

    // 최근 20개 포스트만 포함
    const recentPosts = posts.slice(0, 20)

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${recentPosts
      .map(
        post => `
    <item>
      <title>${escapeXml(post.title || 'Untitled')}</title>
      <link>${siteUrl}/detail/${post.slug || ''}</link>
      <guid isPermaLink="true">${siteUrl}/detail/${post.slug || ''}</guid>
      <description>${escapeXml(post.subtitle || post.title || '')}</description>
      <pubDate>${formatDate(post.date)}</pubDate>
      <category>${escapeXml(post.category || 'Uncategorized')}</category>
      <content:encoded><![CDATA[${post.content || ''}]]></content:encoded>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}
