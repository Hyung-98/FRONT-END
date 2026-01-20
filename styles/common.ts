import Link from 'next/link'
import styled, { css } from 'styled-components'
import { theme } from './theme'

// Container
export const Container = styled.div<{ maxWidth?: string }>`
  max-width: ${({ maxWidth }) => maxWidth || '1280px'};
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`

// Typography
export const Heading1 = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  line-height: 1.2;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 32px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`

export const Heading2 = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  line-height: 1.3;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`

export const Heading3 = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  line-height: 1.4;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`

export const Heading4 = styled.h4`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  line-height: 1.4;
  margin-bottom: 12px;
`

export const BodyText = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: ${theme.colors.gray700};
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`

export const SmallText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${theme.colors.gray600};
`

// Button
export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 12px 24px;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background-color: ${props.theme.colors.gray900};
          color: ${props.theme.colors.white};
          border: 2px solid ${props.theme.colors.gray900};

          &:hover {
            background-color: transparent;
            color: ${props.theme.colors.gray900};
          }
        `
      case 'secondary':
        return css`
          background-color: ${props.theme.colors.gray100};
          color: ${props.theme.colors.gray700};
          border: 1px solid ${props.theme.colors.gray300};

          &:hover {
            background-color: ${props.theme.colors.gray200};
            color: ${props.theme.colors.gray900};
          }
        `
      case 'outline':
        return css`
          background-color: transparent;
          color: ${props.theme.colors.white};
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
        `
      default:
        return css`
          background-color: ${props.theme.colors.gray900};
          color: ${props.theme.colors.white};
        `
    }
  }}

  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: ${theme.typography.fontSize.xs};
  }
`

export const ButtonLink = styled(Link)<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 12px 24px;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background-color: ${props.theme.colors.gray900};
          color: ${props.theme.colors.white};
          border: 2px solid ${props.theme.colors.gray900};

          &:hover {
            background-color: transparent;
            color: ${props.theme.colors.gray900};
          }
        `
      case 'secondary':
        return css`
          background-color: ${props.theme.colors.gray100};
          color: ${props.theme.colors.gray700};
          border: 1px solid ${props.theme.colors.gray300};

          &:hover {
            background-color: ${props.theme.colors.gray200};
            color: ${props.theme.colors.gray900};
          }
        `
      case 'outline':
        return css`
          background-color: transparent;
          color: ${props.theme.colors.white};
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
        `
      default:
        return css`
          background-color: ${props.theme.colors.gray900};
          color: ${props.theme.colors.white};
        `
    }
  }}

  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: ${theme.typography.fontSize.xs};
  }
`

// Link
export const StyledLink = styled(Link)`
  text-decoration: none;
  color: ${theme.colors.gray600};
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.gray900};
  }
`

// Card
export const Card = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.gray200};
  overflow: hidden;
  transition: transform ${theme.transitions.fast},
    box-shadow ${theme.transitions.fast};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
  }
`

// Grid
export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: ${props =>
    props.columns
      ? `repeat(${props.columns}, 1fr)`
      : 'repeat(auto-fill, minmax(360px, 1fr))'};
  gap: ${({ gap }) => gap || '32px'};

  @media (max-width: 1024px) {
    grid-template-columns: ${props =>
      props.columns ? `repeat(${props.columns}, 1fr)` : 'repeat(auto-fill, minmax(300px, 1fr))'};
    gap: 24px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`

// Flex
export const Flex = styled.div<{
  direction?: 'row' | 'column'
  align?: 'center' | 'flex-start' | 'flex-end' | 'stretch'
  justify?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around'
  gap?: string
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  gap: ${({ gap }) => gap || '0'};
`

// Section
export const Section = styled.section`
  margin-bottom: ${theme.spacing['4xl']};

  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing['3xl']};
  }
`

// Badge
export const Badge = styled.span<{ $category?: 'javascript' | 'react' | 'typescript' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: 12px;

  ${props => {
    if (props.$category === 'javascript') {
      return css`
        background-color: rgba(238, 230, 21, 1);
        color: ${props.theme.colors.gray900};
      `
    }
    if (props.$category === 'react') {
      return css`
        background-color: rgba(97, 218, 251, 1);
        color: ${props.theme.colors.gray900};
      `
    }
    if (props.$category === 'typescript') {
      return css`
        background-color: rgba(49, 120, 198, 1);
        color: ${props.theme.colors.gray900};
      `
    }
    return css`
      background-color: ${props.theme.colors.gray100};
      color: ${props.theme.colors.gray700};
    `
  }}
`
