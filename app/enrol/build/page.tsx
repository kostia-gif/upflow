"use client"

import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { TextLink } from "@/components/apply/primitives"
import { StepFrame } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { MAX_MAJORS, priceFor } from "@/lib/config/courses"
import { formatMoney, orderLabel } from "@/lib/enrol/pricing"
import { cn } from "@/lib/utils"

export default function EnrolBuildPage() {
  const router = useRouter()
  const { app, course, totalSteps, dispatch } = useApplication()
  const majors = course.majors ?? []
  const selected = app.majors ?? []
  const tier = priceFor(course, selected.length)
  const atMax = selected.length >= MAX_MAJORS

  function toggle(id: string) {
    if (!selected.includes(id) && atMax) return
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    dispatch({ type: "SET_FIELDS", fields: { majors: next } })
  }

  function skip() {
    dispatch({ type: "SET_FIELDS", fields: { majors: [] } })
    router.push("/enrol/plan")
  }

  return (
    <StepFrame
      step={3}
      totalSteps={totalSteps}
      showRep={false}
      showWhatsApp={false}
      eyebrow="Build your course"
      title="Add the specialisms you care about."
      lede="Advanced Study Majors go deeper in one area. Every one you add comes with a second one free. You can also add none."
      cta="Continue"
      onCta={() => router.push("/enrol/plan")}
      secondary={<TextLink onClick={skip}>Skip, just the Diploma</TextLink>}
      footer={
        tier && (
          <div aria-live="polite" className="flex flex-col gap-0.5 text-center">
            <p className="text-sm font-semibold">
              {orderLabel(selected.length)} · {formatMoney(tier.monthly)} a month or {formatMoney(tier.upfront)} upfront
            </p>
            {selected.length % 2 === 1 && <p className="text-sm text-brand">Your next major is free.</p>}
          </div>
        )
      }
    >
      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Advanced Study Majors" className="flex flex-col gap-2">
          {majors.map((m) => {
            const index = selected.indexOf(m.id)
            const active = index >= 0
            const free = active && index % 2 === 1
            const unavailable = !active && atMax
            return (
              <button
                key={m.id}
                type="button"
                role="checkbox"
                aria-checked={active}
                disabled={unavailable}
                onClick={() => toggle(m.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all active:scale-[0.99] disabled:opacity-50",
                  active ? "border-brand bg-brand-soft/40" : "border-border hover:border-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border-2",
                    active ? "border-brand bg-brand text-brand-foreground" : "border-border",
                  )}
                  aria-hidden
                >
                  {active && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 text-pretty text-base font-semibold leading-snug">{m.title}</span>
                {free && (
                  <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                    Free
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-sm text-muted-foreground">
          {atMax
            ? `That's the most you can add: ${MAX_MAJORS} majors.`
            : `${selected.length} of ${MAX_MAJORS} added. You can change these before you pay.`}
        </p>
      </div>
    </StepFrame>
  )
}
