'use client'

import { supabase } from '@/lib/supabase/client'
import type { AppUser } from '@/lib/types/user'
import { Container } from '@/styles/common'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledHeader = styled.header`
  background-color: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
`

const HeaderContainer = styled(Container)`
  max-width: ${props => props.theme.breakpoints.wide};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 ${props => props.theme.spacing.lg};
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-decoration: none;
  color: ${props => props.theme.colors.gray900};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  transition: opacity ${props => props.theme.transitions.fast};

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.blue500};
    outline-offset: 2px;
    border-radius: ${props => props.theme.borderRadius.md};
  }
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.gray100};
  border: 1px solid ${props => props.theme.colors.gray200};
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);

  &:hover {
    background-color: ${props => props.theme.colors.gray200};
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.theme.colors.gray900};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  letter-spacing: 0.3px;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.gray900};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.blue500};
    outline-offset: 2px;
    border-radius: ${props => props.theme.borderRadius.sm};
  }
`

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
  max-width: 400px;
  margin: 0 ${props => props.theme.spacing.lg};

  @media (max-width: 768px) {
    max-width: 200px;
    margin: 0 ${props => props.theme.spacing.md};
  }
`

const SearchInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    outline: 2px solid ${props => props.theme.colors.blue500};
    outline-offset: 2px;
    border-color: ${props => props.theme.colors.gray900};
  }
`

const SearchButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.gray900};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: opacity ${props => props.theme.transitions.fast};

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.blue500};
    outline-offset: 2px;
  }
`

export default function Header() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<AppUser>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <StyledHeader role="banner">
      <HeaderContainer>
        <Logo href="/" scroll={false} aria-label="홈으로 이동">
          <span>Frontend Dev</span>
        </Logo>
        <SearchForm onSubmit={handleSearch} role="search" aria-label="포스트 검색">
          <SearchInput
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="검색어 입력"
            aria-describedby="search-description"
          />
          <span id="search-description" className="sr-only">
            포스트 제목, 부제목, 내용을 검색할 수 있습니다
          </span>
          <SearchButton type="submit" aria-label="검색 실행">
            검색
          </SearchButton>
        </SearchForm>
        {user && (
          <Nav role="navigation" aria-label="주요 네비게이션">
            <NavLink
              href="/admin/posts/new"
              aria-label="새로운 포스트 작성 페이지로 이동"
              scroll={false}
            >
              새로운 포스트 작성
            </NavLink>
          </Nav>
        )}
        {!user && (
          <Nav role="navigation" aria-label="주요 네비게이션">
            <NavLink href="/admin/login" aria-label="관리자 로그인 페이지로 이동" scroll={false}>
              관리자 로그인
            </NavLink>
          </Nav>
        )}
      </HeaderContainer>
    </StyledHeader>
  )
}
