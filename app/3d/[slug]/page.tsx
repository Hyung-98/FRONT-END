import Header from '@/components/Header'
import Footer from '@/components/Footer'
import * as S from '../../styles'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const Scene3D = dynamic(() => import('@/components/Scene3D'), { ssr: false })

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Three.js 사용법',
    description:
      'Next.js에서 Three.js 기본 사용법: Scene, Camera, Renderer, Mesh, Light 구성 및 OrbitControls 사용',
  }
}

export default function ThreeJsUsagePage({ params }: PageProps) {
  return (
    <>
      <Header />
      <main id="main-content">
        <S.Main>
          <S.HeaderSection>
            <S.Title>Three.js 사용법</S.Title>
            <S.Subtitle>
              브라우저에서 WebGL로 3D를 그리기 위한 기본 구조와 Next.js 연동 방법입니다.
            </S.Subtitle>
          </S.HeaderSection>

          <S.Content>
            <h2>1. 설치</h2>
            <pre>
              <code>npm install three @types/three</code>
            </pre>

            <h2>2. 필수 요소 (Scene → Camera → Renderer → Mesh + Light)</h2>
            <ul>
              <li>
                <strong>Scene</strong> – 3D 객체를 담는 공간
              </li>
              <li>
                <strong>PerspectiveCamera</strong> – 시점(시야각, 비율, near/far)
              </li>
              <li>
                <strong>WebGLRenderer</strong> – canvas에 실제로 그리는 객체
              </li>
              <li>
                <strong>Mesh</strong> – Geometry(형태) + Material(색·질감) 조합
              </li>
              <li>
                <strong>Light</strong> – AmbientLight, DirectionalLight 등 조명
              </li>
            </ul>

            <h2>3. Next.js에서 주의할 점</h2>
            <ul>
              <li>
                <code>&apos;use client&apos;</code>로 마크한 클라이언트 컴포넌트에서만 사용
              </li>
              <li>
                <code>dynamic(Component, &#123; ssr: false &#125;)</code>으로 불러와 서버에서
                three.js가 로드되지 않게 함
              </li>
              <li>
                초기화·렌더 루프·resize·해제는 모두 <code>useEffect</code> 안에서 처리
              </li>
            </ul>

            <h2>4. 데모 (회전 큐브 + OrbitControls)</h2>
            <p>마우스 드래그로 회전, 휠로 줌 가능합니다.</p>
          </S.Content>

          <Scene3D />
        </S.Main>
      </main>
      <Footer />
    </>
  )
}
