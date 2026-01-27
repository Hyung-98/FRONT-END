'use client'

import ShareLinkComponent from '@/components/ShareLink'
import {
  copyToClipboard,
  getFacebookShareUrl,
  getLinkedInShareUrl,
  getTwitterShareUrl,
} from '@/lib/utils/share'
import { ShareLinks } from '@/app/styles'
import { theme } from '@/styles/theme'
import { useState } from 'react'
import styled from 'styled-components'

const Toast = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  background-color: ${theme.colors.gray900};
  color: ${theme.colors.white};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: ${props => (props.$show ? 1 : 0)};
  transform: ${props => (props.$show ? 'translateY(0)' : 'translateY(20px)')};
  transition: all ${theme.transitions.fast};
  pointer-events: ${props => (props.$show ? 'auto' : 'none')};
  z-index: 1000;

  @media (max-width: 768px) {
    bottom: ${theme.spacing.md};
    right: ${theme.spacing.md};
    left: ${theme.spacing.md};
  }
`

interface ShareSectionProps {
  url: string
  title: string
  description?: string
}

export default function ShareSection({ url, title, description }: ShareSectionProps) {
  const [showToast, setShowToast] = useState(false)

  const handleCopyLink = async () => {
    const success = await copyToClipboard(url)
    if (success) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }
  }

  const shareData = { url, title, description }

  return (
    <>
      <ShareLinks role="list" aria-label="공유 링크">
        <ShareLinkComponent href={getTwitterShareUrl(shareData)} aria-label="Twitter에서 공유">
          <span>TWITTER</span>
        </ShareLinkComponent>
        <ShareLinkComponent href={getFacebookShareUrl(shareData)} aria-label="Facebook에서 공유">
          <span>FACEBOOK</span>
        </ShareLinkComponent>
        <ShareLinkComponent href={getLinkedInShareUrl(shareData)} aria-label="LinkedIn에서 공유">
          <span>LINKEDIN</span>
        </ShareLinkComponent>
        <ShareLinkComponent
          href="#"
          onClick={handleCopyLink}
          isButton={true}
          aria-label="링크 복사"
        >
          <span>링크 복사</span>
        </ShareLinkComponent>
      </ShareLinks>
      <Toast $show={showToast}>링크가 클립보드에 복사되었습니다!</Toast>
    </>
  )
}
