import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SkipLink from '@/components/SkipLink'
import { getClientEnvConfig } from '@/lib/config/env'
import './globals.css'
import StyledComponentsRegistry from './registry'
import ScrollToTop from './ScrollToTop'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Frontend Developer Blog',
    template: '%s | Frontend Developer Blog',
  },
  description: '프론트엔드 개발 면접 질문 및 학습 자료 모음',
  keywords: ['프론트엔드', '개발', 'JavaScript', 'React', 'TypeScript', '면접 질문', '학습 자료'],
  authors: [{ name: 'Frontend Dev' }],
  creator: 'Frontend Dev',
  publisher: 'Frontend Developer Blog',
  icons: {
    icon: '/assets/images/icons/Logos/javascript-original.svg',
    shortcut: '/assets/images/icons/Logos/javascript-original.svg',
    apple: '/assets/images/icons/Logos/javascript-original.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: getClientEnvConfig().nextPublicSiteUrl || 'http://localhost:3000',
    siteName: 'Frontend Developer Blog',
    title: 'Frontend Developer Blog',
    description: '프론트엔드 개발 면접 질문 및 학습 자료 모음',
    images: [
      {
        url: '/assets/images/icons/Logos/javascript-original.svg',
        width: 1200,
        height: 630,
        alt: 'Frontend Developer Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frontend Developer Blog',
    description: '프론트엔드 개발 면접 질문 및 학습 자료 모음',
    images: ['/assets/images/icons/Logos/javascript-original.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <StyledComponentsRegistry>
          <SkipLink />
          <ScrollToTop />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
