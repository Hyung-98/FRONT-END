import { createClient } from './client'
import type { Database, CommentStatus, ReactionType, ReportReason } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabase = createClient()

type CommentRow = Database['public']['Tables']['comments']['Row']
type CommentTreeItem = Database['public']['Functions']['get_comment_tree']['Returns'][number]

// 애플리케이션 레벨 댓글 타입 (camelCase)
export interface Comment {
  id: string
  postId: string
  parentId: string | null
  authorId: string | null
  authorName: string
  authorAvatarUrl: string | null
  content: string
  status: CommentStatus
  isDeleted: boolean
  isEdited: boolean
  likeCount: number
  dislikeCount: number
  replyCount: number
  createdAt: string
  depth: number
}

export interface CreateCommentParams {
  postId: string
  content: string
  parentId?: string | null
  actorIp?: string | null
  userAgent?: string | null
  fingerprint?: string | null
}

export interface UpdateCommentParams {
  commentId: string
  content: string
  editReason?: string | null
}

export interface ToggleReactionParams {
  commentId: string
  reactionType: ReactionType
}

export interface ReportCommentParams {
  commentId: string
  reason: ReportReason
  description?: string | null
}

// DB Row를 애플리케이션 타입으로 변환
function transformCommentTreeItem(item: CommentTreeItem): Comment {
  return {
    id: item.id,
    postId: item.post_id,
    parentId: item.parent_id,
    authorId: item.author_id,
    authorName: item.author_name,
    authorAvatarUrl: item.author_avatar_url,
    content: item.content,
    status: item.status,
    isDeleted: item.is_deleted,
    isEdited: item.is_edited,
    likeCount: Number(item.like_count),
    dislikeCount: Number(item.dislike_count),
    replyCount: Number(item.reply_count),
    createdAt: item.created_at,
    depth: item.depth,
  }
}

// 댓글 트리 조회
export async function getCommentTree(
  postId: string,
  maxDepth: number = 5,
  limit: number = 100
): Promise<Comment[]> {
  const { data, error } = await supabase.rpc('get_comment_tree', {
    p_post_id: postId,
    p_max_depth: maxDepth,
    p_limit: limit,
  })

  if (error) {
    console.error('Error fetching comment tree:', error)
    throw error
  }

  return (data || []).map(transformCommentTreeItem)
}

// 댓글 생성
export async function createComment(
  params: CreateCommentParams,
  client?: SupabaseClient<Database>
): Promise<CommentRow> {
  const supabaseClient = client || supabase
  const { data, error } = await supabaseClient.rpc('create_comment', {
    p_post_id: params.postId,
    p_parent_id: params.parentId || null,
    p_content: params.content,
    p_actor_ip: params.actorIp || null,
    p_user_agent: params.userAgent || null,
    p_fingerprint: params.fingerprint || null,
  })

  if (error) {
    console.error('Error creating comment:', error)
    throw error
  }

  return data
}

// 댓글 수정 (API 라우트에서는 요청 세션을 가진 client 전달 필요)
export async function updateComment(
  params: UpdateCommentParams,
  client?: SupabaseClient<Database>
): Promise<CommentRow> {
  const supabaseClient = client || supabase
  const { data, error } = await supabaseClient.rpc('update_comment', {
    p_comment_id: params.commentId,
    p_content: params.content,
    p_edit_reason: params.editReason || null,
  })

  if (error) {
    console.error('Error updating comment:', error)
    throw error
  }

  return data
}

// 댓글 삭제 (API 라우트에서는 요청 세션을 가진 client 전달 필요)
export async function deleteComment(
  commentId: string,
  client?: SupabaseClient<Database>
): Promise<boolean> {
  const supabaseClient = client || supabase
  const { data, error } = await supabaseClient.rpc('delete_comment', {
    p_comment_id: commentId,
  })

  if (error) {
    console.error('Error deleting comment:', error)
    throw error
  }

  return data === true
}

// 반응 토글 (API 라우트에서는 요청 세션을 가진 client 전달 필요)
export async function toggleReaction(
  params: ToggleReactionParams,
  client?: SupabaseClient<Database>
): Promise<{ action: string; reaction: ReactionType; from?: ReactionType; to?: ReactionType }> {
  const supabaseClient = client || supabase
  const { data, error } = await supabaseClient.rpc('toggle_reaction', {
    p_comment_id: params.commentId,
    p_reaction_type: params.reactionType,
  })

  if (error) {
    console.error('Error toggling reaction:', error)
    throw error
  }

  return data
}

// 댓글 신고
export async function reportComment(params: ReportCommentParams) {
  const { data, error } = await supabase.rpc('report_comment', {
    p_comment_id: params.commentId,
    p_reason: params.reason,
    p_description: params.description || null,
  })

  if (error) {
    console.error('Error reporting comment:', error)
    throw error
  }

  return data
}
