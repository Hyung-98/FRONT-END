import Footer from '@/components/Footer'
import Header from '@/components/Header'
import RelatedPosts from '@/components/RelatedPosts'
import ShareSection from '@/components/ShareSection'
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/supabase/posts'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import * as S from '../../styles'

interface PageProps {
  params: {
    slug: string
  }
}

// Next.js 캐싱: 60초마다 재검증 (ISR)
export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(slug => ({ slug }))
}

// 사이트 URL 가져오기 (환경 변수 또는 기본값)
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  // 프로덕션에서는 실제 도메인으로 설정 필요
  return process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    }
  }

  const siteUrl = getSiteUrl()
  const url = `${siteUrl}/detail/${params.slug}`
  const title = `${post.title} | Frontend Developer Blog`
  const description = post.subtitle || post.title
  const image = post.heroImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Frontend Developer Blog',
      images: [
        {
          url: image,
          width: 1200,
          height: 600,
          alt: post.title,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post.date,
      authors: ['Frontend Dev'],
      tags: [post.category],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const siteUrl = getSiteUrl()
  const url = `${siteUrl}/detail/${params.slug}`

  // 관련 포스트 가져오기
  const relatedPosts = await getRelatedPosts(params.slug, post.category, 3)

  // 구조화된 데이터 (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.subtitle || post.title,
    image: post.heroImage,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'Frontend Dev',
      jobTitle: 'Developer',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Frontend Developer Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/assets/images/icons/Logos/javascript-original.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: post.category,
    keywords: [post.category, '프론트엔드', '개발', '프로그래밍'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main id="main-content">
        <S.Main>
          <S.HeaderSection>
            <S.Date>{post.date}</S.Date>
            <S.Title>{post.title}</S.Title>
            <S.Subtitle>{post.subtitle}</S.Subtitle>
          </S.HeaderSection>

          <S.Hero>
            <Image
              src={post.heroImage}
              alt={post.title}
              width={1200}
              height={600}
              style={{ objectFit: 'cover' }}
              priority={true}
            />
          </S.Hero>

          <S.ContentWrapper>
            <S.Content>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </S.Content>

            <S.Sidebar>
              <S.SidebarSection>
                <S.SidebarTitle>SHARE</S.SidebarTitle>
                <ShareSection url={url} title={post.title} description={post.subtitle} />
              </S.SidebarSection>

              <S.SidebarSection>
                <S.SidebarTitle>DETAILS</S.SidebarTitle>
                <S.Details role="list">
                  <S.DetailItem role="listitem">
                    <S.DetailLabel>DATE</S.DetailLabel>
                    <S.DetailValue>{post.date}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem role="listitem">
                    <S.DetailLabel>CATEGORY</S.DetailLabel>
                    <S.DetailValue>{post.category}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem role="listitem">
                    <S.DetailLabel>READING</S.DetailLabel>
                    <S.DetailValue>{post.readingTime}</S.DetailValue>
                  </S.DetailItem>
                </S.Details>
              </S.SidebarSection>

              <S.SidebarSection>
                <S.SidebarTitle>AUTHOR</S.SidebarTitle>
                <S.Author>
                  <S.AuthorInfo>
                    <S.AuthorAvatar aria-hidden="true" />
                    <S.AuthorDetails>
                      <S.AuthorName>Frontend Dev</S.AuthorName>
                      <S.AuthorTitle>DEVELOPER</S.AuthorTitle>
                    </S.AuthorDetails>
                  </S.AuthorInfo>
                  <S.AuthorBio>
                    프론트엔드 개발 학습 자료를 체계적으로 정리하고 공유하는 개발자입니다.
                  </S.AuthorBio>
                </S.Author>
              </S.SidebarSection>
            </S.Sidebar>
          </S.ContentWrapper>
          <RelatedPosts posts={relatedPosts} />
        </S.Main>
      </main>
      <Footer />
    </>
  )
}
