'use client'

import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
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

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
`

const Form = styled.form`
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`

const Hint = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray600};
  margin-top: ${theme.spacing.xs};
`

export default function UserSettingsPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login?redirect=/user/settings')
        return
      }

      try {
        const res = await fetch('/api/user/profile', { credentials: 'same-origin' })
        const json = await res.json()
        if (json.success && json.data?.display_name != null) {
          setDisplayName(json.data.display_name)
        }
      } catch (e) {
        console.warn('Failed to load profile', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName.trim() || null }),
      })

      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || '표시 이름 저장에 실패했습니다.')
      }
      setSuccess('표시 이름이 저장되었습니다. 댓글에 이 이름이 표시됩니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
      router.push('/')
    }
  }

  if (loading) {
    return (
      <>
        <FormContainer>
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>로딩 중...</div>
        </FormContainer>
        <Footer />
      </>
    )
  }

  return (
    <>
      <FormContainer>
        <Title>프로필 설정</Title>
        {success && <SuccessMessage>{success}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="display_name">표시 이름</Label>
            <Input
              id="display_name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="댓글에 표시될 이름을 입력하세요"
              maxLength={100}
              disabled={saving}
              autoComplete="username"
            />
            <Hint>비워두면 댓글에는 &quot;회원&quot;으로 표시됩니다. (최대 100자)</Hint>
          </FormGroup>
          <Button type="submit" $variant="primary" disabled={saving} style={{ width: '100%' }}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </Form>
      </FormContainer>
      <Footer />
    </>
  )
}
