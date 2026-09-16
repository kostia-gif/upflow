"use client"

import { FileText, Link2, Mic, Square } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { AutoAdvance } from "@/components/apply/auto-advance"
import { MockCamera } from "@/components/apply/mock-camera"
import { PrimaryButton, TextLink } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { isValidMobile, wordCount } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ModuleProps } from "./types"

export function SupportPersonModule({ onComplete }: ModuleProps) {
  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState<string>()
  const [phone, setPhone] = useState("")
  const ok = name.trim() && relationship && isValidMobile(phone)
  return (
    <div className="flex flex-col gap-5">
      <TextField label="Their name" value={name} onChange={setName} autoComplete="off" />
      <Segmented
        label="Who are they to you?"
        options={["Parent", "Partner", "Friend", "Other family"]}
        value={relationship}
        onChange={setRelationship}
      />
      <TextField label="Their mobile" value={phone} onChange={setPhone} type="tel" inputMode="tel" />
      <WhyWeAsk>
        Only if we can&apos;t reach you and something time-sensitive comes up, like a class change. We won&apos;t
        share your results with them.
      </WhyWeAsk>
      <PrimaryButton disabled={!ok} onClick={() => onComplete("done", { name, relationship: relationship ?? "", phone })}>
        Next
      </PrimaryButton>
    </div>
  )
}

export function CreditModule({ onComplete }: ModuleProps) {
  const [hasEvidence, setHasEvidence] = useState<string>()
  const [read, setRead] = useState(false)
  const onResult = useCallback(() => setRead(true), [])

  if (read) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-2xl bg-success-soft p-4">
          <p className="text-sm font-semibold text-success">From your CV</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              Youth support worker, 3 years — may count toward a placement unit
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              Bachelor of Psychology — may count toward two theory units
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">A course specialist confirms what counts. Nothing is promised yet.</p>
        </div>
        <AutoAdvance label="Sent for review — moving on" onDone={() => onComplete("checking", { cv: "uploaded" })} />
        <div className="flex justify-center">
          <TextLink onClick={() => setRead(false)}>That&apos;s not right, try another</TextLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Segmented
        label="Do you have a CV, or any other evidence of work or study you've done?"
        options={[
          { value: "yes", label: "Yes, I've got something" },
          { value: "no", label: "No, not really" },
        ]}
        value={hasEvidence}
        onChange={(v) => {
          setHasEvidence(v)
          if (v === "no") onComplete("done", { cv: "skipped" })
        }}
        why={
          <WhyWeAsk>
            Recognition of prior learning can shorten your course and save you fees. A CV, a transcript, a reference
            letter — anything that shows what you&apos;ve done. We only need enough to see what might count.
          </WhyWeAsk>
        }
      />
      {hasEvidence === "yes" && (
        <MockCamera
          label="Photo of my CV or evidence"
          uploadLabel="Upload a file (PDF or Word)"
          hint="Any CV, even an old one. We read the work and study history."
          onResult={onResult}
        />
      )}
    </div>
  )
}

export function StatementModule({ onComplete }: ModuleProps) {
  const [text, setText] = useState("")
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const words = wordCount(text)

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  function stop() {
    setRecording(false)
    setText(
      (t) =>
        (t ? t + " " : "") +
        "I've spent the last three years working alongside young people who were carrying more than they should have to, and the moments that stayed with me were the ones where someone finally felt heard. I want to do that properly, with the training behind it. Counselling feels less like a career change and more like the work I've been circling for years.",
    )
    setSeconds(0)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="statement" className="text-sm font-medium">
          Why counselling, why now?
        </label>
        <textarea
          id="statement"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="Plain words are best. This isn't marked for style."
          className="w-full rounded-2xl border border-input bg-background p-4 text-base leading-relaxed placeholder:text-muted-foreground/70 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/20"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className={cn(words >= 60 && "text-success")}>{words} words · aim for 60 to 300</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => (recording ? stop() : setRecording(true))}
        className={cn(
          "flex h-14 items-center justify-center gap-2 rounded-2xl border-2 text-base font-semibold",
          recording ? "border-destructive bg-destructive/10 text-destructive" : "border-brand/20 text-brand",
        )}
      >
        {recording ? (
          <>
            <Square className="size-4 fill-current" aria-hidden /> Stop · {seconds}s
          </>
        ) : (
          <>
            <Mic className="size-5" aria-hidden /> Say it instead — we&apos;ll write it up
          </>
        )}
      </button>
      <WhyWeAsk>
        Your specialist reads this to understand what you want from the course, and it shapes your placement matching.
        There is no wrong answer.
      </WhyWeAsk>
      <PrimaryButton disabled={words < 30} onClick={() => onComplete("done", { statement: text })}>
        Next
      </PrimaryButton>
    </div>
  )
}

export function PortfolioModule({ onComplete }: ModuleProps) {
  const [link, setLink] = useState("")
  const [uploaded, setUploaded] = useState(false)
  const onResult = useCallback(() => setUploaded(true), [])
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="A link"
        value={link}
        onChange={setLink}
        placeholder="Instagram, Behance, TikTok, Drive — anything"
        inputMode="url"
        helper="Or skip the link and upload a few images below."
      />
      {!uploaded ? (
        <MockCamera label="Photo of something you made" uploadLabel="Upload images" hint="A drawing, a poster, a screenshot of a game level." onResult={onResult} />
      ) : (
        <p className="rounded-2xl bg-success-soft p-3 text-sm text-success">3 images added.</p>
      )}
      <PrimaryButton disabled={!link.trim() && !uploaded} onClick={() => onComplete("done", { link, uploaded: String(uploaded) })}>
        Next
      </PrimaryButton>
      <div className="flex justify-center">
        <TextLink onClick={() => onComplete("done", { skipped: "true" })}>
          <Link2 className="mr-1.5 size-4" aria-hidden /> Nothing yet, skip for now
        </TextLink>
      </div>
    </div>
  )
}

export function PlacementCheckModule({ onComplete }: ModuleProps) {
  const qs = [
    { id: "police", label: "Are you willing to complete a police check before placement?" },
    { id: "wwcc", label: "Do you hold, or can you apply for, a Working with Children Check?" },
    { id: "hours", label: "Can you commit to around 8 hours a week on placement in year two?" },
  ]
  const [a, setA] = useState<Record<string, string>>({})
  const done = qs.every((q) => a[q.id])
  return (
    <div className="flex flex-col gap-6">
      {qs.map((q) => (
        <Segmented
          key={q.id}
          label={q.label}
          options={["Yes", "Not sure"]}
          value={a[q.id]}
          onChange={(v) => setA((x) => ({ ...x, [q.id]: v }))}
        />
      ))}
      {Object.values(a).includes("Not sure") && (
        <p className="rounded-2xl bg-muted p-3 text-sm leading-relaxed">
          &ldquo;Not sure&rdquo; is fine. Your specialist will call to talk it through before placement is arranged.
        </p>
      )}
      <PrimaryButton disabled={!done} onClick={() => onComplete("done", a)}>
        Next
      </PrimaryButton>
    </div>
  )
}

export function KitModule({ onComplete }: ModuleProps) {
  const { brand } = useApplication()
  const [jacket, setJacket] = useState<string>()
  const [shoe, setShoe] = useState<string>()
  const jacketLabel = brand.id === "elite" ? "Tunic size" : "Jacket size"
  return (
    <div className="flex flex-col gap-6">
      <Segmented label={jacketLabel} options={["XS", "S", "M", "L", "XL", "2XL"]} value={jacket} onChange={setJacket} />
      <Segmented label="Shoe size" options={["5", "6", "7", "8", "9", "10", "11", "12"]} value={shoe} onChange={setShoe} />
      <p className="text-sm text-muted-foreground">Your kit is included in your fees and waits for you on day one.</p>
      <PrimaryButton disabled={!jacket || !shoe} onClick={() => onComplete("done", { jacket: jacket ?? "", shoe: shoe ?? "" })}>
        Next
      </PrimaryButton>
    </div>
  )
}
