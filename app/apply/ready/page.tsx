"use client"

import { useRouter } from "next/navigation"
import { CalendarClock, MessageSquare } from "lucide-react"
import { useCallback } from "react"
import { CodeEntry } from "@/components/apply/code-entry"
import { ModuleRow } from "@/components/apply/module-row"
import { Eyebrow, Lede, PrimaryButton, TextLink, Title } from "@/components/apply/primitives"
import { RepCard } from "@/components/apply/rep-card"
import { StatusTracker } from "@/components/apply/status-tracker"
import { useApplication } from "@/lib/application/context"
import { isComplete } from "@/lib/application/reducer"
import { minutesLabel } from "@/lib/config/modules"
import { formatDayMonth } from "@/lib/format"

export default function ReadyHubPage() {
  const router = useRouter()
  const { state, app, brand, modules, progress, minutesLeft, nextModule, dispatch } = useApplication()
  const gated = state.dev.returning && !state.dev.returningVerified
  const firstName = app.firstName?.trim()
  const name = firstName ? `, ${firstName}` : ""
  const onVerified = useCallback(() => dispatch({ type: "SET_DEV", dev: { returningVerified: true } }), [dispatch])

  if (gated) {
    return (
      <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Welcome back</Eyebrow>
          <Title>Good to see you{name}.</Title>
          <Lede>
            You&apos;ve done {progress.done} of {progress.total} steps. Confirm it&apos;s you and we&apos;ll pick up
            from there.
          </Lede>
        </div>
        <CodeEntry mobile={app.mobile ?? ""} onVerified={onVerified} />
      </div>
    )
  }

  const othersDone = modules.filter((m) => m !== "sign").every((m) => isComplete(app, m))
  const allDone = othersDone && isComplete(app, "sign")
  const next = nextModule(state.lastModule)
  const nextIsSign = next === "sign"

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 px-5 pb-6 pt-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Getting ready</Eyebrow>
          <Title>
            {allDone
              ? `All done${name}.`
              : progress.done === 0
                ? `Let's get you ready${name}.`
                : `Nice one${name}. ${progress.total - progress.done} to go.`}
          </Title>
          <Lede>
            {allDone
              ? `We're checking the last bits. ${brand.shortName} will confirm your enrolment by text.`
              : `${progress.done} of ${progress.total} done · ${minutesLabel(minutesLeft).toLowerCase()}. Stop whenever — we save as you go.`}
          </Lede>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex h-2 overflow-hidden rounded-full bg-brand/15" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-label="Get-ready progress">
            <div className="rounded-full bg-brand transition-[width] duration-500" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
          <StatusTracker current={allDone ? "Enrolled" : "Getting ready"} />
        </div>

        {app.holdUntil && !allDone && (
          <div className="flex items-start gap-3 rounded-2xl bg-warning-soft p-3 text-sm leading-relaxed">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <p>
              Your place is held until <strong>{formatDayMonth(app.holdUntil)}</strong>. Finishing keeps it.
            </p>
          </div>
        )}

        <RepCard />

        <ul className="flex flex-col gap-2">
          {modules.map((m) => (
            <li key={m}>
              <ModuleRow
                id={m}
                status={app.modules[m] ?? "todo"}
                country={brand.country}
                locked={m === "sign" && !othersDone}
                highlight={m === next}
              />
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
          <MessageSquare className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Rather do this over WhatsApp?{" "}
            <TextLink href="/apply/whatsapp" className="min-h-0 text-brand">
              Switch channel
            </TextLink>
            . Your progress comes with you.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 px-5 pb-safe pt-4 backdrop-blur sm:rounded-b-3xl">
        {allDone ? (
          <PrimaryButton onClick={() => router.push("/apply/done")}>See what happens next</PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => next && router.push(`/apply/ready/${next}`)}>
            {nextIsSign ? "Review and sign" : progress.done === 0 ? "Start with the first one" : "Next step"}
          </PrimaryButton>
        )}
        {!allDone && (
          <div className="flex justify-center">
            <TextLink href="/apply/finish-later">Finish later</TextLink>
          </div>
        )}
      </div>
    </div>
  )
}
