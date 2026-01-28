import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { theme } from '@/styles/theme'
import type { Metadata } from 'next'
import Link from 'next/link'
import styled from 'styled-components'

export const metadata: Metadata = {
  title: '권한 필요',
  description: '새로운 포스트 작성은 관리자만 가능합니다.',
}

const AdminRequiredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};
`

const AdminRequiredTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.lg};
`

const AdminRequiredMessage = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.gray600};
  margin-bottom: ${theme.spacing['2xl']};
  max-width: 480px;
  line-height: ${theme.typography.lineHeight.relaxed};
`

const HomeButton = styled(Link)`
  display: inline-block;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.gray900};
  color: ${theme.colors.white};
  text-decoration: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: background-color ${theme.transitions.normal};

  &:hover {
    background-color: ${theme.colors.gray800};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.blue500};
    outline-offset: 2px;
  }
`

export default function AdminRequiredPage() {
  return (
    <>
      <Header />
      <AdminRequiredContainer>
        <AdminRequiredTitle>권한이 필요합니다</AdminRequiredTitle>
        <AdminRequiredMessage>
          새로운 포스트 작성은 관리자만 가능합니다. 다른 기능은 홈에서 이용해 주세요.
        </AdminRequiredMessage>
        <HomeButton href="/">홈으로 이동</HomeButton>
      </AdminRequiredContainer>
      <Footer />
    </>
  )
}
