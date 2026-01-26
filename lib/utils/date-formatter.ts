/**
 * 날짜 포맷팅 유틸리티
 */

/**
 * 기본 날짜 포맷 (예: "23RD JANUARY 2025")
 */
export function formatDefaultDate(date?: Date | string): string {
  const dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : new Date()

  return dateObj
    .toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase()
}

/**
 * 현재 날짜를 기본 포맷으로 반환
 */
export function getCurrentFormattedDate(): string {
  return formatDefaultDate()
}
