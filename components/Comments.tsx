'use client'

import { createClient } from '@/lib/supabase/client'
import type { Comment } from '@/lib/supabase/comments'
import type { ReactionType, ReportReason } from '@/lib/supabase/types'
import { buildCommentTree } from '@/lib/utils/comments'
import {
  CommentsCount,
  CommentsHeader,
  CommentsList,
  CommentsSection,
  CommentsTitle,
  ErrorMessage,
  LoadingSpinner,
} from '@/styles/comments'
import { useCallback, useEffect, useState } from 'react'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface CommentsProps {
  postId: string
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [userReactions, setUserReactions] = useState<{ [commentId: string]: ReactionType }>({})

  const checkAuth = useCallback(async () => {
    const s = createClient()
    const {
      data: { user },
    } = await s.auth.getUser()
    setCurrentUser(user ? { id: user.id } : null)
  }, [])

  const loadComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/rest/comments?postId=${postId}`, {
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to load comments')
      setComments(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    loadComments()
    checkAuth()
  }, [postId, loadComments, checkAuth])

  // 댓글 실시간 반영: INSERT/UPDATE/DELETE 시 목록 갱신 (다른 탭/사용자 작성분 포함)
  useEffect(() => {
    const client = createClient()
    const channel = client
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          loadComments()
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
    // postId 변경 시에만 구독 재설정. loadComments는 클로저로 최신 상태를 사용함.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const loadUserReactions = useCallback(async () => {
    if (!currentUser) {
      setUserReactions({})
      return
    }
    try {
      const response = await fetch(`/api/rest/comments/reactions?postId=${postId}`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!data.success) {
        setUserReactions({})
        return
      }
      setUserReactions((data.data ?? {}) as { [commentId: string]: ReactionType })
    } catch (err) {
      console.error('Failed to load user reactions:', err)
      setUserReactions({})
    }
  }, [currentUser, postId])

  useEffect(() => {
    if (currentUser) {
      loadUserReactions()
    } else {
      setUserReactions({})
    }
  }, [currentUser, comments, loadUserReactions])

  const handleCreateComment = async (content: string, parentId?: string | null) => {
    try {
      const response = await fetch('/api/rest/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content,
          parentId: parentId || null,
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create comment')
      }

      // 댓글 목록 새로고침 (캐시 무시하고 최신 목록 조회)
      await loadComments()
      if (currentUser) {
        await loadUserReactions()
      }
    } catch (err) {
      throw err
    }
  }

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/rest/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update comment')
      }

      await loadComments()
    } catch (err) {
      throw err
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/rest/comments/${commentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete comment')
      }

      await loadComments()
    } catch (err) {
      throw err
    }
  }

  const handleToggleReaction = async (commentId: string, reactionType: ReactionType) => {
    try {
      const response = await fetch(`/api/rest/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle reaction')
      }

      const { action, from, to } = data.data as {
        action: 'added' | 'removed' | 'changed'
        reaction: ReactionType
        from?: ReactionType
        to?: ReactionType
      }

      // 사용자 반응 상태 반영 (버튼 활성화)
      if (action === 'removed') {
        setUserReactions(prev => {
          const next = { ...prev }
          delete next[commentId]
          return next
        })
      } else {
        setUserReactions(prev => ({ ...prev, [commentId]: reactionType }))
      }

      // 해당 댓글의 like/dislike 카운트만 로컬 갱신 (전체 loadComments 호출 제거로 깜빡임 방지)
      setComments(prev =>
        prev.map(c => {
          if (c.id !== commentId) return c
          let likeCount = c.likeCount
          let dislikeCount = c.dislikeCount
          if (action === 'added') {
            if (reactionType === 'like') likeCount += 1
            else dislikeCount += 1
          } else if (action === 'removed') {
            if (reactionType === 'like') likeCount = Math.max(0, likeCount - 1)
            else dislikeCount = Math.max(0, dislikeCount - 1)
          } else if (action === 'changed' && from && to) {
            if (from === 'like') likeCount = Math.max(0, likeCount - 1)
            else dislikeCount = Math.max(0, dislikeCount - 1)
            if (to === 'like') likeCount += 1
            else dislikeCount += 1
          }
          return { ...c, likeCount, dislikeCount }
        })
      )
    } catch (err) {
      throw err
    }
  }

  const handleReportComment = async (
    commentId: string,
    reason: ReportReason,
    description?: string
  ) => {
    try {
      const response = await fetch(`/api/rest/comments/${commentId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, description }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to report comment')
      }

      alert('신고가 접수되었습니다.')
    } catch (err) {
      throw err
    }
  }

  const commentTree = buildCommentTree(comments)

  const renderCommentTree = (nodes: ReturnType<typeof buildCommentTree>) => {
    return nodes.map(node => (
      <div key={node.comment.id}>
        <CommentItem
          comment={node.comment}
          currentUserId={currentUser?.id || null}
          postId={postId}
          onUpdate={handleUpdateComment}
          onDelete={handleDeleteComment}
          onToggleReaction={handleToggleReaction}
          onReport={handleReportComment}
          onCreateReply={handleCreateComment}
          userReactions={userReactions}
          isAuthenticated={!!currentUser}
        />
        {node.replies.length > 0 && (
          <div style={{ marginLeft: '32px', marginTop: '16px' }}>
            {renderCommentTree(node.replies)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <CommentsSection>
      <CommentsHeader>
        <CommentsTitle>
          댓글 <CommentsCount>({comments.length})</CommentsCount>
        </CommentsTitle>
      </CommentsHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {isLoading ? (
        <LoadingSpinner>댓글을 불러오는 중...</LoadingSpinner>
      ) : (
        <>
          <CommentForm
            postId={postId}
            isAuthenticated={!!currentUser}
            onSubmit={handleCreateComment}
            placeholder="댓글을 입력하세요..."
          />

          {comments.length > 0 ? (
            <CommentsList>{renderCommentTree(commentTree)}</CommentsList>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', color: '#737373' }}>
              첫 번째 댓글을 작성해보세요!
            </div>
          )}
        </>
      )}
    </CommentsSection>
  )
}
