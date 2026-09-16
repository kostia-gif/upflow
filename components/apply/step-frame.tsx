"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Eyebrow, Lede, PrimaryButton, Title } from "./primitives"
import { RepCard } from "./rep-card"

export function ProgressSegments({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-brand" : "bg-brand/15")}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Step {step} of {total}
      </p>
    </div>
  )
}

export function StepFrame({
  step,
  totalSteps = 3,
  eyebrow,
  title,
  lede,
  children,
  cta,
  ctaDisabled,
  onCta,
  secondary,
  back = true,
  showRep = true,
  footer,
}: {
  step?: number
  totalSteps?: number
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  children?: ReactNode
  cta?: string
  ctaDisabled?: boolean
  onCta?: () => void
  secondary?: ReactNode
  back?: boolean
  showRep?: boolean
  footer?: ReactNode
}) {
  const router = useRouter()
  return (
    <div className="flex min-h-[calc(100svh-61px)] flex-col sm:min-h-0">
      <div className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-4">
        <div className="flex flex-col gap-5">
          {(back || step) && (
            <div className="flex items-center gap-3">
              {back && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  aria-label="Back"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="size-5" aria-hidden />
                </button>
              )}
              {step && (
                <div className="flex-1">
                  <ProgressSegments step={step} total={totalSteps} />
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Title>{title}</Title>
            {lede && <Lede>{lede}</Lede>}
          </div>
        </div>
        {showRep && <RepCard />}
        {children}
      </div>
      {(cta || secondary || footer) && (
        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 px-5 pb-safe pt-4 backdrop-blur sm:rounded-b-3xl">
          {footer}
          {cta && (
            <PrimaryButton onClick={onCta} disabled={ctaDisabled}>
              {cta}
            </PrimaryButton>
          )}
          {secondary && <div className="flex justify-center">{secondary}</div>}
        </div>
      )}
    </div>
  )
}
