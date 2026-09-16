"use client"

import { useCallback, useState } from "react"
import { AutoAdvance } from "@/components/apply/auto-advance"
import { MockCamera } from "@/components/apply/mock-camera"
import { OptionCards } from "@/components/apply/option-cards"
import { PrimaryButton, TextLink } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import type { ModuleProps } from "./types"

const docs = [
  { id: "passport", title: "Passport", description: "Any country. Photo page only." },
  { id: "birth", title: "Birth certificate", description: "The full one, not the card." },
  { id: "citizenship", title: "Citizenship certificate", description: "If you were born overseas." },
]

export function IdentityModule({ onComplete }: ModuleProps) {
  const { app, brand } = useApplication()
  const [doc, setDoc] = useState<string>()
  const [read, setRead] = useState(false)
  const [manual, setManual] = useState(false)
  const [name, setName] = useState(`${app.firstName ?? ""} ${app.lastName ?? ""}`.trim())
  const [dob, setDob] = useState("")

  const citizenship = brand.country === "AU" ? "Australian citizen" : "New Zealand citizen"
  const readName = `${app.firstName ?? "Sarah"} Jane ${app.lastName ?? "Bilkey"}`
  const readDob = brand.country === "AU" ? "14 May 1991" : "14 May 2008"

  const onResult = useCallback(() => setRead(true), [])

  if (read) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-2xl bg-success-soft p-4">
          <p className="text-sm font-semibold text-success">Here&apos;s what we read</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{readName}</dd>
            <dt className="text-muted-foreground">Born</dt>
            <dd className="font-medium">{readDob}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">{citizenship}</dd>
          </dl>
        </div>
        <AutoAdvance
          label="Looks right — moving on"
          onDone={() => onComplete("checking", { method: doc ?? "photo", name: readName, dob: readDob, citizenship })}
        />
        <div className="flex justify-center">
          <TextLink onClick={() => setRead(false)}>Something&apos;s wrong, retake</TextLink>
        </div>
      </div>
    )
  }

  if (manual) {
    return (
      <div className="flex flex-col gap-5">
        <TextField label="Full legal name" value={name} onChange={setName} autoComplete="name" />
        <TextField label="Date of birth" value={dob} onChange={setDob} placeholder="DD/MM/YYYY" inputMode="numeric" />
        <p className="text-sm text-muted-foreground">
          We&apos;ll still need to see a document before you start. {brand.shortName} will ask again closer to the day.
        </p>
        <PrimaryButton
          disabled={!name.trim() || dob.trim().length < 8}
          onClick={() => onComplete("sent", { method: "manual", name, dob, citizenship })}
        >
          Next
        </PrimaryButton>
        <div className="flex justify-center">
          <TextLink onClick={() => setManual(false)}>Back to photo</TextLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <OptionCards label="Which document" options={docs} value={doc} onChange={setDoc} />
      {doc && (
        <MockCamera hint="Lay it flat, fill the frame. We'll do the rest." onResult={onResult} />
      )}
      <WhyWeAsk>
        We have to confirm who you are before we can enrol you. We read the document once, keep the details, and delete
        the image after the check.
      </WhyWeAsk>
      <div className="flex justify-center">
        <TextLink onClick={() => setManual(true)}>Don&apos;t have a document handy? Type it for now</TextLink>
      </div>
    </div>
  )
}
