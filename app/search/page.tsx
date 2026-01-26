'use client'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ListCardComponent from '@/components/ListCard'
import Pagination from '@/components/Pagination'
import { BlogPost } from '@/lib/supabase/posts'
import { Grid, Section } from '@/styles/common'
import { theme } from '@/styles/theme'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Main = styled.main`
  max-width: ${theme.breakpoints.wide};
  margin: 0 auto;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.md};
  }
`

const SearchSection = styled(Section)``

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.md};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`

const SearchQuery = styled.span`
  color: ${theme.colors.gray600};
  font-weight: ${theme.typography.fontWeight.normal};
`

const ResultsCount = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.gray600};
  margin-bottom: ${theme.spacing['2xl']};
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['4xl']};
  color: ${theme.colors.gray500};
`

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing['4xl']};
  color: ${theme.colors.gray500};
`

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query || query.trim().length === 0) {
        setPosts([])
        setTotalPages(1)
        setTotal(0)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/rest/posts/search?q=${encodeURIComponent(query)}&page=${page}`
        )

        if (!res.ok) {
          throw new Error('Failed to search posts')
        }

        const data = await res.json()
        // API 응답 구조: { success: true, data: { posts: [...], total: ..., totalPages: ..., ... } }
        const searchData = data.data || {}
        setPosts(searchData.posts || [])
        setTotalPages(searchData.totalPages || 1)
        setTotal(searchData.total || 0)
      } catch (error) {
        setError(error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query, page])

  if (!query || query.trim().length === 0) {
    return (
      <>
        <Header />
        <main id="main-content">
          <Main>
            <SearchSection>
              <SectionTitle>검색</SectionTitle>
              <EmptyState>
                <p>검색어를 입력해주세요.</p>
              </EmptyState>
            </SearchSection>
          </Main>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <Main>
          <SearchSection>
            <SectionTitle>
              검색 결과: <SearchQuery>&#34;{query}&#34;</SearchQuery>
            </SectionTitle>

            {loading ? (
              <LoadingState>검색 중...</LoadingState>
            ) : error ? (
              <EmptyState>
                <p>{error}</p>
              </EmptyState>
            ) : posts.length === 0 ? (
              <EmptyState>
                <p>검색 결과가 없습니다.</p>
              </EmptyState>
            ) : (
              <>
                <ResultsCount>총 {total}개의 포스트를 찾았습니다.</ResultsCount>
                <ListGrid>
                  {posts.map((post, index) => (
                    <ListCardComponent key={post.slug} post={post} priority={index < 3} />
                  ))}
                </ListGrid>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath="/search"
                    queryParams={{ q: query }}
                  />
                )}
              </>
            )}
          </SearchSection>
        </Main>
      </main>
      <Footer />
    </>
  )
}
