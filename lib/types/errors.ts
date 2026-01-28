/**
 * 에러 타입 정의
 */

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

export interface ErrorResponse {
  success: false
  error: string
  code?: string
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  )
}

/**
 * Supabase 인증 에러 메시지를 한국어로 변환
 */
export function translateAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
    'User already registered': '이미 등록된 사용자입니다.',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
    'Signup is disabled': '회원가입이 비활성화되어 있습니다.',
    'Email rate limit exceeded': '이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    'User already exists': '이미 존재하는 사용자입니다.',
    'Invalid email': '올바른 이메일 형식이 아닙니다.',
    'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다.',
    Forbidden: '접근 권한이 없습니다.',
    Unauthorized: '인증이 필요합니다.',
  }

  // 정확한 매칭 시도
  if (errorMap[message]) {
    return errorMap[message]
  }

  // 부분 매칭 시도 (대소문자 무시)
  const lowerMessage = message.toLowerCase()
  for (const [key, value] of Object.entries(errorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value
    }
  }

  // 매칭되지 않으면 원본 메시지 반환
  return message
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (isApiError(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '알 수 없는 오류가 발생했습니다.'
}
