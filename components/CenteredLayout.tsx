'use client'

import styled from 'styled-components'
import Footer from './Footer'
import Header from './Header'

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const CenteredMain = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

export default function CenteredLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageWrapper>
      <Header />
      <CenteredMain id="main-content">{children}</CenteredMain>
      <Footer />
    </PageWrapper>
  )
}
