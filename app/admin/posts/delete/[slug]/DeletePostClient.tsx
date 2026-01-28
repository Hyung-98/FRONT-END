'use client'

import AdminNav from '@/components/AdminNav'
import Footer from '@/components/Footer'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ButtonGroup, ErrorMessage, FormContainer, SuccessMessage } from '../../../detail-styles'

const WarningBox = styled.div`
  background-color: ${theme.colors.red50 || '#fef2f2'};
  border: 2px solid ${theme.colors.red200 || '#fecaca'};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing['2xl']};
  margin-bottom: ${theme.spacing['2xl']};
`

const WarningTitle = styled.h2`
  color: ${theme.colors.red700 || '#b91c1c'};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing.md};
`

const WarningText = styled.p`
  color: ${theme.colors.red600 || '#dc2626'};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-bottom: ${theme.spacing.md};
`

const PostInfo = styled.div`
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray200};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing['2xl']};
`

const PostInfoTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.md};
`

const PostInfoItem = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.gray700};
`

const PostInfoLabel = styled.span`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
  min-width: 100px;
`

const PostInfoValue = styled.span`
  color: ${theme.colors.gray700};
`

export default function DeletePostClient() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [postData, setPostData] = useState<{
    title: string
    date: string
    category: string
  } | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/rest/posts/${slug}`)

        if (!res.ok) {
          throw new Error('포스트를 불러오는데 실패했습니다.')
        }

        const data = await res.json()
        setPostData({
          title: data.title || '',
          date: data.date || '',
          category: data.category || '',
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : '포스트를 불러오는데 실패했습니다.')
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  const handleDelete = async () => {
    if (!confirm('정말로 이 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/rest/posts/${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '포스트 삭제에 실패했습니다.')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AdminNav />
      <FormContainer>
        <h1 style={{ marginBottom: theme.spacing['2xl'] }}>포스트 삭제</h1>

        {success && (
          <SuccessMessage>포스트가 성공적으로 삭제되었습니다. 홈으로 이동합니다...</SuccessMessage>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <WarningBox>
          <WarningTitle>⚠️ 경고</WarningTitle>
          <WarningText>
            이 작업은 되돌릴 수 없습니다. 포스트를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
          </WarningText>
        </WarningBox>

        {postData && (
          <PostInfo>
            <PostInfoTitle>삭제할 포스트 정보</PostInfoTitle>
            <PostInfoItem>
              <PostInfoLabel>제목:</PostInfoLabel>
              <PostInfoValue>{postData.title}</PostInfoValue>
            </PostInfoItem>
            <PostInfoItem>
              <PostInfoLabel>날짜:</PostInfoLabel>
              <PostInfoValue>{postData.date}</PostInfoValue>
            </PostInfoItem>
            <PostInfoItem>
              <PostInfoLabel>카테고리:</PostInfoLabel>
              <PostInfoValue>{postData.category}</PostInfoValue>
            </PostInfoItem>
          </PostInfo>
        )}

        <ButtonGroup>
          <Button
            type="button"
            $variant="secondary"
            onClick={() => router.back()}
            disabled={loading || success}
          >
            취소
          </Button>
          <Button
            type="button"
            $variant="primary"
            onClick={handleDelete}
            disabled={loading || success}
            style={{
              backgroundColor: theme.colors.red500 || '#ef4444',
              borderColor: theme.colors.red500 || '#ef4444',
            }}
          >
            {loading ? '삭제 중...' : '삭제'}
          </Button>
        </ButtonGroup>
      </FormContainer>
      <Footer />
    </>
  )
}
