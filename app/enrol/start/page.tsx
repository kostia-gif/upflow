"use client"

import { useRouter } from "next/navigation"
import { Clock, CreditCard, Fingerprint } from "lucide-react"
import { FacultyWelcome } from "@/components/apply/faculty-welcome"
import { OutcomeCallout } from "@/components/apply/outcome-callout"
import { TextLink } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { StepFrame } from "@/components/apply/step-frame"
import { WhatYouNeed } from "@/components/apply/what-you-need"
import { useApplication } from "@/lib/application/context"
import { STUDY_MODES, type StudyMode } from "@/lib/enrol/masters"

const enrolNeeds = [
  { icon: Clock, text: "About 8 minutes" },
  { icon: CreditCard, text: "A payment card" },
  { icon: Fingerprint, text: "Your USI if you have it (we can sort it if not)" },
]

export default function EnrolStartPage() {
  const router = useRouter()
  const { app, brand, course, totalSteps, dispatch } = useApplication()
  const spoken = app.repAssigned === "spoken"
  const firstName = app.firstName?.trim()
  const enrolAndPay = course.flow === "online-enrol-pay"
  const courseName = <span className="text-brand">{course.shortTitle}</span>
  const ready = enrolAndPay || (!!app.intakeId && !!app.studyMode)

  return (
    <StepFrame
      step={1}
      totalSteps={totalSteps}
      back={false}
      showWhatsApp={false}
      title={
        spoken && firstName ? (
          <>
            Good to see you again, {firstName}. {courseName} it is.
          </>
        ) : enrolAndPay ? (
          <>Hi. Let&apos;s get you started on the {courseName}.</>
        ) : (
          <>Hi. Let&apos;s get your {courseName} application in.</>
        )
      }
      lede={
        enrolAndPay
          ? "Self-paced and fully online. Enrol today, start today."
          : "About 10 minutes. Have your degree certificate or transcript and a CV handy, or add them later."
      }
      showRep={false}
      cta={brand.applyCta}
      ctaDisabled={!ready}
      onCta={() => router.push("/enrol/you")}
      secondary={<TextLink href="/">Not sure yet? Back to the overview</TextLink>}
    >
      <div className="flex flex-col gap-6">
        <FacultyWelcome brand={brand.id} courseTitle={course.shortTitle} />
        <OutcomeCallout outcomes={course.outcomes} />
        {enrolAndPay ? (
          <section aria-labelledby="enrol-needs" className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <h2 id="enrol-needs" className="text-sm font-semibold">
              What you&apos;ll need
            </h2>
            <ul className="flex flex-col gap-2">
              {enrolNeeds.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-sm leading-snug">
                  <Icon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            <Segmented
              label="Start"
              options={course.intakes.map((i) => ({ value: i.id, label: i.label }))}
              value={app.intakeId}
              onChange={(v) => dispatch({ type: "SET_FIELDS", fields: { intakeId: v } })}
              helper="You can change this later without starting over."
            />
            <Segmented
              label="How you'll study"
              options={STUDY_MODES}
              value={app.studyMode}
              onChange={(v) =>
                dispatch({ type: "SET_FIELDS", fields: { studyMode: v as StudyMode, campusId: v } })
              }
            />
            <WhatYouNeed />
          </>
        )}
      </div>
    </StepFrame>
  )
}
