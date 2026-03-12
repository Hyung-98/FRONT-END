/**
 * 인증 유틸리티 테스트 — getUserRole, isAdmin, requireAdmin, createOrUpdateProfile, updateProfileDisplayName
 */

import {
  getUserRole,
  isAdmin,
  requireAdmin,
  createOrUpdateProfile,
  updateProfileDisplayName,
} from '../auth'

// supabaseAdmin 모킹
const mockUpsert = jest.fn()
const mockUpdate = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

describe('lib/utils/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── getUserRole ───────────────────────────────────────────────
  describe('getUserRole', () => {
    it('역할을 성공적으로 반환해야 함', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null }),
      })

      const result = await getUserRole('user-123')
      expect(result).toBe('admin')
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockSelect).toHaveBeenCalledWith('role')
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
    })

    it('data.role이 없을 때 null 반환', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({ data: { role: null }, error: null }),
      })

      const result = await getUserRole('user-123')
      expect(result).toBeNull()
    })

    it('Supabase 에러 발생 시 null 반환', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({
          data: null,
          error: { message: 'DB error', code: 'PGRST301' },
        }),
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = await getUserRole('user-123')
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })

    it('예외 발생 시 null 반환', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('연결 실패')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = await getUserRole('user-123')
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })
  })

  // ─── isAdmin ───────────────────────────────────────────────────
  describe('isAdmin', () => {
    it('역할이 admin이면 true 반환', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null }),
      })

      expect(await isAdmin('user-123')).toBe(true)
    })

    it('역할이 user이면 false 반환', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({ data: { role: 'user' }, error: null }),
      })

      expect(await isAdmin('user-123')).toBe(false)
    })

    it('역할이 null이면 false 반환', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } }),
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      expect(await isAdmin('user-123')).toBe(false)
      consoleSpy.mockRestore()
    })
  })

  // ─── requireAdmin ──────────────────────────────────────────────
  describe('requireAdmin', () => {
    it('세션이 null이면 false 반환', async () => {
      expect(await requireAdmin(null)).toBe(false)
    })

    it('세션에 user가 없으면 false 반환', async () => {
      expect(await requireAdmin({ user: null } as any)).toBe(false)
    })

    it('user가 admin이면 true 반환', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null }),
      })

      const mockSession = { user: { id: 'admin-user-id' } } as any
      expect(await requireAdmin(mockSession)).toBe(true)
    })

    it('user가 일반 사용자이면 false 반환', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle.mockResolvedValue({ data: { role: 'user' }, error: null }),
      })

      const mockSession = { user: { id: 'normal-user-id' } } as any
      expect(await requireAdmin(mockSession)).toBe(false)
    })
  })

  // ─── createOrUpdateProfile ─────────────────────────────────────
  describe('createOrUpdateProfile', () => {
    it('프로필 생성/업데이트 성공 시 true 반환', async () => {
      mockFrom.mockReturnValue({
        upsert: mockUpsert.mockResolvedValue({ error: null }),
      })

      const result = await createOrUpdateProfile('user-123', 'user')
      expect(result).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123', role: 'user' }),
        { onConflict: 'id' }
      )
    })

    it('displayName이 제공되면 row에 포함', async () => {
      mockFrom.mockReturnValue({
        upsert: mockUpsert.mockResolvedValue({ error: null }),
      })

      await createOrUpdateProfile('user-123', 'user', '홍길동')
      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ display_name: '홍길동' }), {
        onConflict: 'id',
      })
    })

    it('빈 문자열 displayName은 null로 저장', async () => {
      mockFrom.mockReturnValue({
        upsert: mockUpsert.mockResolvedValue({ error: null }),
      })

      await createOrUpdateProfile('user-123', 'user', '')
      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ display_name: null }), {
        onConflict: 'id',
      })
    })

    it('displayName 미제공 시 row에 포함하지 않음', async () => {
      mockFrom.mockReturnValue({
        upsert: mockUpsert.mockResolvedValue({ error: null }),
      })

      await createOrUpdateProfile('user-123', 'user')
      const row = mockUpsert.mock.calls[0][0]
      expect(row).not.toHaveProperty('display_name')
    })

    it('기본 role은 user', async () => {
      mockFrom.mockReturnValue({
        upsert: mockUpsert.mockResolvedValue({ error: null }),
      })

      await createOrUpdateProfile('user-123')
      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ role: 'user' }), {
        onConflict: 'id',
      })
    })

    it('Supabase 에러 시 false 반환', async () => {
      mockFrom.mockReturnValue({
        upsert: mockUpsert.mockResolvedValue({ error: { message: 'upsert 실패' } }),
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = await createOrUpdateProfile('user-123', 'user')
      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })

    it('예외 발생 시 false 반환', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('DB 연결 실패')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = await createOrUpdateProfile('user-123', 'user')
      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })
  })

  // ─── updateProfileDisplayName ──────────────────────────────────
  describe('updateProfileDisplayName', () => {
    it('표시 이름 업데이트 성공 시 true 반환', async () => {
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnThis(),
        eq: mockEq.mockResolvedValue({ error: null }),
      })

      const result = await updateProfileDisplayName('user-123', '홍길동')
      expect(result).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ display_name: '홍길동' }))
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
    })

    it('null 전달 시 display_name null로 업데이트', async () => {
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnThis(),
        eq: mockEq.mockResolvedValue({ error: null }),
      })

      await updateProfileDisplayName('user-123', null)
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ display_name: null }))
    })

    it('빈 문자열 전달 시 display_name null로 업데이트', async () => {
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnThis(),
        eq: mockEq.mockResolvedValue({ error: null }),
      })

      await updateProfileDisplayName('user-123', '')
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ display_name: null }))
    })

    it('Supabase 에러 시 false 반환', async () => {
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnThis(),
        eq: mockEq.mockResolvedValue({ error: { message: '업데이트 실패' } }),
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = await updateProfileDisplayName('user-123', '홍길동')
      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })

    it('예외 발생 시 false 반환', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('DB 연결 실패')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = await updateProfileDisplayName('user-123', '홍길동')
      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })
  })
})
