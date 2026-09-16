"use client"

import type { CSSProperties, ReactNode } from "react"
import { useApplication } from "@/lib/application/context"

const headingFontVar: Record<string, string> = {
  outfit: "var(--font-outfit)",
  barlow: "var(--font-barlow)",
  cormorant: "var(--font-cormorant)",
  syne: "var(--font-syne)",
}

export function BrandTheme({ children }: { children: ReactNode }) {
  const { brand } = useApplication()
  const style = {
    "--brand": brand.primary,
    "--brand-foreground": brand.primaryForeground,
    "--brand-soft": brand.soft,
    "--brand-accent": brand.accent,
    "--font-brand-heading": headingFontVar[brand.headingFont],
  } as CSSProperties

  return (
    <div data-brand={brand.id} style={style} className="min-h-svh bg-brand-soft text-foreground">
      {children}
    </div>
  )
}
