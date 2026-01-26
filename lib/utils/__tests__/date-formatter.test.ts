/**
 * 날짜 포맷터 테스트
 */

import { formatDefaultDate, getCurrentFormattedDate } from '../date-formatter'

describe('formatDefaultDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-23')
    const formatted = formatDefaultDate(date)

    // Format should be uppercase (e.g., "JANUARY 23, 2025")
    expect(formatted).toMatch(
      /JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER/
    )
    expect(formatted).toContain('2025')
  })

  it('should handle string dates', () => {
    const formatted = formatDefaultDate('2025-01-23')

    expect(formatted).toMatch(
      /JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER/
    )
    expect(formatted).toContain('2025')
  })

  it('should use current date when no date provided', () => {
    const formatted = formatDefaultDate()
    const currentYear = new Date().getFullYear().toString()

    expect(formatted).toContain(currentYear)
  })
})

describe('getCurrentFormattedDate', () => {
  it('should return formatted current date', () => {
    const formatted = getCurrentFormattedDate()
    const currentYear = new Date().getFullYear().toString()

    expect(formatted).toContain(currentYear)
    expect(formatted).toBe(formatDefaultDate())
  })
})
