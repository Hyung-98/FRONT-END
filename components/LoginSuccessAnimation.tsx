'use client'

import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'

interface LoginSuccessAnimationProps {
  message: string
  onComplete: () => void
}

const LoginSuccessAnimation = ({ message, onComplete }: LoginSuccessAnimationProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const skipHintRef = useRef<HTMLDivElement>(null)
  const [showSkipHint, setShowSkipHint] = useState(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Handle skip functionality
  const handleSkip = () => {
    if (timelineRef.current) {
      timelineRef.current.kill()
    }
    onComplete()
  }

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Show skip hint after 0.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkipHint(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // GSAP animation timeline
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete()
      },
    })

    // Overlay fade in
    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
      // Success icon scale and fade in
      .to(
        iconRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        0.3
      )
      // Message fade in
      .to(
        messageRef.current,
        {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        0.8
      )
      // Hold state
      .to({}, { duration: 0.5 }, 1.3)
      // Fade out everything
      .to(
        [overlayRef.current, iconRef.current, messageRef.current],
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        1.5
      )

    // Store timeline reference for cleanup
    timelineRef.current = tl

    // Cleanup on unmount
    return () => {
      tl.kill()
    }
  }, [onComplete])

  // Fade in skip hint
  useEffect(() => {
    if (showSkipHint && skipHintRef.current) {
      gsap.to(skipHintRef.current, {
        opacity: 0.6,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [showSkipHint])

  return (
    <Overlay ref={overlayRef} onClick={handleSkip}>
      <SuccessIcon ref={iconRef}>✓</SuccessIcon>
      <Message ref={messageRef}>{message}</Message>
      {showSkipHint && <SkipHint ref={skipHintRef}>클릭하여 건너뛰기</SkipHint>}
    </Overlay>
  )
}

export default LoginSuccessAnimation

// Styled Components

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(23, 23, 23, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
`

const SuccessIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['5xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.blue500};
  margin-bottom: ${props => props.theme.spacing.lg};
  transform: scale(0.5);
  opacity: 0;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`

const Message = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.white};
  opacity: 0;
  text-align: center;
  padding: 0 ${props => props.theme.spacing.lg};
`

const SkipHint = styled.div`
  position: absolute;
  bottom: ${props => props.theme.spacing['2xl']};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.white};
  opacity: 0;
  text-align: center;
`
