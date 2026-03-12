'use client'

import CenteredLayout from '@/components/CenteredLayout'
import LoginSuccessAnimation from '@/components/LoginSuccessAnimation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/types/errors'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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

const LoginForm = styled.form`
  max-width: 700px;
  width: 100%;
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

const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing['lg']};
  border-bottom: 2px solid ${theme.colors.gray200};
`

const Tab = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => (props.$active ? theme.colors.gray900 : 'transparent')};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${props =>
    props.$active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  color: ${props => (props.$active ? theme.colors.gray900 : theme.colors.gray600)};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  margin-bottom: -2px;

  &:hover {
    color: ${theme.colors.gray900};
  }
`

const InfoBox = styled.div`
  background-color: ${theme.colors.blue50 || '#eff6ff'};
  border: 1px solid ${theme.colors.blue200 || '#bfdbfe'};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.blue700 || '#1e40af'};
  margin-bottom: ${theme.spacing.lg};
`

const PasswordHint = styled.small`
  color: ${theme.colors.gray500};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`

const ForgotPasswordLink = styled(Link)`
  align-self: flex-end;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray500};
  text-decoration: none;

  &:hover {
    color: ${theme.colors.gray900};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.blue500 || '#3b82f6'};
    outline-offset: 2px;
    border-radius: ${theme.borderRadius.sm};
  }
`

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showAnimation, setShowAnimation] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string>('/')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signup') {
        // 비밀번호 확인
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }

        // 비밀번호 최소 길이 확인
        if (password.length < 6) {
          throw new Error('비밀번호는 최소 6자 이상이어야 합니다.')
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })

        if (authError) {
          throw new Error(translateAuthError(authError.message))
        }

        if (data.user) {
          // 프로필 생성: DB 트리거(profiles_on_signup_trigger.sql)가 있으면 자동 생성됨.
          // 이메일 미확인 시 세션이 없어 API 호출은 실패할 수 있으므로, 트리거 배포를 권장.
          if (data.session) {
            try {
              const response = await fetch('/api/user/profile', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: data.user.id, role: 'user' }),
              })
              if (!response.ok) console.warn('Failed to create profile via API')
            } catch (e) {
              console.warn('Profile API call failed:', e)
            }
          }

          setSuccess('회원가입이 완료되었습니다! 이메일 확인 후 로그인해주세요.')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          // 이메일 확인이 필요한 경우를 위해 잠시 후 로그인 모드로 전환
          setTimeout(() => {
            setMode('login')
            setSuccess(null)
          }, 3000)
        }
      } else {
        // 로그인
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          throw new Error(translateAuthError(authError.message))
        }

        if (data.session) {
          // Store redirect destination
          const redirect = searchParams.get('redirect') || '/'
          setRedirectUrl(redirect)

          // Trigger animation overlay
          setShowAnimation(true)
          // Navigation happens after animation completes
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : mode === 'signup'
            ? '회원가입에 실패했습니다.'
            : '로그인에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CenteredLayout>
        <FormContainer>
          <Title>{mode === 'login' ? '로그인' : '회원가입'}</Title>

          <TabContainer role="tablist" aria-label="인증 방식 선택">
            <Tab
              role="tab"
              id="tab-login"
              aria-selected={mode === 'login'}
              aria-controls="panel-auth"
              $active={mode === 'login'}
              onClick={() => {
                setMode('login')
                setError(null)
                setSuccess(null)
              }}
            >
              로그인
            </Tab>
            <Tab
              role="tab"
              id="tab-signup"
              aria-selected={mode === 'signup'}
              aria-controls="panel-auth"
              $active={mode === 'signup'}
              onClick={() => {
                setMode('signup')
                setError(null)
                setSuccess(null)
              }}
            >
              회원가입
            </Tab>
          </TabContainer>

          <div
            role="tabpanel"
            id="panel-auth"
            aria-labelledby={mode === 'login' ? 'tab-login' : 'tab-signup'}
          >
            {mode === 'signup' && (
              <InfoBox>
                <strong>참고:</strong> 회원가입 후 이메일 확인이 필요할 수 있습니다. Supabase
                대시보드에서 이메일 확인 설정을 확인해주세요.
              </InfoBox>
            )}

            {success && <SuccessMessage>{success}</SuccessMessage>}
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <LoginForm onSubmit={handleSubmit}>
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
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  minLength={mode === 'signup' ? 6 : undefined}
                />
                {mode === 'signup' && (
                  <PasswordHint>비밀번호는 최소 6자 이상이어야 합니다.</PasswordHint>
                )}
                {mode === 'login' && (
                  <ForgotPasswordLink href="/forgot-password">비밀번호 찾기</ForgotPasswordLink>
                )}
              </FormGroup>

              {mode === 'signup' && (
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
                  />
                </FormGroup>
              )}

              <Button type="submit" $variant="primary" disabled={loading} style={{ width: '100%' }}>
                {loading
                  ? mode === 'signup'
                    ? '회원가입 중...'
                    : '로그인 중...'
                  : mode === 'signup'
                    ? '회원가입'
                    : '로그인'}
              </Button>
            </LoginForm>
          </div>
        </FormContainer>
      </CenteredLayout>
      {showAnimation && (
        <LoginSuccessAnimation
          message="로그인 성공!"
          onComplete={() => {
            router.push(redirectUrl)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
