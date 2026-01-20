'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // 페이지 전환 시 스크롤을 맨 위로 이동
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
