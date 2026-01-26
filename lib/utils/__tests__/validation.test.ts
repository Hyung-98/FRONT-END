/**
 * 검증 유틸리티 테스트
 */

import { validatePostFields, validateRequiredFields } from '../validation'

describe('validateRequiredFields', () => {
  it('should return isValid true when all required fields are present', () => {
    const body = {
      slug: 'test-slug',
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      content: 'Test Content',
    }

    const result = validateRequiredFields(body, ['slug', 'title', 'subtitle', 'content'])

    expect(result.isValid).toBe(true)
    expect(result.missingFields).toHaveLength(0)
  })

  it('should return isValid false when required fields are missing', () => {
    const body = {
      slug: 'test-slug',
      title: 'Test Title',
    }

    const result = validateRequiredFields(body, ['slug', 'title', 'subtitle', 'content'])

    expect(result.isValid).toBe(false)
    expect(result.missingFields).toEqual(['subtitle', 'content'])
  })

  it('should treat empty strings as missing', () => {
    const body = {
      slug: 'test-slug',
      title: '',
      subtitle: 'Test Subtitle',
      content: 'Test Content',
    }

    const result = validateRequiredFields(body, ['slug', 'title', 'subtitle', 'content'])

    expect(result.isValid).toBe(false)
    expect(result.missingFields).toContain('title')
  })
})

describe('validatePostFields', () => {
  it('should validate post fields correctly', () => {
    const validPost = {
      slug: 'test-slug',
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      content: 'Test Content',
    }

    const result = validatePostFields(validPost)

    expect(result.isValid).toBe(true)
  })

  it('should return missing fields for invalid post', () => {
    const invalidPost = {
      slug: 'test-slug',
      title: 'Test Title',
    }

    const result = validatePostFields(invalidPost)

    expect(result.isValid).toBe(false)
    expect(result.missingFields).toContain('subtitle')
    expect(result.missingFields).toContain('content')
  })
})
