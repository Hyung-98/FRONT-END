import Link from 'next/link'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};
`

const NotFoundTitle = styled.h1`
  font-size: ${theme.typography.fontSize['5xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.lg};
`

const NotFoundSubtitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray700};
  margin-bottom: ${theme.spacing.md};
`

const NotFoundMessage = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.gray600};
  margin-bottom: ${theme.spacing['2xl']};
  max-width: 600px;
`

const NotFoundButton = styled(Link)`
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

export default function NotFound() {
  return (
    <>
      <Header />
      <NotFoundContainer>
        <NotFoundTitle>404</NotFoundTitle>
        <NotFoundSubtitle>페이지를 찾을 수 없습니다</NotFoundSubtitle>
        <NotFoundMessage>
          요청하신 페이지가 존재하지 않습니다. URL을 확인하시거나 홈으로 돌아가주세요.
        </NotFoundMessage>
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <NotFoundButton href="/">홈으로 돌아가기</NotFoundButton>
          <NotFoundButton href="/search">검색하기</NotFoundButton>
        </div>
      </NotFoundContainer>
      <Footer />
    </>
  )
}
