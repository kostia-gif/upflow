"use client"

import { Check, Loader2, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { MockCamera } from "@/components/apply/mock-camera"
import { PrimaryButton, TextLink } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import type { ModuleProps } from "./types"

type View = "lookup" | "type" | "photo"

export function SchoolRecordModule({ onComplete }: ModuleProps) {
  const { app, brand } = useApplication()
  const au = brand.country === "AU"
  const identity = app.moduleData.identity
  const identityKnown = !!identity?.name && !!identity?.dob

  const [view, setView] = useState<View>("lookup")
  const [lookup, setLookup] = useState<"idle" | "searching" | "found">("idle")
  const [code, setCode] = useState("")
  const [transcript, setTranscript] = useState(false)
  const onPhoto = useCallback(() => setTranscript(true), [])

  const short = au ? "USI" : "NSN"
  const long = au ? "Unique Student Identifier" : "National Student Number"
  const registry = au ? "the USI Registry" : "the Ministry of Education"
  const found = au ? "K3PQ7R2M9W" : "0123456789"
  const valid = au ? code.replace(/\s/g, "").length === 10 : /^\d{10}$/.test(code.replace(/\s/g, ""))

  useEffect(() => {
    if (lookup !== "searching") return
    const t = setTimeout(() => setLookup("found"), 1800)
    return () => clearTimeout(t)
  }, [lookup])

  if (view === "photo") {
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
              <p className="mt-1">A real person reads these. Usually same day. You don&apos;t need to wait.</p>
            </div>
            <PrimaryButton onClick={() => onComplete("sent", { method: "photo" })}>Next</PrimaryButton>
          </>
        )}
        <div className="flex justify-center">
          <TextLink onClick={() => setView("lookup")}>Back</TextLink>
        </div>
      </div>
    )
  }

  if (view === "type") {
    return (
      <div className="flex flex-col gap-5">
        <TextField
          label={`Your ${short}`}
          value={code}
          onChange={setCode}
          inputMode={au ? "text" : "numeric"}
          autoCapitalize="characters"
          placeholder={au ? "e.g. K3PQ7R2M9W" : "e.g. 0123456789"}
          helper={
            au
              ? `${long} — 10 characters, on any past uni or TAFE paperwork.`
              : `${long} — 10 digits, on any NCEA result or school report.`
          }
          validate={(v) => (v.trim().length === 0 || valid ? null : `Should be 10 ${au ? "characters" : "digits"}`)}
        />
        <PrimaryButton
          disabled={!valid}
          onClick={() => onComplete("done", au ? { usi: code.toUpperCase() } : { nsn: code })}
        >
          Next
        </PrimaryButton>
        <div className="flex justify-center">
          <TextLink onClick={() => setView("lookup")}>Back</TextLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-semibold">We can find your {short} for you</p>
            <p className="leading-relaxed text-muted-foreground">
              {identityKnown
                ? `With your OK, we'll ask ${registry} for it using the name and date of birth from your ID. Nothing to type.`
                : `With your OK, we'll ask ${registry} for it once your ID is confirmed. Nothing to type.`}
            </p>
          </div>
        </div>

        {lookup === "idle" && (
          <PrimaryButton onClick={() => setLookup("searching")}>
            I authorise {brand.shortName} to retrieve it
          </PrimaryButton>
        )}
        {lookup === "searching" && (
          <div className="flex h-12 items-center justify-center gap-2 rounded-xl bg-muted text-sm font-medium" aria-live="polite">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Asking {registry}…
          </div>
        )}
        {lookup === "found" && (
          <div className="flex flex-col gap-3" aria-live="polite">
            <div className="flex items-center justify-between rounded-xl bg-success-soft px-4 py-3 text-sm">
              <span className="flex items-center gap-2 font-semibold text-success">
                <Check className="size-4" strokeWidth={3} aria-hidden /> Found it
              </span>
              <span className="font-mono tracking-wider">{found}</span>
            </div>
            <PrimaryButton onClick={() => onComplete("done", au ? { usi: found, method: "lookup" } : { nsn: found, method: "lookup" })}>
              Next
            </PrimaryButton>
          </div>
        )}
      </div>

      <WhyWeAsk>
        {au
          ? "Every Australian student needs a USI. We use it to confirm past study and to report your results. We only ask the registry once."
          : "Your NSN links your NCEA results so we can check the entry requirement without asking you for certificates. We only ask once."}
      </WhyWeAsk>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        <TextLink onClick={() => setView("type")}>I know my {short}</TextLink>
        <TextLink onClick={() => setView("photo")}>{au ? "Send a transcript instead" : "Photo of my record instead"}</TextLink>
      </div>
    </div>
  )
}
