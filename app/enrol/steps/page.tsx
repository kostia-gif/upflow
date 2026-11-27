"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, BellRing } from "lucide-react"
import { useCallback } from "react"
import { CodeEntry } from "@/components/apply/code-entry"
import { ModuleRow } from "@/components/apply/module-row"
import { Eyebrow, Lede, PrimaryButton, TextLink, Title } from "@/components/apply/primitives"
import { RepCard } from "@/components/apply/rep-card"
import { ProgressSegments } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { isComplete } from "@/lib/application/reducer"
import { minutesLabel } from "@/lib/config/modules"
import { moduleDescription } from "@/lib/enrol/copy"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"
import { finalStepBlockers } from "@/lib/enrol/steps"

export default function EnrolStepsHubPage() {
  const router = useRouter()
  const { state, app, brand, course, modules, progress, minutesLeft, totalSteps, applySteps, nextModule, dispatch } =
    useApplication()
  const gated = state.dev.returning && !state.dev.returningVerified
  const firstName = app.firstName?.trim()
  const name = firstName ? `, ${firstName}` : ""
  const onVerified = useCallback(() => dispatch({ type: "SET_DEV", dev: { returningVerified: true } }), [dispatch])

  const backButton = (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Back"
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
    >
      <ArrowLeft className="size-5" aria-hidden />
    </button>
  )

  if (gated) {
    return (
      <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
        <div className="flex items-center gap-3">{backButton}</div>
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

  const enrolAndPay = course.flow === "online-enrol-pay"
  const last = modules[modules.length - 1]
  const blockers = finalStepBlockers(app, course, modules)
  const othersDone = blockers.length === 0
  const allDone = othersDone && isComplete(app, last)
  const upNext = nextModule(state.lastModule)
  const next = upNext === last && !othersDone ? blockers[0] : upNext
  const finalLabel = enrolAndPay ? "Review and pay" : "Review and submit"

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 px-5 pb-6 pt-4">
        <div className="flex items-center gap-3">
          {backButton}
          <div className="flex-1">
            <ProgressSegments step={applySteps + progress.done} total={totalSteps} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>{allDone ? "All steps" : "Where you're up to"}</Eyebrow>
          <Title>
            {allDone
              ? `All done${name}.`
              : progress.done === 0
                ? enrolAndPay
                  ? "Four quick things, then pay and enrol."
                  : `Your steps${name}.`
                : `Nice one${name}. ${progress.total - progress.done} to go.`}
          </Title>
          <Lede>
            {allDone
              ? `We're checking the last bits. ${brand.shortName} will confirm by text or email.`
              : `${progress.done} of ${progress.total} done · ${minutesLabel(minutesLeft).toLowerCase()}. Stop whenever — we save as you go.`}
          </Lede>
        </div>

        {app.remindLabel && !allDone && (
          <div className="flex items-start gap-3 rounded-2xl bg-muted p-3 text-sm leading-relaxed">
            <BellRing className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <p>
              Reminder set for <strong>{app.remindLabel}</strong> by text or email.
            </p>
          </div>
        )}

        <RepCard channel="text" />

        <ul className="flex flex-col gap-2">
          {modules.map((m) => (
            <li key={m}>
              <ModuleRow
                id={m}
                status={app.modules[m] ?? "todo"}
                country={brand.country}
                locked={m === last && !othersDone}
                highlight={m === next}
                basePath={ENROL_STEPS_PATH}
                description={moduleDescription(app, course, m, brand.country)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 px-5 pb-safe pt-4 backdrop-blur sm:rounded-b-3xl">
        {allDone ? (
          <PrimaryButton onClick={() => router.push("/enrol/done")}>See what happens next</PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => next && router.push(`${ENROL_STEPS_PATH}/${next}`)}>
            {next === last ? finalLabel : progress.done === 0 ? "Start the first step" : "Pick up where I left off"}
          </PrimaryButton>
        )}
        {!allDone && (
          <div className="flex justify-center">
            <TextLink href="/enrol/finish-later">Pause and remind me</TextLink>
          </div>
        )}
      </div>
    </div>
  )
}
