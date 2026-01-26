/**
 * 필드 매핑 유틸리티 (snake_case ↔ camelCase)
 */

/**
 * camelCase를 snake_case로 변환
 *
 * @param str - camelCase 문자열
 * @returns snake_case 문자열
 * @example
 * toSnakeCase('readingTime') // 'reading_time'
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * snake_case를 camelCase로 변환
 *
 * @param str - snake_case 문자열
 * @returns camelCase 문자열
 * @example
 * toCamelCase('reading_time') // 'readingTime'
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 객체의 키를 snake_case로 변환
 */
export function objectToSnakeCase<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key)
    result[snakeKey] = value
  }

  return result
}

/**
 * 객체의 키를 camelCase로 변환
 */
export function objectToCamelCase<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key)
    result[camelKey] = value
  }

  return result
}

/**
 * 포스트 데이터를 데이터베이스 형식으로 변환
 * readingTime/reading_time, heroImage/hero_image 등 처리
 */
export interface PostFormData {
  slug: string
  title: string
  subtitle: string
  content: string
  category?: string
  date?: string
  readingTime?: string
  reading_time?: string
  heroImage?: string
  hero_image?: string
}

export interface PostDbData {
  slug: string
  title: string
  subtitle: string
  content: string
  category: string
  date: string
  reading_time: string
  hero_image: string
}

/**
 * 포스트 폼 데이터를 데이터베이스 형식으로 변환
 *
 * @param data - 포스트 폼 데이터 (camelCase 또는 snake_case 혼용 가능)
 * @param defaultCategory - 기본 카테고리 (기본값: 'JavaScript')
 * @returns 데이터베이스 형식의 포스트 데이터 (snake_case)
 *
 * @example
 * mapPostToDbFormat({
 *   slug: 'test',
 *   title: 'Test',
 *   subtitle: 'Subtitle',
 *   content: 'Content',
 *   readingTime: '10 Min'
 * })
 */
export function mapPostToDbFormat(
  data: PostFormData,
  defaultCategory: string = 'JavaScript'
): PostDbData {
  return {
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    category: data.category || defaultCategory,
    date: data.date || '',
    reading_time: data.reading_time || data.readingTime || '10 Min',
    hero_image: data.hero_image || data.heroImage || '',
  }
}
