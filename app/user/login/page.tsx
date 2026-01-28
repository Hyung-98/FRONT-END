'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function UserLoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    const error = searchParams.get('error')
    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (error) params.set('error', error)
    router.replace(`/login${params.toString() ? `?${params.toString()}` : ''}`)
  }, [router, searchParams])

  return null
}
