"use client"

import { Camera, ScanLine, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { PrimaryButton, SecondaryButton } from "./primitives"

type Phase = "idle" | "capturing" | "reading" | "done"

export function MockCamera({
  label = "Take a photo",
  hint,
  onResult,
  uploadLabel = "Upload a file instead",
}: {
  label?: string
  hint: string
  onResult: () => void
  uploadLabel?: string
}) {
  const [phase, setPhase] = useState<Phase>("idle")

  useEffect(() => {
    if (phase === "capturing") {
      const t = setTimeout(() => setPhase("reading"), 1100)
      return () => clearTimeout(t)
    }
    if (phase === "reading") {
      const t = setTimeout(() => {
        setPhase("done")
        onResult()
      }, 1400)
      return () => clearTimeout(t)
    }
  }, [phase, onResult])

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-foreground text-background",
        )}
        aria-live="polite"
      >
        <div className="absolute inset-6 rounded-xl border-2 border-dashed border-background/50" aria-hidden />
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-2 px-8 text-center">
            <Camera className="size-8 opacity-70" aria-hidden />
            <p className="text-sm text-background/80">{hint}</p>
          </div>
        )}
        {phase === "capturing" && (
          <div className="absolute inset-0 animate-pulse-soft bg-background/20" />
        )}
        {phase === "reading" && (
          <div className="flex flex-col items-center gap-2">
            <ScanLine className="size-8 animate-pulse-soft" aria-hidden />
            <p className="text-sm">Reading it…</p>
          </div>
        )}
        {phase === "done" && <p className="text-sm">Got it.</p>}
      </div>
      {phase === "idle" && (
        <>
          <PrimaryButton arrow={false} onClick={() => setPhase("capturing")}>
            <Camera className="size-5" aria-hidden /> {label}
          </PrimaryButton>
          <SecondaryButton onClick={() => setPhase("reading")}>
            <Upload className="size-5" aria-hidden /> {uploadLabel}
          </SecondaryButton>
        </>
      )}
    </div>
  )
}
