"use client"

import { useState } from "react"
import { PrimaryButton, TextLink } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import type { ModuleProps } from "./types"

export function IdentityModule({ onComplete }: ModuleProps) {
  const { app, brand } = useApplication()
  const citizenship = brand.country === "AU" ? "Australian citizen" : "New Zealand citizen"
  const defaultName = `${app.firstName ?? "Sarah"} ${app.lastName ?? "Bilkey"}`.trim()
  const defaultDob = brand.country === "AU" ? "14 May 1991" : "14 May 2008"

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(defaultName)
  const [dob, setDob] = useState(defaultDob)

  if (editing) {
    return (
      <div className="flex flex-col gap-5">
        <TextField label="Full legal name" value={name} onChange={setName} autoComplete="name" />
        <TextField label="Date of birth" value={dob} onChange={setDob} placeholder="DD Month YYYY" />
        <PrimaryButton
          disabled={!name.trim() || dob.trim().length < 6}
          onClick={() => onComplete("done", { method: "edited", name, dob, citizenship })}
        >
          Save and confirm
        </PrimaryButton>
        <div className="flex justify-center">
          <TextLink onClick={() => setEditing(false)}>Back</TextLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
        <p className="text-sm font-semibold">Check these are right</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-medium">{name}</dd>
          <dt className="text-muted-foreground">Date of birth</dt>
          <dd className="font-medium">{dob}</dd>
        </dl>
      </div>
      <PrimaryButton onClick={() => onComplete("done", { method: "confirmed", name, dob, citizenship })}>
        Yes, that&apos;s me
      </PrimaryButton>
      <div className="flex justify-center">
        <TextLink onClick={() => setEditing(true)}>Something&apos;s not right</TextLink>
      </div>
      <WhyWeAsk>
        We confirm your identity from the details you gave us when you enquired. No document upload is needed for this
        course.
      </WhyWeAsk>
    </div>
  )
}
