/**
 * 스킵 네비게이션 링크 컴포넌트
 * 키보드 사용자가 메인 콘텐츠로 바로 이동할 수 있도록 함
 */

import Link from 'next/link'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const SkipLink = styled(Link)`
  position: absolute;
  top: -100px;
  left: 0;
  z-index: 1000;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${theme.colors.gray900};
  color: ${theme.colors.white};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: 0 0 ${theme.borderRadius.md} 0;
  transition: top ${theme.transitions.fast};

  &:focus {
    top: 0;
    outline: 2px solid ${theme.colors.blue500};
    outline-offset: -2px;
  }
`

export default function SkipLinkComponent() {
  return <SkipLink href="#main-content">메인 콘텐츠로 건너뛰기</SkipLink>
}
