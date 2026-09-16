"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, CircleAlert, Globe } from "lucide-react"
import { Segmented } from "@/components/apply/segmented"
import { StepFrame } from "@/components/apply/step-frame"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { cn } from "@/lib/utils"

export default function AmIInPage() {
  const router = useRouter()
  const { app, brand, course, rep, totalSteps, dispatch } = useApplication()

  const countryName = brand.country === "AU" ? "Australian" : "New Zealand"
  const answered = course.eligibilityQuestions.every((q) => app.eligibility[q.id]) && !!app.residency

  const verdicts = course.eligibilityQuestions.map((q) => {
    const a = app.eligibility[q.id]
    if (!a) return { q, state: "unanswered" as const }
    if (q.passing.includes(a)) return { q, state: "pass" as const }
    if (q.soft?.includes(a)) return { q, state: "soft" as const }
    return { q, state: "fail" as const }
  })
  const hardFail = verdicts.find((v) => v.state === "fail")
  const softs = verdicts.filter((v) => v.state === "soft")
  const international = app.residency === "no"

  return (
    <StepFrame
      step={3}
      totalSteps={totalSteps}
      title="Am I in?"
      lede="Quick honesty check. Most people are — and if you're not quite there yet, we'll show you what fits."
      cta={international ? undefined : "Next"}
      ctaDisabled={!answered || !!hardFail}
      onCta={() => router.push("/apply/money")}
    >
      <div className="flex flex-col gap-6">
        {course.eligibilityQuestions.map((q) => (
          <Segmented
            key={q.id}
            label={q.label}
            options={q.options}
            value={app.eligibility[q.id]}
            onChange={(v) => dispatch({ type: "SET_ELIGIBILITY", id: q.id, value: v })}
          />
        ))}
        <Segmented
          label={`Are you ${brand.country === "AU" ? "an" : "a"} ${countryName} citizen or permanent resident?`}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={app.residency}
          onChange={(v) => dispatch({ type: "SET_FIELDS", fields: { residency: v as "yes" | "no" } })}
          why={
            <WhyWeAsk>
              Domestic and international students have different fees and paperwork. We ask once so we only show you
              what applies.
            </WhyWeAsk>
          }
        />

        {international && (
          <div className="flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <p className="text-sm leading-relaxed">
                International applications work a little differently — visa, English level and fees. Our international
                team handles those personally.
              </p>
            </div>
            <Link
              href="/international"
              className="flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground"
            >
              Go to international applications
            </Link>
          </div>
        )}

        {!international && answered && (
          <div
            role="status"
            className={cn(
              "flex flex-col gap-3 rounded-2xl p-4",
              hardFail ? "bg-warning-soft" : "bg-success-soft",
            )}
          >
            <div className="flex items-start gap-3">
              {hardFail ? (
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
              ) : (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
              )}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">
                  {hardFail ? "Not this one, not yet." : `Looks good. You meet the entry requirements for ${course.shortTitle}.`}
                </p>
                {hardFail?.q.failNote && <p className="text-sm leading-relaxed">{hardFail.q.failNote}</p>}
                {softs.map((s) => (
                  <p key={s.q.id} className="text-sm leading-relaxed text-foreground/80">
                    {s.q.softNote}
                  </p>
                ))}
              </div>
            </div>
            {hardFail && (
              <Link
                href="/"
                className="flex h-12 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background"
              >
                {rep ? `Talk to ${rep.name} about options` : "See courses that fit now"}
              </Link>
            )}
          </div>
        )}
      </div>
    </StepFrame>
  )
}
