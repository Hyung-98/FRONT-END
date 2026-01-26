'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};
`

const ErrorTitle = styled.h1`
  font-size: ${theme.typography.fontSize['5xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.lg};
`

const ErrorMessage = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.gray600};
  margin-bottom: ${theme.spacing['2xl']};
  max-width: 600px;
`

const ErrorButton = styled(Link)`
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

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 서비스에 에러 전송
    console.error('Application error:', error)
  }, [error])

  return (
    <>
      <Header />
      <ErrorContainer>
        <ErrorTitle>오류가 발생했습니다</ErrorTitle>
        <ErrorMessage>예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</ErrorMessage>
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <ErrorButton href="/" onClick={reset}>
            다시 시도
          </ErrorButton>
          <ErrorButton href="/">홈으로 돌아가기</ErrorButton>
        </div>
      </ErrorContainer>
      <Footer />
    </>
  )
}
