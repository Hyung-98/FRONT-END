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

export default function DetailHeader({ slug }: { slug: string }) {
  return (
    <StyledHeader>
      <HeaderContainer>
        <Logo href="/" scroll={false}>
          Frontend Dev
        </Logo>
      </HeaderContainer>
    </StyledHeader>
  )
}
