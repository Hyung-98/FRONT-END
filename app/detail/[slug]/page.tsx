import DetailHeader from '@/components/DetailHeader'
import Footer from '@/components/Footer'
import ShareLinkComponent from '@/components/ShareLink'
import { getAllSlugs, getPostBySlug } from '@/lib/supabase/posts'
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
  const slugs = await getAllSlugs();
  return slugs.map(slug => ({slug}))
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound()
  }

  return (
    <>
      <DetailHeader />
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </S.Content>

          <S.Sidebar>
            <S.SidebarSection>
              <S.SidebarTitle>SHARE</S.SidebarTitle>
              <S.ShareLinks>
                <ShareLinkComponent href="#">
                  <span>INSTAGRAM</span>
                </ShareLinkComponent>
                <ShareLinkComponent href="#">
                  <span>TWITTER</span>
                </ShareLinkComponent>
                <ShareLinkComponent href="#">
                  <span>FACEBOOK</span>
                </ShareLinkComponent>
              </S.ShareLinks>
            </S.SidebarSection>

            <S.SidebarSection>
              <S.SidebarTitle>DETAILS</S.SidebarTitle>
              <S.Details>
                <S.DetailItem>
                  <S.DetailLabel>DATE</S.DetailLabel>
                  <S.DetailValue>{post.date}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>CATEGORY</S.DetailLabel>
                  <S.DetailValue>{post.category}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>READING</S.DetailLabel>
                  <S.DetailValue>{post.readingTime}</S.DetailValue>
                </S.DetailItem>
              </S.Details>
            </S.SidebarSection>

            <S.SidebarSection>
              <S.SidebarTitle>AUTHOR</S.SidebarTitle>
              <S.Author>
                <S.AuthorInfo>
                  <S.AuthorAvatar />
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
      </S.Main>
      <Footer />
    </>
  )
}
