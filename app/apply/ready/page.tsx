"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarClock, Play } from "lucide-react"
import { useCallback, useState } from "react"
import { CodeEntry } from "@/components/apply/code-entry"
import { ModuleRow } from "@/components/apply/module-row"
import { Eyebrow, Lede, PrimaryButton, TextLink, Title } from "@/components/apply/primitives"
import { RepCard } from "@/components/apply/rep-card"
import { ProgressSegments, WhatsAppPopOut } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { isComplete } from "@/lib/application/reducer"
import { minutesLabel } from "@/lib/config/modules"
import { formatDayMonth } from "@/lib/format"

export default function ReadyHubPage() {
  const router = useRouter()
  const { state, app, brand, rep, modules, progress, minutesLeft, totalSteps, applySteps, nextModule, dispatch } =
    useApplication()
  const gated = state.dev.returning && !state.dev.returningVerified
  const firstName = app.firstName?.trim()
  const name = firstName ? `, ${firstName}` : ""
  const onVerified = useCallback(() => dispatch({ type: "SET_DEV", dev: { returningVerified: true } }), [dispatch])
  const [playing, setPlaying] = useState(false)

  if (gated) {
    return (
      <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <div className="flex-1" />
          <WhatsAppPopOut />
        </div>
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
  const justArrived = progress.done === 0

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 px-5 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <div className="flex-1">
            <ProgressSegments step={applySteps + progress.done} total={totalSteps} />
          </div>
          <WhatsAppPopOut />
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>{justArrived ? "You're in — now let's get you ready" : "Getting ready"}</Eyebrow>
          <Title>
            {allDone
              ? `All done${name}.`
              : justArrived
                ? `Nice one${name}. Your place is on hold.`
                : `Nice one${name}. ${progress.total - progress.done} to go.`}
          </Title>
          <Lede>
            {allDone
              ? `We're checking the last bits. ${brand.shortName} will confirm your enrolment by text.`
              : justArrived
                ? `We've texted a confirmation to ${app.mobile || "your mobile"}. A few quick steps left, ${minutesLabel(minutesLeft).toLowerCase()} — do them now, or stop anytime and we'll save your place.`
                : `${progress.done} of ${progress.total} done · ${minutesLabel(minutesLeft).toLowerCase()}. Stop whenever — we save as you go.`}
          </Lede>
        </div>

        {app.holdUntil && !allDone && (
          <div className="flex items-start gap-3 rounded-2xl bg-warning-soft p-3 text-sm leading-relaxed">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <p>
              Your place is held until <strong>{formatDayMonth(app.holdUntil)}</strong>. Finishing keeps it.
            </p>
          </div>
        )}

        <RepCard
          intro={
            justArrived && rep
              ? app.repAssigned === "assigned"
                ? `${rep.name} is looking after you`
                : `${rep.name} has your application`
              : undefined
          }
        />

        {justArrived && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-foreground text-left"
            aria-label={`Play video: ${brand.tutorVideoCaption}`}
          >
            <Image
              src={brand.tutorVideoPoster}
              alt=""
              fill
              sizes="480px"
              className={playing ? "object-cover opacity-60" : "object-cover transition-transform group-hover:scale-[1.02]"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 text-background">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
                <Play className="ml-0.5 size-5" aria-hidden />
              </span>
              <span className="text-sm font-medium leading-snug">
                {playing ? "Video playback is mocked in this prototype" : brand.tutorVideoCaption}
              </span>
            </div>
          </button>
        )}

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

        <p className="text-center text-sm text-muted-foreground">
          Rather do this on WhatsApp?{" "}
          <TextLink href="/apply/whatsapp" className="min-h-0 text-brand">
            Switch channel
          </TextLink>{" "}
          — your progress comes with you either way.
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 px-5 pb-safe pt-4 backdrop-blur sm:rounded-b-3xl">
        {allDone ? (
          <PrimaryButton onClick={() => router.push("/apply/done")}>See what happens next</PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => next && router.push(`/apply/ready/${next}`)}>
            {nextIsSign
              ? "Review and sign"
              : justArrived
                ? `Finish & confirm my place · ${Math.ceil(minutesLeft)} min`
                : "Next step"}
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
