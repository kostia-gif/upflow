"use client"

import { useRouter } from "next/navigation"
import { Clock, Wallet } from "lucide-react"
import { Segmented } from "@/components/apply/segmented"
import { NativeSelect, TextLink } from "@/components/apply/primitives"
import { StepFrame } from "@/components/apply/step-frame"
import { WhatYouNeed } from "@/components/apply/what-you-need"
import { useApplication } from "@/lib/application/context"

export default function StartPage() {
  const router = useRouter()
  const { app, brand, course, rep, totalSteps, totalMinutes, dispatch } = useApplication()
  const campus = course.campuses.find((c) => c.id === app.campusId)
  const ready = !!app.campusId && !!app.intakeId
  const spoken = app.repAssigned === "spoken" && !!rep
  const firstName = app.firstName?.trim()

  return (
    <StepFrame
      step={1}
      totalSteps={totalSteps}
      back={false}
      title={
        spoken && firstName ? (
          <>
            Good to see you again, {firstName}. <span className="text-brand">{course.shortTitle}</span> it is.
          </>
        ) : (
          <>
            {brand.greeting}. Let&apos;s get you into <span className="text-brand">{course.shortTitle}</span>.
          </>
        )
      }
      lede={
        spoken
          ? `${rep.name} set this up from your chat — check the details and hit Start. About ${course.applyEstimate ?? `${totalMinutes} minutes`} all in.`
          : `About ${course.applyEstimate ?? `${totalMinutes} minutes`} if you do it in one go — but you don't have to. We save as you go.`
      }
      showRep={false}
      cta="Start"
      ctaDisabled={!ready}
      onCta={() => router.push("/apply/you")}
        secondary={<TextLink href="/course">Not sure yet? Back to the course</TextLink>}
    >
      <div className="flex flex-col gap-6">
        <dl className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2 rounded-2xl bg-muted p-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Length</dt>
              <dd className="text-sm font-medium leading-snug">{course.duration}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-2xl bg-muted p-3">
            <Wallet className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Fees</dt>
              <dd className="text-sm font-medium leading-snug">{course.fee}</dd>
            </div>
          </div>
        </dl>

        {course.campuses.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="campus" className="text-sm font-medium">
              Campus
            </label>
            <NativeSelect
              id="campus"
              required
              value={app.campusId ?? ""}
              onChange={(e) => dispatch({ type: "SET_FIELDS", fields: { campusId: e.target.value || undefined } })}
            >
              <option value="" disabled>
                Choose a campus
              </option>
              {course.campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.placesLeft === 0 ? " — waitlist only" : c.placesLeft < 5 ? ` — ${c.placesLeft} places left` : ""}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        {course.intakes.length <= 4 ? (
          <Segmented
            label="When do you want to start?"
            options={course.intakes.map((i) => ({ value: i.id, label: i.label }))}
            value={app.intakeId}
            onChange={(v) => dispatch({ type: "SET_FIELDS", fields: { intakeId: v } })}
            helper={
              campus && campus.placesLeft > 0 && campus.placesLeft < 5
                ? `${campus.placesLeft} places left at ${campus.name}. We hold yours for ${course.holdDays} days once you apply.`
                : campus?.placesLeft === 0
                  ? `${campus.name} is full for this intake. You can still apply and we'll offer you the next spot that opens.`
                  : "You can change this later without starting over."
            }
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="intake" className="text-sm font-medium">
              When do you want to start?
            </label>
            <NativeSelect
              id="intake"
              required
              value={app.intakeId ?? ""}
              onChange={(e) => dispatch({ type: "SET_FIELDS", fields: { intakeId: e.target.value || undefined } })}
            >
              <option value="" disabled>
                Choose a start date
              </option>
              {course.intakes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        <WhatYouNeed />
      </div>
    </StepFrame>
  )
}
