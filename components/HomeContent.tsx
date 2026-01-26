'use client'

import { BlogPost } from '@/lib/supabase/posts'
import { Grid, Section } from '@/styles/common'
import { theme } from '@/styles/theme'
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import CategoryFilter from './CategoryFilter'
import FeaturedCardComponent from './FeaturedCard'
import ListCardComponent from './ListCard'
import Pagination from './Pagination'

const Main = styled.main`
  max-width: ${theme.breakpoints.wide};
  margin: 0 auto;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.md};
  }
`

const Recent = styled(Section)``

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['3xl']};
    margin-bottom: ${theme.spacing.xl};
  }

  @media (max-width: 480px) {
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

interface HomeContentProps {
  featuredPost?: BlogPost
  recentPosts: BlogPost[]
  currentPage?: number
  totalPages?: number
  categories?: string[]
  currentCategory?: string
  // 클라이언트 필터링 옵션
  allPosts?: BlogPost[] // 전체 포스트 (클라이언트 필터링용)
  clientFiltering?: boolean // 클라이언트 필터링 모드 활성화
  postsPerPage?: number // 클라이언트 필터링 시 페이지당 포스트 수
}

export default function HomeContent({
  featuredPost,
  recentPosts,
  currentPage = 1,
  totalPages = 1,
  categories = [],
  currentCategory,
  allPosts,
  clientFiltering = false,
  postsPerPage = 10,
}: HomeContentProps) {
  // 클라이언트 필터링 상태
  const [clientSelectedCategory, setClientSelectedCategory] = useState<string | undefined>(
    currentCategory
  )
  const [clientCurrentPage, setClientCurrentPage] = useState(currentPage)

  // 클라이언트 필터링 로직
  const clientFilteredData = useMemo(() => {
    if (!clientFiltering || !allPosts) {
      return null
    }

    // 카테고리 필터링
    const filtered = clientSelectedCategory
      ? allPosts.filter(post => post.category === clientSelectedCategory)
      : allPosts

    // 페이지네이션
    const startIndex = (clientCurrentPage - 1) * postsPerPage
    const endIndex = startIndex + postsPerPage
    const paginatedPosts = filtered.slice(startIndex, endIndex)
    const totalPages = Math.ceil(filtered.length / postsPerPage)

    // Featured 포스트 결정 (첫 페이지이고 카테고리 필터 없을 때만)
    const featured =
      !clientSelectedCategory && clientCurrentPage === 1 && paginatedPosts.length > 0
        ? paginatedPosts[0]
        : undefined
    const recent =
      !clientSelectedCategory && clientCurrentPage === 1 ? paginatedPosts.slice(1) : paginatedPosts

    return {
      featuredPost: featured,
      recentPosts: recent,
      totalPages,
      page: clientCurrentPage,
    }
  }, [allPosts, clientFiltering, clientSelectedCategory, clientCurrentPage, postsPerPage])

  // 클라이언트 필터링 모드인지 서버 필터링 모드인지 결정
  const isClientMode = clientFiltering && allPosts
  const displayData = isClientMode
    ? clientFilteredData!
    : {
        featuredPost,
        recentPosts,
        totalPages,
        page: currentPage,
      }

  const activeCategory = isClientMode ? clientSelectedCategory : currentCategory

  // 카테고리 변경 핸들러 (클라이언트 모드)
  const handleCategoryChange = (category: string | undefined) => {
    if (isClientMode) {
      setClientSelectedCategory(category)
      setClientCurrentPage(1) // 카테고리 변경 시 첫 페이지로 리셋
    }
  }

  // 페이지 변경 핸들러 (클라이언트 모드)
  const handlePageChange = (page: number) => {
    if (isClientMode) {
      setClientCurrentPage(page)
      // 스크롤을 맨 위로 이동
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Main>
      {displayData.featuredPost && <FeaturedCardComponent post={displayData.featuredPost} />}

      <Recent>
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            currentCategory={activeCategory}
            onCategoryChange={isClientMode ? handleCategoryChange : undefined}
          />
        )}
        <SectionTitle>
          {activeCategory ? `${activeCategory} 카테고리` : 'Recent blog posts'}
        </SectionTitle>
        <ListGrid>
          {displayData.recentPosts.length > 0 ? (
            displayData.recentPosts.map((post, index) => (
              <ListCardComponent key={post.slug} post={post} priority={index < 3} />
            ))
          ) : (
            <p>이 카테고리에 포스트가 없습니다.</p>
          )}
        </ListGrid>
        {displayData.totalPages > 1 && (
          <Pagination
            currentPage={displayData.page}
            totalPages={displayData.totalPages}
            basePath="/"
            queryParams={activeCategory ? { category: activeCategory } : {}}
            onPageChange={isClientMode ? handlePageChange : undefined}
          />
        )}
      </Recent>
    </Main>
  )
}
