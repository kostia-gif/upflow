"use client"

import { Info } from "lucide-react"
import { useState } from "react"

export function WhyWeAsk({ children }: { children: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex min-h-8 w-fit items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <Info className="size-3.5" aria-hidden />
        Why we ask
      </button>
      {open && <p className="text-sm leading-relaxed text-foreground/80">{children}</p>}
    </div>
  )
}
