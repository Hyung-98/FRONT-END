'use client'

import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as THREE from 'three'

interface IntroAnimationProps {
  onComplete: () => void
}

// Get responsive particle count for rain
const getParticleCount = (): number => {
  if (typeof window === 'undefined') return 500
  const width = window.innerWidth
  if (width < 480) return 300 // Mobile
  if (width < 768) return 400 // Tablet
  return 500 // Desktop
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete) // ✅ ref로 저장

  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    particles: THREE.Points
    geometry: THREE.BufferGeometry
    material: THREE.PointsMaterial
    frameId: number
    velocities: Float32Array
  } | null>(null)

  // ✅ onComplete이 변경되면 ref 업데이트
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // === Three.js Setup ===
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 30)

    const canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    // === Create Rain Particles ===
    const particleCount = getParticleCount()

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount)

    // Initialize particles at random positions
    for (let i = 0; i < particleCount; i++) {
      // X 위치: 화면 가로 전체
      positions[i * 3] = (Math.random() - 0.5) * 50

      // Y 위치: 위에서 아래로 분포
      positions[i * 3 + 1] = Math.random() * 50 - 10

      // Z 위치: 0 근처 (카메라 시야 안)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      // 밝은 흰색/파란색
      colors[i * 3] = 0.7 + Math.random() * 0.3 // R
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2 // G
      colors[i * 3 + 2] = 1.0 // B

      // 떨어지는 속도 (빠르게)
      velocities[i] = 0.1 + Math.random() * 0.1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 15, // 훨씬 크게
      vertexColors: true,
      transparent: true,
      opacity: 0.8, // 초기값을 높게 설정
      sizeAttenuation: false, // 거리에 관계없이 일정한 크기
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Store in ref
    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      geometry,
      material,
      frameId: 0,
      velocities,
    }

    // === Resize Handler ===
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight

      sceneRef.current.camera.aspect = w / h
      sceneRef.current.camera.updateProjectionMatrix()
      sceneRef.current.renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // === Rain Animation Loop ===
    const animate = () => {
      if (!sceneRef.current) return

      sceneRef.current.frameId = requestAnimationFrame(animate)

      const posArray = sceneRef.current.geometry.attributes.position.array as Float32Array

      // Update particle positions (falling down)
      for (let i = 0; i < particleCount; i++) {
        // Move particle down
        posArray[i * 3 + 1] -= velocities[i]

        // 아래로 떨어지면 위에서 다시 시작
        if (posArray[i * 3 + 1] < -20) {
          posArray[i * 3 + 1] = 40
          posArray[i * 3] = (Math.random() - 0.5) * 50
        }
      }

      sceneRef.current.geometry.attributes.position.needsUpdate = true
      sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera)
    }
    animate()

    // === GSAP Fade In ===
    gsap.to(material, {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
    })

    // ✅ 3초 후 완료
    gsap.delayedCall(3, () => {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          onCompleteRef.current() // ✅ ref에서 호출
        },
      })
    })

    // === Cleanup ===
    return () => {
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.frameId)
        sceneRef.current.geometry.dispose()
        sceneRef.current.material.dispose()
        sceneRef.current.renderer.dispose()
      }
      window.removeEventListener('resize', handleResize)
      gsap.killTweensOf(overlayRef.current) // ✅ GSAP 애니메이션 정리
      gsap.killTweensOf(material)
    }
  }, [])

  return (
    <Overlay ref={overlayRef}>
      <CanvasContainer ref={containerRef} />
    </Overlay>
  )
}

// === Styled Components ===

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  pointer-events: none;
`

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`
