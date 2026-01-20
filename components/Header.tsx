'use client'

import { Container } from '@/styles/common'
import Link from 'next/link'
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

const NavLink = styled.a`
  text-decoration: none;
  color: ${props => props.theme.colors.gray900};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  letter-spacing: 0.3px;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.gray900};
  }
`

export default function Header() {
  return (
    <StyledHeader>
      <HeaderContainer>
        <Logo href="/" scroll={false}>
          <span>Frontend Dev</span>
        </Logo>
        <Nav>
          <NavLink href="/admin/posts/new">New Post</NavLink>
        </Nav>
      </HeaderContainer>
    </StyledHeader>
  )
}
