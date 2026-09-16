"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * Shows a short "moving on" beat then fires onDone, so a confirmed result
 * doesn't need a second tap. Unmounting cancels the timer.
 */
export function AutoAdvance({
  onDone,
  delay = 1400,
  label = "Moving on…",
  className,
}: {
  onDone: () => void
  delay?: number
  label?: string
  className?: string
}) {
  useEffect(() => {
    const t = setTimeout(onDone, delay)
    return () => clearTimeout(t)
  }, [onDone, delay])

  return (
    <div className={cn("flex flex-col gap-2", className)} role="status" aria-live="polite">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="h-1 overflow-hidden rounded-full bg-brand/15">
        <div
          className="h-full rounded-full bg-brand"
          style={{ animation: `auto-advance ${delay}ms linear forwards` }}
        />
      </div>
    </div>
  )
}
