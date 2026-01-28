/**
 * 댓글 관련 유틸리티 함수
 */

/**
 * 상대 시간 포맷팅 (예: "2분 전", "1시간 전", "3일 전")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '방금 전'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}일 전`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}주 전`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}년 전`
}

/**
 * UUID 형식 검증
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * 댓글 내용 sanitization (XSS 방지)
 * React는 기본적으로 이스케이프하지만, 추가 보안을 위해 사용
 */
export function sanitizeCommentContent(content: string): string {
  // HTML 태그 제거 (마크다운은 허용)
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim()
}

/**
 * 댓글 트리를 계층 구조로 변환
 */
export interface CommentNode {
  comment: any
  replies: CommentNode[]
}

export function buildCommentTree(comments: any[]): CommentNode[] {
  const commentMap = new Map<string, CommentNode>()
  const rootComments: CommentNode[] = []

  // 모든 댓글을 맵에 추가
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      comment,
      replies: [],
    })
  })

  // 트리 구조 생성
  comments.forEach(comment => {
    const node = commentMap.get(comment.id)!
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(node)
      }
    } else {
      rootComments.push(node)
    }
  })

  return rootComments
}

/**
 * 클라이언트 IP 추출
 */
export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return null
}

/**
 * User-Agent 추출
 */
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent')
}
