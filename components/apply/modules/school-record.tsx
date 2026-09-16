"use client"

import { useCallback, useState } from "react"
import { MockCamera } from "@/components/apply/mock-camera"
import { PrimaryButton, TextLink } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import type { ModuleProps } from "./types"

export function SchoolRecordModule({ onComplete }: ModuleProps) {
  const { brand } = useApplication()
  const au = brand.country === "AU"
  const [code, setCode] = useState("")
  const [photo, setPhoto] = useState(false)
  const [transcript, setTranscript] = useState(false)
  const onPhoto = useCallback(() => setTranscript(true), [])

  const label = au ? "Your USI" : "Your NSN"
  const helper = au
    ? "Unique Student Identifier — 10 characters, on any past uni or TAFE paperwork."
    : "National Student Number — 10 digits, on any NCEA result or school report."
  const valid = au ? code.replace(/\s/g, "").length === 10 : /^\d{10}$/.test(code.replace(/\s/g, ""))

  if (photo) {
    return (
      <div className="flex flex-col gap-5">
        {!transcript ? (
          <MockCamera
            hint={au ? "Any transcript or statement of attainment." : "Your NCEA record of achievement, or a school report."}
            onResult={onPhoto}
          />
        ) : (
          <>
            <div className="rounded-2xl bg-warning-soft p-4 text-sm leading-relaxed">
              <p className="font-semibold text-warning">Sent for a look</p>
              <p className="mt-1">
                A real person reads these. Usually same day. You don&apos;t need to wait — keep going.
              </p>
            </div>
            <PrimaryButton onClick={() => onComplete("sent", { method: "photo" })}>Keep going</PrimaryButton>
          </>
        )}
        <div className="flex justify-center">
          <TextLink onClick={() => setPhoto(false)}>I found my number</TextLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label={label}
        value={code}
        onChange={setCode}
        inputMode={au ? "text" : "numeric"}
        autoCapitalize="characters"
        placeholder={au ? "e.g. K3PQ7R2M9W" : "e.g. 0123456789"}
        helper={helper}
        validate={(v) => (v.trim().length === 0 || valid ? null : `Should be 10 ${au ? "characters" : "digits"}`)}
      />
      <WhyWeAsk>
        {au
          ? "Every Australian student needs a USI. We use it to confirm past study and to report your results."
          : "Your NSN links your NCEA results so we can check the entry requirement without asking you for certificates."}
      </WhyWeAsk>
      <PrimaryButton
        disabled={!valid}
        onClick={() => onComplete("done", au ? { usi: code.toUpperCase() } : { nsn: code })}
      >
        Save
      </PrimaryButton>
      <div className="flex justify-center">
        <TextLink onClick={() => setPhoto(true)}>
          {au ? "Don't have a USI yet? Send a transcript instead" : "Don't know it? Take a photo of your record"}
        </TextLink>
      </div>
    </div>
  )
}
