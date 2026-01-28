'use client'

import { useState } from 'react'
import { ReactionButton as StyledReactionButton, ReactionCount } from '@/styles/comments'
import type { ReactionType } from '@/lib/supabase/types'

interface ReactionButtonProps {
  commentId: string
  reactionType: ReactionType
  count: number
  isActive: boolean
  onToggle: (commentId: string, reactionType: ReactionType) => Promise<void>
}

export default function ReactionButton({
  commentId,
  reactionType,
  count,
  isActive,
  onToggle,
}: ReactionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await onToggle(commentId, reactionType)
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const emoji = reactionType === 'like' ? '👍' : '👎'

  return (
    <StyledReactionButton
      onClick={handleClick}
      $isActive={isActive}
      disabled={isLoading}
      aria-label={`${reactionType === 'like' ? '좋아요' : '싫어요'} ${count}개`}
    >
      <span>{emoji}</span>
      <ReactionCount>{count}</ReactionCount>
    </StyledReactionButton>
  )
}
