"use client"

import { useRouter } from "next/navigation"
import { FacultyWelcome } from "@/components/apply/faculty-welcome"
import { OutcomeCallout } from "@/components/apply/outcome-callout"
import { TextLink } from "@/components/apply/primitives"
import { StepFrame } from "@/components/apply/step-frame"
import { WhatYouNeed } from "@/components/apply/what-you-need"
import { useApplication } from "@/lib/application/context"

export default function EnrolStartPage() {
  const router = useRouter()
  const { app, brand, course, totalSteps } = useApplication()
  const spoken = app.repAssigned === "spoken"
  const firstName = app.firstName?.trim()

  return (
    <StepFrame
      step={1}
      totalSteps={totalSteps}
      back={false}
      showWhatsApp={false}
      title={
        spoken && firstName ? (
          <>
            Good to see you again, {firstName}. <span className="text-brand">{course.shortTitle}</span> it is.
          </>
        ) : (
          <>
            Hi. Let&apos;s get you into <span className="text-brand">{course.shortTitle}</span>.
          </>
        )
      }
      lede="We look forward to seeing you enrol."
      showRep={false}
      cta={brand.applyCta}
      onCta={() => router.push("/enrol/you")}
      secondary={<TextLink href="/course">Not sure yet? Back to the course</TextLink>}
    >
      <div className="flex flex-col gap-6">
        <FacultyWelcome brand={brand.id} courseTitle={course.shortTitle} />
        <OutcomeCallout outcomes={course.outcomes} />
        <WhatYouNeed />
      </div>
    </StepFrame>
  )
}
