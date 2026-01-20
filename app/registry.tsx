'use client'

import { theme } from '@/styles/theme'
import { useServerInsertedHTML } from 'next/navigation'
import React, { useState } from 'react'
import { ServerStyleSheet, StyleSheetManager, ThemeProvider } from 'styled-components'

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    
    // href 속성의 공백 제거
    const cleanedStyles = React.Children.map(styles, (style: any) => {
      if (style?.props?.href) {
        return React.cloneElement(style, {
          ...style.props,
          href: style.props.href.replace(/\s+/g, ''),
        })
      }
      return style
    })
    
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