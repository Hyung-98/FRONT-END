/**
 * 검증 유틸리티 함수
 */

export interface ValidationResult {
  isValid: boolean
  missingFields: string[]
}

/**
 * 필수 필드 검증
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult {
  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missingFields.push(field)
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * 포스트 생성/수정을 위한 필수 필드 검증
 */
export function validatePostFields(body: Record<string, unknown>): ValidationResult {
  return validateRequiredFields(body, ['slug', 'title', 'subtitle', 'content'])
}
