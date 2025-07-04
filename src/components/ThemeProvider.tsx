'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      forcedTheme="dark"
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  )
}
