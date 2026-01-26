'use client'

import AdminNav from '@/components/AdminNav'
import Footer from '@/components/Footer'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ButtonGroup, ErrorMessage, FormContainer, SuccessMessage } from '../detail-styles'
import styled from 'styled-components'

const PostsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${theme.spacing.xl};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const TableHeader = styled.thead`
  background-color: ${theme.colors.gray50};
`

const TableHeaderRow = styled.tr`
  border-bottom: 2px solid ${theme.colors.gray200};
`

const TableHeaderCell = styled.th`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  text-align: left;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray700};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const TableBody = styled.tbody``

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.gray200};
  transition: background-color ${theme.transitions.fast};

  &:hover {
    background-color: ${theme.colors.gray50};
  }

  &:last-child {
    border-bottom: none;
  }
`

const TableCell = styled.td`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.gray700};
`

const TitleCell = styled(TableCell)`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray900};
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CategoryBadge = styled.span<{ category: string }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background-color: ${props => {
    const categoryColors: Record<string, string> = {
      JavaScript: theme.colors.yellow100 || '#fef3c7',
      React: theme.colors.blue100 || '#dbeafe',
      TypeScript: theme.colors.blue200 || '#bfdbfe',
      'Next.js': theme.colors.gray100 || '#f3f4f6',
    }
    return categoryColors[props.category] || theme.colors.gray100 || '#f3f4f6'
  }};
  color: ${props => {
    const categoryTextColors: Record<string, string> = {
      JavaScript: theme.colors.yellow800 || '#854d0e',
      React: theme.colors.blue800 || '#1e40af',
      TypeScript: theme.colors.blue900 || '#1e3a8a',
      'Next.js': theme.colors.gray800 || '#1f2937',
    }
    return categoryTextColors[props.category] || theme.colors.gray800 || '#1f2937'
  }};
`

const ActionCell = styled(TableCell)`
  display: flex;
  gap: ${theme.spacing.sm};
`

const ActionButton = styled(Button)`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['4xl']};
  color: ${theme.colors.gray500};
`

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing['2xl']};
`

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin: 0;
`

interface BlogPost {
  slug: string
  title: string
  subtitle: string
  date: string
  category: string
  readingTime: string
  heroImage: string
  content: string
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/rest/posts')

        if (!res.ok) {
          throw new Error('Failed to fetch posts')
        }

        const data = await res.json()
        setPosts(data.data || [])
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const response = await fetch(`/api/rest/posts/${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete post')
      }

      setDeleteSuccess(`"${title}" 포스트가 삭제되었습니다.`)
      setPosts(posts.filter(post => post.slug !== slug))

      setTimeout(() => {
        setDeleteSuccess(null)
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <>
        <FormContainer>
          <PageTitle>포스트 관리</PageTitle>
          <EmptyState>로딩 중...</EmptyState>
        </FormContainer>
        <Footer />
      </>
    )
  }

  return (
    <>
      <AdminNav />
      <FormContainer>
        <HeaderActions>
          <PageTitle>포스트 관리</PageTitle>
          <Button as={Link} href="/admin/posts/new" $variant="primary">
            새 포스트 작성
          </Button>
        </HeaderActions>

        {deleteSuccess && <SuccessMessage>{deleteSuccess}</SuccessMessage>}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {posts.length === 0 ? (
          <EmptyState>
            <p>등록된 포스트가 없습니다.</p>
            <Button
              as={Link}
              href="/admin/posts/new"
              $variant="primary"
              style={{ marginTop: theme.spacing.lg }}
            >
              첫 포스트 작성하기
            </Button>
          </EmptyState>
        ) : (
          <PostsTable>
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell>제목</TableHeaderCell>
                <TableHeaderCell>카테고리</TableHeaderCell>
                <TableHeaderCell>날짜</TableHeaderCell>
                <TableHeaderCell>읽기 시간</TableHeaderCell>
                <TableHeaderCell>작업</TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => (
                <TableRow key={post.slug}>
                  <TitleCell title={post.title}>{post.title}</TitleCell>
                  <TableCell>
                    <CategoryBadge category={post.category}>{post.category}</CategoryBadge>
                  </TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>{post.readingTime}</TableCell>
                  <ActionCell>
                    <ActionButton
                      as={Link}
                      href={`/detail/${post.slug}`}
                      $variant="secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      보기
                    </ActionButton>
                    <ActionButton
                      as={Link}
                      href={`/admin/posts/edit/${post.slug}`}
                      $variant="secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      수정
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDelete(post.slug, post.title)}
                      $variant="primary"
                      style={{
                        backgroundColor: theme.colors.red500 || '#ef4444',
                        borderColor: theme.colors.red500 || '#ef4444',
                      }}
                    >
                      삭제
                    </ActionButton>
                  </ActionCell>
                </TableRow>
              ))}
            </TableBody>
          </PostsTable>
        )}
      </FormContainer>
      <Footer />
    </>
  )
}
