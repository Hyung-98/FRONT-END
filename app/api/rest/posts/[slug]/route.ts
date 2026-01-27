import { getPostBySlug } from '@/lib/supabase/posts'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getCurrentFormattedDate } from '@/lib/utils/date-formatter'
import { mapPostToDbFormat } from '@/lib/utils/field-mapper'
import {
  createErrorResponse,
  createNotFoundResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error-handler'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { sanitizeString, isValidSlug } from '@/lib/utils/sanitize'
import { validatePostFields } from '@/lib/utils/validation'

// 정적 내보내기(output: 'export') 사용 시 API 라우트는 빌드에서 자동으로 제외됨
// 하지만 동적 라우트가 있으면 빌드 오류가 발생할 수 있으므로
// 이 파일은 빌드 시 무시되어야 함

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
      return createNotFoundResponse('Post not found')
    }

    return createSuccessResponse(post)
  } catch (error) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to fetch post',
    })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const rateLimit = checkRateLimit(clientIp, 10, 60000)

    if (!rateLimit.allowed) {
      return createErrorResponse(new Error('Too many requests'), {
        status: 429,
        defaultMessage: 'Too many requests. Please try again later.',
      })
    }

    const { slug } = await params
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

    // slug가 변경된 경우 기존 포스트 확인
    const originalPost = await getPostBySlug(slug)
    if (!originalPost) {
      return createNotFoundResponse('Post not found')
    }

    // slug가 변경된 경우 기존 포스트 삭제 후 새 slug로 생성
    if (body.slug !== slug) {
      // 기존 포스트 삭제
      const { error: deleteError } = await supabaseAdmin.from('posts').delete().eq('slug', slug)

      if (deleteError) {
        return createErrorResponse(deleteError, {
          status: 400,
          defaultMessage: 'Failed to delete old post',
        })
      }

      // 새 slug로 포스트 생성
      const postData = mapPostToDbFormat({
        ...body,
        date: body.date || getCurrentFormattedDate(),
      })

      const { data, error: insertError } = await supabaseAdmin
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (insertError) {
        return createErrorResponse(insertError, {
          status: 400,
          defaultMessage: 'Failed to create post with new slug',
        })
      }

      return createSuccessResponse(data)
    } else {
      // slug가 변경되지 않은 경우 업데이트
      const postData = mapPostToDbFormat({
        ...body,
        slug, // slug는 변경되지 않으므로 원래 값 사용
        date: body.date || getCurrentFormattedDate(),
      })

      const { data, error: updateError } = await supabaseAdmin
        .from('posts')
        .update(postData)
        .eq('slug', slug)
        .select()
        .single()

      if (updateError) {
        return createErrorResponse(updateError, {
          status: 400,
          defaultMessage: 'Failed to update post',
        })
      }

      return createSuccessResponse(data)
    }
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to update post',
    })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const rateLimit = checkRateLimit(clientIp, 10, 60000)

    if (!rateLimit.allowed) {
      return createErrorResponse(new Error('Too many requests'), {
        status: 429,
        defaultMessage: 'Too many requests. Please try again later.',
      })
    }

    const { slug } = await params
    const { error: deleteError } = await supabaseAdmin.from('posts').delete().eq('slug', slug)

    if (deleteError) {
      return createErrorResponse(deleteError, {
        status: 400,
        defaultMessage: 'Failed to delete post',
      })
    }

    return createSuccessResponse(null, {
      message: 'Post deleted successfully',
    })
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to delete post',
    })
  }
}
