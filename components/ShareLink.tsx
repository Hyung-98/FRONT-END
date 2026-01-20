'use client'

import { theme } from '@/styles/theme'
import Link from 'next/link'
import styled from 'styled-components'

const ShareLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray200};
  border-radius: ${theme.borderRadius.lg};
  text-decoration: none;
  color: ${theme.colors.gray700};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.transitions.fast};

  &:hover {
    background-color: ${theme.colors.gray50};
    border-color: ${theme.colors.gray300};
    color: ${theme.colors.gray900};
  }
`

interface ShareLinkProps {
  href: string
  children: React.ReactNode
}
export default function ShareLinkComponent({ href, children }: ShareLinkProps): JSX.Element {
  return <ShareLink href={href} target="_blank" rel="noopener noreferrer">{children}</ShareLink>
}