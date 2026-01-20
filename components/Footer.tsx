'use client'

import styled from 'styled-components'
import { Container } from '@/styles/common'

const StyledFooter = styled.footer`
  background-color: ${props => props.theme.colors.gray900};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.lg} ${props => props.theme.spacing['2xl']};

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing['2xl']} ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  }
`

const FooterContainer = styled(Container)``

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    text-align: center;
  }
`

const Logo = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.white};
`

const Copyright = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.5);
`

export default function Footer() {
  return (
    <StyledFooter>
      <FooterContainer>
        <Bottom>
          <Logo>Frontend Dev</Logo>
          <Copyright>©2025 Frontend Dev. All rights reserved.</Copyright>
        </Bottom>
      </FooterContainer>
    </StyledFooter>
  )
}
