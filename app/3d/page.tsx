'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

gsap.registerPlugin(ScrollTrigger)

const ThreeJsUsagePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const renderer = new THREE.WebGLRenderer({ canvas })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const orbitHeight = 3
    const orbit = { angle: 0, radius: 40 }

    camera.position.set(
      -orbit.radius * Math.sin(orbit.angle),
      orbitHeight,
      orbit.radius * Math.cos(orbit.angle)
    )
    camera.lookAt(0, 0, 0)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(10, 20, 10)
    scene.add(light)

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    )
    // scene.add(mesh)

    const loader = new GLTFLoader()
    loader.load(
      '/assets/glTF/space_boi/scene.gltf',
      gltf => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        model.position.sub(center)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 10 / maxDim
        model.scale.setScalar(scale)
        model.position.y = -1
        model.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        scene.add(model)
      },
      xhr => {
        if (xhr.lengthComputable && xhr.total > 0) {
          console.log(Math.round((xhr.loaded / xhr.total) * 100) + '% loaded')
        }
      },
      err => {
        console.error('GLTF load error:', err)
      }
    )

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight

      camera.aspect = w / h
      camera.updateProjectionMatrix()

      renderer.setSize(w, h, false)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      ScrollTrigger.update()
      // ScrollTrigger.refresh()
    }

    window.addEventListener('resize', resize)
    resize()

    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 150)

    // render loop
    let running = true
    const render = () => {
      if (!running) return
      requestAnimationFrame(render)
      camera.position.x = -orbit.radius * Math.sin(orbit.angle)
      camera.position.y = orbitHeight
      camera.position.z = orbit.radius * Math.cos(orbit.angle)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    render()

    // 첫 진입 시 자동 애니메이션: 멀리서 가까이로 줌인 (40 -> 15)
    const initialAnimation = gsap.to(orbit, {
      radius: 3,
      duration: 2.5,
      ease: 'power2.out',
      onComplete: () => {
        // 자동 애니메이션 완료 후 orbit.radius는 15에 고정됨
        // ScrollTrigger 활성화
        ScrollTrigger.refresh()
      },
    })

    // ScrollTrigger 애니메이션들
    // section-intro에서는 radius를 변경하지 않음 (이미 15에 고정)
    const introTl = gsap.timeline({
      angle: Math.PI * 2,
      scrollTrigger: {
        trigger: '.section-intro',
        start: 'top top',
        end: '+=2000',
        scrub: true,
        pin: true,
      },
    })
    // radius는 이미 15이므로 변경하지 않음
    introTl.to(orbit, { radius: 3, ease: 'none' })

    gsap.to(orbit, {
      angle: Math.PI * 2,
      ease: 'none',
      scrollTrigger: {
        trigger: '.section-city',
        start: 'top top',
        end: '+=4000',
        scrub: true,
        pin: true,
      },
    })

    return () => {
      running = false
      initialAnimation.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())

      mesh.geometry.dispose()
      mesh.material.dispose()
      renderer.dispose()

      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} id="canvas" className="fixed inset-0 z-0 w-full h-full"></canvas>
      <main id="main-content" className="w-full h-full relative z-10">
        <section className="section section-intro w-full bg-amber-600"></section>
        <section className="section section-city w-full bg-blue-600"></section>
        <section className="section section-detail w-full bg-green-600"></section>
      </main>
    </>
  )
}

export default ThreeJsUsagePage
