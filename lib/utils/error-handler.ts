/**
 * 공통 에러 처리 유틸리티
 */

import { NextResponse } from 'next/server'
import type { ErrorResponse } from '@/lib/types/errors'
import { getErrorMessage, isApiError } from '@/lib/types/errors'

/**
 * 표준 API 응답 형식
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
  message?: string
}

/**
 * 성공 응답 생성
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    status?: number
    count?: number
    message?: string
    headers?: HeadersInit
  }
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  }

  if (options?.count !== undefined) {
    response.count = options.count
  }

  if (options?.message) {
    response.message = options.message
  }

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      ...options?.headers,
    },
  })
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(
  error: unknown,
  options?: {
    status?: number
    defaultMessage?: string
    headers?: HeadersInit
  }
): NextResponse<ErrorResponse> {
  const status = options?.status || 500
  const message = getErrorMessage(error) || options?.defaultMessage || 'An error occurred'

  console.error('API Error:', {
    message,
    error: error instanceof Error ? error.stack : error,
    status,
  })

  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(isApiError(error) && error.code ? { code: error.code } : {}),
    },
    {
      status,
      headers: options?.headers,
    }
  )
}

/**
 * 검증 에러 응답 생성
 */
export function createValidationErrorResponse(
  message: string,
  missingFields?: string[]
): NextResponse<ErrorResponse> {
  const errorMessage = missingFields
    ? `Missing required fields: ${missingFields.join(', ')}`
    : message

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status: 400 }
  )
}

/**
 * 인증 에러 응답 생성
 */
export function createUnauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  )
}

/**
 * 리소스 없음 에러 응답 생성
 */
export function createNotFoundResponse(
  message: string = 'Resource not found'
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 404 }
  )
}
