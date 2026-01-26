/**
 * Sanitization 유틸리티 테스트
 */

import { isValidEmail, isValidSlug, isValidUrl, sanitizeString, stripHtmlTags } from '../sanitize'

describe('sanitizeString', () => {
  it('should remove angle brackets', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
  })

  it('should trim whitespace', () => {
    expect(sanitizeString('  test  ')).toBe('test')
  })
})

describe('stripHtmlTags', () => {
  it('should remove HTML tags', () => {
    expect(stripHtmlTags('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
  })

  it('should handle empty strings', () => {
    expect(stripHtmlTags('')).toBe('')
  })
})

describe('isValidUrl', () => {
  it('should validate HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('should validate HTTPS URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('ftp://example.com')).toBe(false)
  })
})

describe('isValidSlug', () => {
  it('should validate valid slugs', () => {
    expect(isValidSlug('test-slug')).toBe(true)
    expect(isValidSlug('test123')).toBe(true)
    expect(isValidSlug('test-slug-123')).toBe(true)
  })

  it('should reject invalid slugs', () => {
    expect(isValidSlug('Test-Slug')).toBe(false) // uppercase
    expect(isValidSlug('test_slug')).toBe(false) // underscore
    expect(isValidSlug('test slug')).toBe(false) // space
    expect(isValidSlug('')).toBe(false) // empty
    expect(isValidSlug('a'.repeat(101))).toBe(false) // too long
  })
})

describe('isValidEmail', () => {
  it('should validate valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@example.co.uk')).toBe(true)
  })

  it('should reject invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
  })
})
