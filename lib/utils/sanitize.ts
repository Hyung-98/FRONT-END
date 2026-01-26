/**
 * 입력값 sanitization 유틸리티
 */

/**
 * HTML 태그 제거
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * XSS 방지를 위한 기본 sanitization
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // < > 제거
    .trim()
}

/**
 * URL 검증
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

/**
 * Slug 검증 (영문자, 숫자, 하이픈만 허용)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100
}

/**
 * 이메일 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
