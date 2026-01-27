'use client'

import { theme } from '@/styles/theme'
import Link from 'next/link'
import { useState } from 'react'
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

  &:focus-visible {
    outline: 2px solid ${theme.colors.blue500};
    outline-offset: 2px;
  }
`

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray200};
  border-radius: ${theme.borderRadius.lg};
  background: none;
  cursor: pointer;
  color: ${theme.colors.gray700};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.transitions.fast};
  width: 100%;
  text-align: left;

  &:hover {
    background-color: ${theme.colors.gray50};
    border-color: ${theme.colors.gray300};
    color: ${theme.colors.gray900};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.blue500};
    outline-offset: 2px;
  }
`

interface ShareLinkProps {
  href: string
  children: React.ReactNode
  'aria-label'?: string
  onClick?: () => void
  isButton?: boolean
}

export default function ShareLinkComponent({
  href,
  children,
  'aria-label': ariaLabel,
  onClick,
  isButton = false,
}: ShareLinkProps): JSX.Element {
  if (isButton) {
    return (
      <ShareButton onClick={onClick} aria-label={ariaLabel} type="button">
        {children}
      </ShareButton>
    )
  }

  return (
    <ShareLink href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
      {children}
    </ShareLink>
  )
}
