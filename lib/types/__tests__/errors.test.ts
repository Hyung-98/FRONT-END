/**
 * 에러 유틸리티 테스트 — translateAuthError, isApiError, getErrorMessage
 */

import { translateAuthError, isApiError, getErrorMessage, type ApiError } from '../errors'

describe('translateAuthError', () => {
  describe('정확한 매칭', () => {
    it('Invalid login credentials → 한국어 메시지 반환', () => {
      expect(translateAuthError('Invalid login credentials')).toBe(
        '이메일 또는 비밀번호가 올바르지 않습니다.'
      )
    })

    it('Email not confirmed → 한국어 메시지 반환', () => {
      expect(translateAuthError('Email not confirmed')).toBe(
        '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
      )
    })

    it('User already registered → 한국어 메시지 반환', () => {
      expect(translateAuthError('User already registered')).toBe('이미 등록된 사용자입니다.')
    })

    it('Password should be at least 6 characters → 한국어 메시지 반환', () => {
      expect(translateAuthError('Password should be at least 6 characters')).toBe(
        '비밀번호는 최소 6자 이상이어야 합니다.'
      )
    })

    it('Signup is disabled → 한국어 메시지 반환', () => {
      expect(translateAuthError('Signup is disabled')).toBe('회원가입이 비활성화되어 있습니다.')
    })

    it('Email rate limit exceeded → 한국어 메시지 반환', () => {
      expect(translateAuthError('Email rate limit exceeded')).toBe(
        '이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      )
    })

    it('User already exists → 한국어 메시지 반환', () => {
      expect(translateAuthError('User already exists')).toBe('이미 존재하는 사용자입니다.')
    })

    it('Invalid email → 한국어 메시지 반환', () => {
      expect(translateAuthError('Invalid email')).toBe('올바른 이메일 형식이 아닙니다.')
    })

    it('Unable to validate email address: invalid format → 한국어 메시지 반환', () => {
      expect(translateAuthError('Unable to validate email address: invalid format')).toBe(
        '올바른 이메일 형식이 아닙니다.'
      )
    })

    it('Forbidden → 한국어 메시지 반환', () => {
      expect(translateAuthError('Forbidden')).toBe('접근 권한이 없습니다.')
    })

    it('Unauthorized → 한국어 메시지 반환', () => {
      expect(translateAuthError('Unauthorized')).toBe('인증이 필요합니다.')
    })
  })

  describe('부분 매칭 (대소문자 무시)', () => {
    it('소문자 포함 메시지도 매칭', () => {
      expect(translateAuthError('invalid login credentials from supabase')).toBe(
        '이메일 또는 비밀번호가 올바르지 않습니다.'
      )
    })

    it('대소문자 혼합 메시지도 매칭', () => {
      expect(translateAuthError('ERROR: Email Not Confirmed by server')).toBe(
        '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
      )
    })
  })

  describe('매칭 실패', () => {
    it('알 수 없는 에러 메시지는 원본 반환', () => {
      const unknown = 'Something completely unexpected happened'
      expect(translateAuthError(unknown)).toBe(unknown)
    })

    it('빈 문자열은 빈 문자열 반환', () => {
      expect(translateAuthError('')).toBe('')
    })
  })
})

describe('isApiError', () => {
  it('message 속성이 있는 객체 → true', () => {
    const err: ApiError = { message: '에러 발생' }
    expect(isApiError(err)).toBe(true)
  })

  it('message와 code 속성이 있는 객체 → true', () => {
    const err: ApiError = { message: '에러', code: 'PGRST301' }
    expect(isApiError(err)).toBe(true)
  })

  it('message가 없는 객체 → false', () => {
    expect(isApiError({ code: 'ERR' })).toBe(false)
  })

  it('message가 문자열이 아닌 경우 → false', () => {
    expect(isApiError({ message: 123 })).toBe(false)
  })

  it('null → false', () => {
    expect(isApiError(null)).toBe(false)
  })

  it('문자열 → false', () => {
    expect(isApiError('에러 문자열')).toBe(false)
  })

  it('undefined → false', () => {
    expect(isApiError(undefined)).toBe(false)
  })
})

describe('getErrorMessage', () => {
  it('Error 인스턴스 → message 반환', () => {
    const err = new Error('테스트 에러')
    expect(getErrorMessage(err)).toBe('테스트 에러')
  })

  it('ApiError 객체 → message 반환', () => {
    const err: ApiError = { message: 'API 에러', code: 'ERR_001' }
    expect(getErrorMessage(err)).toBe('API 에러')
  })

  it('문자열 → 문자열 반환', () => {
    expect(getErrorMessage('직접 에러 메시지')).toBe('직접 에러 메시지')
  })

  it('null → 기본 메시지 반환', () => {
    expect(getErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다.')
  })

  it('undefined → 기본 메시지 반환', () => {
    expect(getErrorMessage(undefined)).toBe('알 수 없는 오류가 발생했습니다.')
  })

  it('숫자 → 기본 메시지 반환', () => {
    expect(getErrorMessage(404)).toBe('알 수 없는 오류가 발생했습니다.')
  })

  it('빈 객체 → 기본 메시지 반환', () => {
    expect(getErrorMessage({})).toBe('알 수 없는 오류가 발생했습니다.')
  })
})
