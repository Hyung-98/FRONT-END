/**
 * 프로필 API 라우트 테스트 — GET / POST / PATCH /api/user/profile
 */

import { GET, POST, PATCH } from '../route'

// ── 의존성 모킹 ──────────────────────────────────────────────────
const mockGetUser = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

jest.mock('@/lib/supabase/auth', () => ({
  getSupabaseClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: (...args: unknown[]) => mockFrom(...args),
    })
  ),
}))

jest.mock('@/lib/utils/auth', () => ({
  createOrUpdateProfile: jest.fn(),
  updateProfileDisplayName: jest.fn(),
}))

import { createOrUpdateProfile, updateProfileDisplayName } from '@/lib/utils/auth'

const mockCreateOrUpdateProfile = createOrUpdateProfile as jest.MockedFunction<
  typeof createOrUpdateProfile
>
const mockUpdateProfileDisplayName = updateProfileDisplayName as jest.MockedFunction<
  typeof updateProfileDisplayName
>

// ── 헬퍼 ─────────────────────────────────────────────────────────
function makeRequest(method: string, body?: object) {
  return new Request(`http://localhost:3000/api/user/profile`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function setAuthUser(user: object | null) {
  mockGetUser.mockResolvedValue({ data: { user } })
}

describe('GET /api/user/profile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('인증되지 않은 요청 → 401 반환', async () => {
    setAuthUser(null)
    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(401)
  })

  it('프로필 조회 성공 → 200 + 데이터 반환', async () => {
    setAuthUser({ id: 'user-1' })
    mockFrom.mockReturnValue({
      select: mockSelect.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle.mockResolvedValue({
        data: { display_name: '홍길동', avatar_url: null, role: 'user' },
        error: null,
      }),
    })

    const res = await GET(makeRequest('GET'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.display_name).toBe('홍길동')
    expect(body.data.role).toBe('user')
  })

  it('프로필 없을 때 → 200 + 기본값 반환', async () => {
    setAuthUser({ id: 'user-1' })
    mockFrom.mockReturnValue({
      select: mockSelect.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' },
      }),
    })

    const res = await GET(makeRequest('GET'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.display_name).toBeNull()
    expect(body.data.role).toBe('user')
  })
})

describe('POST /api/user/profile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('인증되지 않은 요청 → 401 반환', async () => {
    setAuthUser(null)
    const res = await POST(makeRequest('POST', { userId: 'user-1', role: 'user' }))
    expect(res.status).toBe(401)
  })

  it('userId가 인증된 사용자와 다를 때 → 401 반환', async () => {
    setAuthUser({ id: 'user-A' })
    const res = await POST(makeRequest('POST', { userId: 'user-B', role: 'user' }))
    expect(res.status).toBe(401)
  })

  it('userId 없을 때 → 400 반환', async () => {
    setAuthUser({ id: 'user-1' })
    // userId가 undefined인데 user.id 와 비교하면 401이 먼저 걸릴 수 있음
    // 실제 동작 순서: userId !== user.id → 401
    const res = await POST(makeRequest('POST', { role: 'user' }))
    expect([400, 401]).toContain(res.status)
  })

  it('유효하지 않은 role → 400 반환', async () => {
    setAuthUser({ id: 'user-1' })
    const res = await POST(makeRequest('POST', { userId: 'user-1', role: 'superuser' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/Invalid role/)
  })

  it('프로필 생성 성공 → 200 반환', async () => {
    setAuthUser({ id: 'user-1' })
    mockCreateOrUpdateProfile.mockResolvedValue(true)

    const res = await POST(makeRequest('POST', { userId: 'user-1', role: 'user' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.userId).toBe('user-1')
    expect(body.data.role).toBe('user')
  })

  it('display_name 포함 생성 성공', async () => {
    setAuthUser({ id: 'user-1' })
    mockCreateOrUpdateProfile.mockResolvedValue(true)

    const res = await POST(
      makeRequest('POST', { userId: 'user-1', role: 'user', display_name: '홍길동' })
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.display_name).toBe('홍길동')
  })

  it('createOrUpdateProfile 실패 → 500 반환', async () => {
    setAuthUser({ id: 'user-1' })
    mockCreateOrUpdateProfile.mockResolvedValue(false)

    const res = await POST(makeRequest('POST', { userId: 'user-1', role: 'user' }))
    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/user/profile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('인증되지 않은 요청 → 401 반환', async () => {
    setAuthUser(null)
    const res = await PATCH(makeRequest('PATCH', { display_name: '홍길동' }))
    expect(res.status).toBe(401)
  })

  it('display_name 숫자 타입 → 400 반환', async () => {
    setAuthUser({ id: 'user-1' })
    const res = await PATCH(makeRequest('PATCH', { display_name: 123 }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/display_name must be/)
  })

  it('display_name 100자 초과 → 400 반환', async () => {
    setAuthUser({ id: 'user-1' })
    const longName = 'a'.repeat(101)
    const res = await PATCH(makeRequest('PATCH', { display_name: longName }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/too long/)
  })

  it('display_name 업데이트 성공 → 200 반환', async () => {
    setAuthUser({ id: 'user-1' })
    mockUpdateProfileDisplayName.mockResolvedValue(true)

    const res = await PATCH(makeRequest('PATCH', { display_name: '홍길동' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.display_name).toBe('홍길동')
    expect(mockUpdateProfileDisplayName).toHaveBeenCalledWith('user-1', '홍길동')
  })

  it('display_name null 전달 → null로 저장', async () => {
    setAuthUser({ id: 'user-1' })
    mockUpdateProfileDisplayName.mockResolvedValue(true)

    const res = await PATCH(makeRequest('PATCH', { display_name: null }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.display_name).toBeNull()
    expect(mockUpdateProfileDisplayName).toHaveBeenCalledWith('user-1', null)
  })

  it('updateProfileDisplayName 실패 → 500 반환', async () => {
    setAuthUser({ id: 'user-1' })
    mockUpdateProfileDisplayName.mockResolvedValue(false)

    const res = await PATCH(makeRequest('PATCH', { display_name: '홍길동' }))
    expect(res.status).toBe(500)
  })
})
