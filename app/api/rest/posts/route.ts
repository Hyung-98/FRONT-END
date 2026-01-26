import { getAllPosts, getPostsByCategory } from '@/lib/supabase/posts'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getCurrentFormattedDate } from '@/lib/utils/date-formatter'
import { mapPostToDbFormat } from '@/lib/utils/field-mapper'
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error-handler'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { sanitizeString, isValidSlug } from '@/lib/utils/sanitize'
import { validatePostFields } from '@/lib/utils/validation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const posts = category ? await getPostsByCategory(category) : await getAllPosts()
    return createSuccessResponse(posts, {
      count: posts.length,
    })
  } catch (error) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to fetch posts',
    })
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting (IP 기반)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const rateLimit = checkRateLimit(clientIp, 10, 60000) // 1분에 10회

    if (!rateLimit.allowed) {
      return createErrorResponse(new Error('Too many requests'), {
        status: 429,
        defaultMessage: 'Too many requests. Please try again later.',
      })
    }

    const body = await request.json()

    // 입력값 sanitization
    if (body.slug && !isValidSlug(body.slug)) {
      return createValidationErrorResponse(
        'Invalid slug format. Only lowercase letters, numbers, and hyphens are allowed.'
      )
    }

    // 필수 필드 검증
    const validation = validatePostFields(body)
    if (!validation.isValid) {
      return createValidationErrorResponse('Missing required fields', validation.missingFields)
    }

    // 문자열 필드 sanitization
    body.title = sanitizeString(body.title)
    body.subtitle = sanitizeString(body.subtitle)

    // 날짜가 없으면 현재 날짜 사용
    const postData = mapPostToDbFormat({
      ...body,
      date: body.date || getCurrentFormattedDate(),
    })

    const { data, error } = await supabaseAdmin.from('posts').insert(postData).select().single()

    if (error) {
      return createErrorResponse(error, {
        status: 400,
        defaultMessage: 'Failed to create post',
      })
    }

    return createSuccessResponse(data, {
      status: 201,
    })
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to create post',
    })
  }
}
