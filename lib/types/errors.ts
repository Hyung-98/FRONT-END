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
