import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StyledComponentsRegistry from './registry'
import ScrollToTop from './ScrollToTop'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Frontend Developer Interview Questions',
  description: '프론트엔드 개발 면접 질문 및 학습 자료 모음',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <StyledComponentsRegistry>
          <ScrollToTop />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
