import CategoryFilter from '@/components/CategoryFilter'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ListCardComponent from '@/components/ListCard'
import Pagination from '@/components/Pagination'
import { getAllCategories, getPostsByCategoryPaginated } from '@/lib/supabase/posts'
import { Grid, Section } from '@/styles/common'
import { theme } from '@/styles/theme'
import { notFound } from 'next/navigation'
import styled from 'styled-components'

// Next.js 캐싱: 60초마다 재검증
export const revalidate = 60

const Main = styled.main`
  max-width: ${theme.breakpoints.wide};
  margin: 0 auto;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.md};
  }
`

const CategorySection = styled(Section)``

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`

const ListGrid = styled(Grid)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    gap: 24px;
  }
`

interface PageProps {
  params: {
    category: string
  }
  searchParams: {
    page?: string
  }
}

// 정적 생성용 카테고리 목록
export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map(category => ({
    category: category,
  }))
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps) {
  const category = decodeURIComponent(params.category)
  return {
    title: `${category} 카테고리 | Frontend Developer Blog`,
    description: `${category} 카테고리 포스트 목록`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = decodeURIComponent(params.category)
  const currentPage = parseInt(searchParams.page || '1', 10)
  const postsPerPage = 10

  // 카테고리 목록 가져오기
  const categories = await getAllCategories()

  // 카테고리가 유효한지 확인
  if (!categories.includes(category)) {
    notFound()
  }

  // 카테고리별 포스트 가져오기
  const { posts, totalPages, page } = await getPostsByCategoryPaginated(
    category,
    currentPage,
    postsPerPage
  )

  return (
    <>
      <Header />
      <main id="main-content">
        <Main>
          <CategorySection>
            <CategoryFilter categories={categories} currentCategory={category} />
            <SectionTitle>{category} 카테고리</SectionTitle>
            {posts.length === 0 ? (
              <p>이 카테고리에 포스트가 없습니다.</p>
            ) : (
              <>
                <ListGrid>
                  {posts.map((post, index) => (
                    <ListCardComponent key={post.slug} post={post} priority={index < 3} />
                  ))}
                </ListGrid>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath={`/category/${encodeURIComponent(category)}`}
                  />
                )}
              </>
            )}
          </CategorySection>
        </Main>
      </main>
      <Footer />
    </>
  )
}
