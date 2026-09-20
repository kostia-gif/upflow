"use client"

import { GraduationCap } from "lucide-react"
import { useCallback, useState } from "react"
import { AutoAdvance } from "@/components/apply/auto-advance"
import { MockCamera } from "@/components/apply/mock-camera"
import { SecondaryButton, TextLink } from "@/components/apply/primitives"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import type { ModuleProps } from "./types"

export function SchoolRecordModule({ onComplete }: ModuleProps) {
  const { brand } = useApplication()
  const au = brand.country === "AU"
  const [read, setRead] = useState(false)
  const onPhoto = useCallback(() => setRead(true), [])

  const summary = au
    ? { qualification: "Bachelor of Psychology", detail: "University of Queensland", year: "Completed 2014" }
    : { qualification: "NCEA Level 3", detail: "Achieved with Merit", year: "2023" }

  if (read) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-2xl bg-success-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <GraduationCap className="size-4" aria-hidden /> Here&apos;s what we read
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Qualification</dt>
            <dd className="font-medium">{summary.qualification}</dd>
            <dt className="text-muted-foreground">{au ? "Institution" : "Result"}</dt>
            <dd className="font-medium">{summary.detail}</dd>
            <dt className="text-muted-foreground">Year</dt>
            <dd className="font-medium">{summary.year}</dd>
          </dl>
          <p className="text-sm text-muted-foreground">
            Captured and attached to your application. A course specialist will confirm the details.
          </p>
        </div>
        <AutoAdvance label="Saved — moving on" onDone={() => onComplete("checking", { method: "photo", transcript: "uploaded" })} />
        <div className="flex justify-center">
          <TextLink onClick={() => setRead(false)}>That&apos;s not right, retake</TextLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <MockCamera
        label="Photo of my transcript"
        uploadLabel="Upload a file (PDF or image)"
        hint={au ? "Your academic transcript or statement of attainment." : "Your NCEA record of achievement, or a school report."}
        onResult={onPhoto}
      />
      <WhyWeAsk>
        {au
          ? "Your transcript confirms the qualifications you've already earned. We read the results straight off it — no typing, no chasing certificates."
          : "Your record confirms you meet the entry requirement. We read the results straight off it — no typing, no chasing certificates."}
      </WhyWeAsk>
      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <p className="text-center text-sm font-medium">Don&apos;t have it on you right now?</p>
        <SecondaryButton onClick={() => onComplete("later", { method: "later" })}>I&apos;ll send it later</SecondaryButton>
        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll text you a link so you can send it when it&apos;s handy — carry on with the next step now.
        </p>
      </div>
    </div>
  )
}
