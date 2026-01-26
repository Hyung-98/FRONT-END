'use client'

import { theme } from '@/styles/theme'
import { useServerInsertedHTML } from 'next/navigation'
import React, { useState } from 'react'
import { ServerStyleSheet, StyleSheetManager, ThemeProvider } from 'styled-components'

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()

    // href 속성 제거 (precedence만 사용하여 hydration 경고 방지)
    const cleanedStyles = React.Children.map(
      styles,
      (style: React.ReactElement<{ href?: string }>) => {
        if (style && typeof style === 'object' && 'props' in style) {
          const { href, ...restProps } = style.props || {}
          // href 속성을 제거하고 precedence만 유지
          return React.cloneElement(style, {
            ...restProps,
          })
        }
        return style
      }
    )

    return <>{cleanedStyles}</>
  })

  if (typeof window !== 'undefined') {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyleSheetManager>
  )
}
