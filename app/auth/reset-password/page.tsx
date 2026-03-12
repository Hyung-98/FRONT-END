'use client'

import CenteredLayout from '@/components/CenteredLayout'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/types/errors'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  ErrorMessage,
  FormContainer,
  FormGroup,
  Input,
  Label,
  SuccessMessage,
} from '../../admin/detail-styles'

const supabase = createClient()

const PageForm = styled.form`
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
`

const PasswordHint = styled.small`
  color: ${theme.colors.gray500};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`

const BackLink = styled(Link)`
  display: block;
  max-width: 400px;
  margin: ${theme.spacing.lg} auto 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray600};
  text-align: center;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.gray900};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.blue500 || '#3b82f6'};
    outline-offset: 2px;
    border-radius: ${theme.borderRadius.sm};
  }
`

type PageState = 'loading' | 'form' | 'success' | 'invalid'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 이메일 복구 링크(코드 교환 방식)에서는 PASSWORD_RECOVERY 대신 SIGNED_IN이 먼저 발생할 수 있음.
  // 이 페이지 자체가 복구 콜백 URL이므로 두 이벤트 모두 폼 표시로 처리.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setPageState('form')
      }
    })

    // 타임아웃 내 이벤트가 없으면 링크 만료로 처리
    const timer = setTimeout(() => {
      setPageState(prev => (prev === 'loading' ? 'invalid' : prev))
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        throw new Error(translateAuthError(updateError.message))
      }

      // 비밀번호 변경 후 세션 종료 — 사용자가 직접 로그인하도록 유도
      await supabase.auth.signOut()

      setPageState('success')
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <CenteredLayout>
        <FormContainer>
          <Title>비밀번호 재설정</Title>
          <p style={{ textAlign: 'center', color: theme.colors.gray600 }}>
            인증 링크를 확인하는 중...
          </p>
        </FormContainer>
      </CenteredLayout>
    )
  }

  if (pageState === 'invalid') {
    return (
      <CenteredLayout>
        <FormContainer>
          <Title>링크가 만료됐습니다</Title>
          <ErrorMessage role="alert" style={{ textAlign: 'center' }}>
            재설정 링크가 유효하지 않거나 만료됐습니다.
            <br />
            비밀번호 찾기를 다시 시도해주세요.
          </ErrorMessage>
          <BackLink href="/forgot-password">비밀번호 찾기로 돌아가기</BackLink>
        </FormContainer>
      </CenteredLayout>
    )
  }

  if (pageState === 'success') {
    return (
      <CenteredLayout>
        <FormContainer>
          <Title>비밀번호 변경 완료</Title>
          <SuccessMessage role="status">
            <strong>비밀번호가 성공적으로 변경됐습니다.</strong>
            <br />
            잠시 후 로그인 페이지로 이동합니다.
          </SuccessMessage>
          <BackLink href="/login">지금 로그인하기</BackLink>
        </FormContainer>
      </CenteredLayout>
    )
  }

  return (
    <CenteredLayout>
      <FormContainer>
        <Title>새 비밀번호 설정</Title>

        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        <PageForm onSubmit={handleSubmit} noValidate>
          <FormGroup>
            <Label htmlFor="password">새 비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
            />
            <PasswordHint>비밀번호는 최소 6자 이상이어야 합니다.</PasswordHint>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
            />
          </FormGroup>

          <Button
            type="submit"
            $variant="primary"
            disabled={loading || !password || !confirmPassword}
            style={{ width: '100%' }}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </PageForm>
      </FormContainer>
    </CenteredLayout>
  )
}
