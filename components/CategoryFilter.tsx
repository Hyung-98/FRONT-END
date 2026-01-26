'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const FilterContainer = styled.div`
  margin-bottom: ${theme.spacing['2xl']};
`

const FilterTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.md};
`

const FilterList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`

const FilterButton = styled(Link)<{ $active?: boolean }>`
  display: inline-block;
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
  cursor: pointer;

  &:hover {
    background-color: ${props => (props.$active ? theme.colors.gray800 : theme.colors.gray100)};
    border-color: ${props => (props.$active ? theme.colors.gray800 : theme.colors.gray400)};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.blue500};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
  }
`

interface CategoryFilterProps {
  categories: string[]
  currentCategory?: string
  onCategoryChange?: (category: string | undefined) => void // 클라이언트 필터링 모드용 콜백
}

export default function CategoryFilter({
  categories,
  currentCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const isClientMode = !!onCategoryChange

  const buildUrl = (category?: string) => {
    // 카테고리 페이지로 이동하거나 홈으로 이동
    if (category) {
      return `/category/${encodeURIComponent(category)}`
    }
    return '/'
  }

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category?: string) => {
    if (isClientMode) {
      e.preventDefault()
      onCategoryChange?.(category)
    }
    // 서버 모드에서는 기본 Link 동작 유지
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <FilterContainer>
      <FilterTitle>카테고리</FilterTitle>
      <FilterList role="list">
        <FilterButton
          href={buildUrl()}
          $active={!currentCategory}
          role="listitem"
          aria-label="전체 카테고리"
          onClick={e => isClientMode && handleCategoryClick(e)}
        >
          전체
        </FilterButton>
        {categories.map(category => (
          <FilterButton
            key={category}
            href={buildUrl(category)}
            $active={currentCategory === category}
            role="listitem"
            aria-label={`${category} 카테고리`}
            aria-current={currentCategory === category ? 'true' : undefined}
            onClick={e => isClientMode && handleCategoryClick(e, category)}
          >
            {category}
          </FilterButton>
        ))}
      </FilterList>
    </FilterContainer>
  )
}
