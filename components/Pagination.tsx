'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const PaginationContainer = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing['2xl']} 0;
  flex-wrap: wrap;
`

const PaginationButton = styled(Link)<{ $active?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${props => (props.$active ? theme.colors.gray900 : theme.colors.gray300)};
  background-color: ${props => (props.$active ? theme.colors.gray900 : theme.colors.white)};
  color: ${props => (props.$active ? theme.colors.white : theme.colors.gray900)};
  text-decoration: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${props =>
    props.$active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  transition: all ${theme.transitions.normal};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${props => (props.$disabled ? 'none' : 'auto')};

  &:hover:not([disabled]) {
    background-color: ${props => (props.$active ? theme.colors.gray800 : theme.colors.gray100)};
    border-color: ${props => (props.$active ? theme.colors.gray800 : theme.colors.gray400)};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.blue500};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.sm};
  }
`

const Ellipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  color: ${theme.colors.gray500};
  font-size: ${theme.typography.fontSize.base};

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    font-size: ${theme.typography.fontSize.sm};
  }
`

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
  queryParams?: Record<string, string>
  onPageChange?: (page: number) => void // 클라이언트 필터링 모드용 콜백
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = '/',
  queryParams = {},
  onPageChange,
}: PaginationProps) {
  const searchParams = useSearchParams()
  const isClientMode = !!onPageChange

  // 쿼리 파라미터를 URL에 포함
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())

    // 기존 쿼리 파라미터 유지
    Object.entries(queryParams).forEach(([key, value]) => {
      params.set(key, value)
    })

    // 페이지 파라미터 설정
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }

    const queryString = params.toString()
    return `${basePath}${queryString ? `?${queryString}` : ''}`
  }

  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    if (isClientMode) {
      e.preventDefault()
      onPageChange?.(page)
    }
    // 서버 모드에서는 기본 Link 동작 유지
  }

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 첫 페이지
      pages.push(1)

      if (currentPage <= 3) {
        // 현재 페이지가 앞쪽에 있으면
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // 현재 페이지가 뒤쪽에 있으면
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 현재 페이지가 중간에 있으면
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <PaginationContainer role="navigation" aria-label="페이지네이션">
      <PaginationButton
        href={buildUrl(currentPage - 1)}
        $disabled={currentPage === 1}
        aria-label="이전 페이지"
        onClick={e => isClientMode && currentPage > 1 && handlePageClick(e, currentPage - 1)}
      >
        이전
      </PaginationButton>

      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
        }

        return (
          <PaginationButton
            key={page}
            href={buildUrl(page)}
            $active={page === currentPage}
            aria-label={`페이지 ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            onClick={e => isClientMode && handlePageClick(e, page)}
          >
            {page}
          </PaginationButton>
        )
      })}

      <PaginationButton
        href={buildUrl(currentPage + 1)}
        $disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        onClick={e =>
          isClientMode && currentPage < totalPages && handlePageClick(e, currentPage + 1)
        }
      >
        다음
      </PaginationButton>
    </PaginationContainer>
  )
}
