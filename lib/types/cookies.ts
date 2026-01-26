/**
 * 쿠키 옵션 타입 정의
 */

export interface CookieOptions {
  name: string
  value: string
  path?: string
  domain?: string
  expires?: Date
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}
