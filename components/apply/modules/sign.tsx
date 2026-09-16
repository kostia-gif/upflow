"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { PrimaryButton } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import { moduleMeta } from "@/lib/config/modules"
import type { ModuleProps } from "./types"

export function SignModule({ onComplete }: ModuleProps) {
  const { app, brand, course, modules } = useApplication()
  const fullName = `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim()
  const [typed, setTyped] = useState("")
  const [agree, setAgree] = useState(false)
  const campus = course.campuses.find((c) => c.id === app.campusId)
  const intake = course.intakes.find((i) => i.id === app.intakeId)
  const match = typed.trim().toLowerCase() === fullName.toLowerCase() && fullName.length > 0

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-2xl border border-border p-4 text-sm">
        <dt className="text-muted-foreground">Course</dt>
        <dd className="font-medium">{course.title}</dd>
        <dt className="text-muted-foreground">Where</dt>
        <dd className="font-medium">{campus?.name}</dd>
        <dt className="text-muted-foreground">Starts</dt>
        <dd className="font-medium">{intake?.label}</dd>
        <dt className="text-muted-foreground">Fees</dt>
        <dd className="font-medium">{course.fee}</dd>
        <dt className="text-muted-foreground">Paid by</dt>
        <dd className="font-medium">{course.fundingOptions.find((f) => f.id === app.funding)?.title ?? "—"}</dd>
      </dl>

      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {modules
          .filter((m) => m !== "sign")
          .map((m) => (
            <li key={m} className="flex justify-between">
              <span>{moduleMeta[m].title}</span>
              <span className="capitalize">{app.modules[m] ?? "to do"}</span>
            </li>
          ))}
      </ul>

      <label className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
        <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
        <span>
          I&apos;ve read {brand.shortName}&apos;s{" "}
          <a href="#" className="font-medium text-brand underline-offset-4 hover:underline">
            terms of enrolment
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-brand underline-offset-4 hover:underline">
            privacy statement
          </a>
          , and what I&apos;ve told you is true.
        </span>
      </label>

      <TextField
        label={`Type your full name to sign: ${fullName}`}
        value={typed}
        onChange={setTyped}
        autoComplete="off"
        className="font-heading text-xl italic"
        validate={(v) => (v.trim().toLowerCase() === fullName.toLowerCase() ? null : "Needs to match your name exactly")}
      />

      <PrimaryButton disabled={!agree || !match} onClick={() => onComplete("done", { signedBy: typed, at: new Date().toISOString() })}>
        Sign and finish
      </PrimaryButton>
    </div>
  )
}
