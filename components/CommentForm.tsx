'use client'

import { useState } from 'react'
import {
  CommentFormWrapper,
  CommentFormTitle,
  CommentTextarea,
  CommentFormFooter,
  CommentCharCount,
  CommentSubmitButton,
  LoginPrompt,
  LoginPromptText,
  LoginButton,
} from '@/styles/comments'

interface CommentFormProps {
  postId: string
  parentId?: string | null
  isReply?: boolean
  isAuthenticated: boolean
  onSubmit: (content: string, parentId?: string | null) => Promise<void>
  onCancel?: () => void
  placeholder?: string
  /** 수정 모드일 때 기존 내용 초기값 */
  initialContent?: string
}

const MAX_LENGTH = 2000

export default function CommentForm({
  postId,
  parentId,
  isReply = false,
  isAuthenticated,
  onSubmit,
  onCancel,
  placeholder,
  initialContent,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || content.length > MAX_LENGTH) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(content.trim(), parentId || undefined)
      setContent('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <CommentFormWrapper>
        <LoginPrompt>
          <LoginPromptText>댓글을 작성하려면 로그인이 필요합니다.</LoginPromptText>
          <LoginButton href="/login">로그인</LoginButton>
        </LoginPrompt>
      </CommentFormWrapper>
    )
  }

  return (
    <CommentFormWrapper>
      {isReply && <CommentFormTitle>대댓글 작성</CommentFormTitle>}
      <form onSubmit={handleSubmit}>
        <CommentTextarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder || '댓글을 입력하세요...'}
          maxLength={MAX_LENGTH}
          required
        />
        <CommentFormFooter>
          <CommentCharCount $isOverLimit={content.length > MAX_LENGTH}>
            {content.length} / {MAX_LENGTH}
          </CommentCharCount>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onCancel && (
              <CommentSubmitButton
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                style={{
                  backgroundColor: 'transparent',
                  color: '#737373',
                  border: '1px solid #d4d4d4',
                }}
              >
                취소
              </CommentSubmitButton>
            )}
            <CommentSubmitButton type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting
                ? initialContent !== undefined
                  ? '수정 중...'
                  : '작성 중...'
                : initialContent !== undefined
                  ? '수정'
                  : isReply
                    ? '대댓글 작성'
                    : '댓글 작성'}
            </CommentSubmitButton>
          </div>
        </CommentFormFooter>
      </form>
    </CommentFormWrapper>
  )
}
