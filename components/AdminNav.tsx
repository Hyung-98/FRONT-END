'use client'

import { createClient } from '@/lib/supabase/client'
import type { AppUser } from '@/lib/types/user'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const supabase = createClient()

const NavContainer = styled.nav`
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.gray200};
  padding: ${theme.spacing.md} 0;
`

const NavContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
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
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  text-decoration: none;
  color: ${props => (props.$active ? theme.colors.gray900 : theme.colors.gray600)};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${props =>
    props.$active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  position: relative;

  &:hover {
    color: ${theme.colors.gray900};
    background-color: ${theme.colors.gray50};
  }

  ${props =>
    props.$active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -${theme.spacing.md};
      left: ${theme.spacing.md};
      right: ${theme.spacing.md};
      height: 2px;
      background-color: ${theme.colors.gray900};
    }
  `}
`

const NavTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin: 0;
  margin-right: ${theme.spacing.xl};
`

const NavActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`

const LogoutButton = styled(Button)`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
`

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <NavContainer>
      <NavContent>
        <Logo href="/" scroll={false}>
          <span>Frontend Dev</span>
        </Logo>
        <NavTitle>관리자</NavTitle>
        <NavLink
          href="/admin/posts"
          $active={
            pathname === '/admin/posts' ||
            (pathname?.startsWith('/admin/posts/') && pathname !== '/admin/posts/new')
          }
        >
          포스트 관리
        </NavLink>
        <NavLink href="/admin/posts/new" $active={pathname === '/admin/posts/new'}>
          새 포스트 작성
        </NavLink>
        <NavActions>
          {user && (
            <>
              <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray600 }}>
                {user.email}
              </span>
              <LogoutButton onClick={handleLogout} $variant="secondary">
                로그아웃
              </LogoutButton>
            </>
          )}
        </NavActions>
      </NavContent>
    </NavContainer>
  )
}
