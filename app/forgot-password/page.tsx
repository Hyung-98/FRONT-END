'use client'

import CenteredLayout from '@/components/CenteredLayout'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/types/errors'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
import Link from 'next/link'
import { useState } from 'react'
import styled from 'styled-components'
import {
  ErrorMessage,
  FormContainer,
  FormGroup,
  Input,
  Label,
  SuccessMessage,
} from '../admin/detail-styles'

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
  margin-bottom: ${theme.spacing.md};
`

const Description = styled.p`
  max-width: 400px;
  margin: 0 auto ${theme.spacing['2xl']};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray600};
  text-align: center;
  line-height: ${theme.typography.lineHeight.relaxed};
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (authError) {
        throw new Error(translateAuthError(authError.message))
      }

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '이메일 전송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CenteredLayout>
      <FormContainer>
        <Title>비밀번호 찾기</Title>
        <Description>
          가입 시 사용한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
        </Description>

        {success ? (
          <>
            <SuccessMessage role="status">
              <strong>이메일을 전송했습니다.</strong>
              <br />
              받은 편지함을 확인하고 링크를 클릭해 비밀번호를 재설정하세요.
              <br />
              이메일이 보이지 않으면 스팸 폴더도 확인해주세요.
            </SuccessMessage>
            <BackLink href="/login">← 로그인 페이지로 돌아가기</BackLink>
          </>
        ) : (
          <>
            {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
            <PageForm onSubmit={handleSubmit} noValidate>
              <FormGroup>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </FormGroup>

              <Button
                type="submit"
                $variant="primary"
                disabled={loading || !email.trim()}
                style={{ width: '100%' }}
              >
                {loading ? '전송 중...' : '재설정 링크 전송'}
              </Button>
            </PageForm>
            <BackLink href="/login">← 로그인 페이지로 돌아가기</BackLink>
          </>
        )}
      </FormContainer>
    </CenteredLayout>
  )
}
