'use client'

import { useState } from 'react'
import {
  CommentItem as StyledCommentItem,
  CommentHeader,
  CommentAvatar,
  CommentAuthorInfo,
  CommentAuthorName,
  CommentMeta,
  CommentContent,
  CommentDeleted,
  CommentEdited,
  CommentActions,
  CommentActionButton,
} from '@/styles/comments'
import ReactionButton from './ReactionButton'
import CommentForm from './CommentForm'
import ReportModal from './ReportModal'
import { formatRelativeTime } from '@/lib/utils/comments'
import type { Comment } from '@/lib/supabase/comments'
import type { ReactionType, ReportReason } from '@/lib/supabase/types'

interface CommentItemProps {
  comment: Comment
  currentUserId: string | null
  postId: string
  onUpdate: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onToggleReaction: (commentId: string, reactionType: ReactionType) => Promise<void>
  onReport: (commentId: string, reason: ReportReason, description?: string) => Promise<void>
  onCreateReply: (content: string, parentId?: string | null) => Promise<void>
  userReactions?: { [commentId: string]: ReactionType }
  isAuthenticated: boolean
}

export default function CommentItem({
  comment,
  currentUserId,
  postId,
  onUpdate,
  onDelete,
  onToggleReaction,
  onReport,
  onCreateReply,
  userReactions,
  isAuthenticated,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = currentUserId === comment.authorId
  const userReaction = userReactions?.[comment.id]

  const handleUpdate = async (content: string) => {
    await onUpdate(comment.id, content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(comment.id)
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReply = async (content: string) => {
    await onCreateReply(content, comment.id)
    setIsReplying(false)
  }

  if (comment.isDeleted) {
    return (
      <StyledCommentItem $depth={comment.depth}>
        <CommentDeleted>[삭제된 댓글입니다]</CommentDeleted>
      </StyledCommentItem>
    )
  }

  return (
    <>
      <StyledCommentItem $depth={comment.depth}>
        <CommentHeader>
          <CommentAvatar $url={comment.authorAvatarUrl} />
          <CommentAuthorInfo>
            <CommentAuthorName>{comment.authorName}</CommentAuthorName>
            <CommentMeta>
              <span>{formatRelativeTime(comment.createdAt)}</span>
              {comment.isEdited && <CommentEdited>(수정됨)</CommentEdited>}
            </CommentMeta>
          </CommentAuthorInfo>
        </CommentHeader>

        {isEditing ? (
          <CommentForm
            postId={postId}
            parentId={comment.parentId}
            isAuthenticated={isAuthenticated}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            placeholder="댓글을 수정하세요..."
            initialContent={comment.content}
          />
        ) : (
          <>
            <CommentContent>{comment.content}</CommentContent>
            <CommentActions>
              <ReactionButton
                commentId={comment.id}
                reactionType="like"
                count={comment.likeCount}
                isActive={userReaction === 'like'}
                onToggle={onToggleReaction}
              />
              <ReactionButton
                commentId={comment.id}
                reactionType="dislike"
                count={comment.dislikeCount}
                isActive={userReaction === 'dislike'}
                onToggle={onToggleReaction}
              />
              {isAuthenticated && (
                <>
                  <CommentActionButton onClick={() => setIsReplying(!isReplying)}>
                    답글 {comment.replyCount > 0 && `(${comment.replyCount})`}
                  </CommentActionButton>
                  {isAuthor && (
                    <>
                      <CommentActionButton onClick={() => setIsEditing(true)}>
                        수정
                      </CommentActionButton>
                      <CommentActionButton onClick={handleDelete} disabled={isDeleting}>
                        삭제
                      </CommentActionButton>
                    </>
                  )}
                  {!isAuthor && (
                    <CommentActionButton onClick={() => setShowReportModal(true)}>
                      신고
                    </CommentActionButton>
                  )}
                </>
              )}
            </CommentActions>
            {isReplying && (
              <div style={{ marginTop: '16px' }}>
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  isReply
                  isAuthenticated={isAuthenticated}
                  onSubmit={handleReply}
                  onCancel={() => setIsReplying(false)}
                  placeholder="대댓글을 입력하세요..."
                />
              </div>
            )}
          </>
        )}
      </StyledCommentItem>

      <ReportModal
        commentId={comment.id}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={onReport}
      />
    </>
  )
}
