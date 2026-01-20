'use client'

import { ButtonLink, Container } from '@/styles/common'
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
  max-width: 1400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  padding: 0 40px;

  @media (max-width: 1024px) {
    padding: 0 ${props => props.theme.spacing.lg};
  }

  @media (max-width: 768px) {
    height: 70px;
    padding: 0 20px;
  }
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-decoration: none;
  color: ${props => props.theme.colors.gray900};
  font-size: 22px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  letter-spacing: -0.5px;
  transition: opacity ${props => props.theme.transitions.fast};

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 40px;
  flex: 1;
  justify-content: center;

  @media (max-width: 1024px) {
    gap: ${props => props.theme.spacing.lg};
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const NavLink = styled.a`
  text-decoration: none;
  color: ${props => props.theme.colors.gray700};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  letter-spacing: 0.3px;
  text-transform: uppercase;
  transition: color ${props => props.theme.transitions.fast};
  position: relative;
  padding: ${props => props.theme.spacing.sm} 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: ${props => props.theme.colors.gray900};
    transition: width ${props => props.theme.transitions.normal} ease;
  }

  &:hover {
    color: ${props => props.theme.colors.gray900};
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`

const DetailButton = styled(ButtonLink)`
  border-radius: 0;
  font-size: 13px;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 2px solid ${props => props.theme.colors.gray900};

  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`

export default function DetailHeader() {
  return (
    <StyledHeader >
      <HeaderContainer>
        <Logo href="/" scroll={false}>Frontend Dev</Logo>
        {/* <Nav>
          <NavLink href="/">Home</NavLink>
          <NavLink href="#">Case Studies</NavLink>
          <NavLink href="#">Services</NavLink>
          <NavLink href="#">About</NavLink>
          <NavLink href="#">News</NavLink>
          <NavLink href="#">Pages</NavLink>
        </Nav> */}
        <Actions>
          <DetailButton href="/admin/posts/new" $variant="primary">New Post</DetailButton>
        </Actions>
      </HeaderContainer>
    </StyledHeader>
  )
}
