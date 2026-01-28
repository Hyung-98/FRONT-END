'use client'

import { useState } from 'react'
import {
  ReportModal as StyledReportModal,
  ReportModalContent,
  ReportModalTitle,
  ReportModalSelect,
  ReportModalTextarea,
  ReportModalActions,
  ReportModalButton,
} from '@/styles/comments'
import type { ReportReason } from '@/lib/supabase/types'

interface ReportModalProps {
  commentId: string
  isOpen: boolean
  onClose: () => void
  onReport: (commentId: string, reason: ReportReason, description?: string) => Promise<void>
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: '스팸' },
  { value: 'offensive', label: '욕설/비방' },
  { value: 'harassment', label: '괴롭힘' },
  { value: 'misinformation', label: '잘못된 정보' },
  { value: 'violence', label: '폭력적 내용' },
  { value: 'hate_speech', label: '혐오 발언' },
  { value: 'other', label: '기타' },
]

export default function ReportModal({ commentId, isOpen, onClose, onReport }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('spam')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason) return

    setIsSubmitting(true)
    try {
      await onReport(commentId, reason, description.trim() || undefined)
      onClose()
      setReason('spam')
      setDescription('')
    } catch (error) {
      console.error('Failed to report comment:', error)
      alert('신고 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <StyledReportModal onClick={handleBackdropClick}>
      <ReportModalContent>
        <ReportModalTitle>댓글 신고</ReportModalTitle>
        <ReportModalSelect value={reason} onChange={e => setReason(e.target.value as ReportReason)}>
          {REPORT_REASONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ReportModalSelect>
        <ReportModalTextarea
          placeholder="신고 사유를 자세히 설명해주세요 (선택사항)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={500}
        />
        <ReportModalActions>
          <ReportModalButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
            취소
          </ReportModalButton>
          <ReportModalButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            신고하기
          </ReportModalButton>
        </ReportModalActions>
      </ReportModalContent>
    </StyledReportModal>
  )
}
