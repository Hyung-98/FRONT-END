'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import IntroAnimation from './IntroAnimation'

interface HomePageClientProps {
  children: ReactNode
}

export default function HomePageClient({ children }: HomePageClientProps) {
  const [showIntro, setShowIntro] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if intro was already shown this session
    const hasShown = sessionStorage.getItem('hasShownIntroAnimation')

    if (!hasShown) {
      // First visit this session - show intro
      setShowIntro(true)
    }

    setIsChecking(false)
  }, [])

  // ✅ useCallback으로 메모이제이션
  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('hasShownIntroAnimation', 'true')
    setShowIntro(false)
  }, [])

  // Don't render anything while checking sessionStorage
  // This prevents flash of content
  if (isChecking) {
    return null
  }

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      {children}
    </>
  )
}
