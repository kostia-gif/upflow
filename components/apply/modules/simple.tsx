"use client"

import { FileText, Link2, Mic } from "lucide-react"
import { useCallback, useState } from "react"
import { AutoAdvance } from "@/components/apply/auto-advance"
import { MockCamera } from "@/components/apply/mock-camera"
import { PrimaryButton, SecondaryButton, TextLink } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { isValidMobile } from "@/lib/format"
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

const STATEMENT_QUESTIONS = [
  {
    id: "draw",
    label: "What draws you to counselling?",
    placeholder: "A sentence is plenty.",
    sample: "Supporting people through hard times is what I keep coming back to.",
  },
  {
    id: "moment",
    label: "Tell us about a time you supported someone.",
    placeholder: "Just a sentence or two.",
    sample: "I helped a colleague through burnout, and it changed how I listen.",
  },
  {
    id: "future",
    label: "Where do you want to be in five years?",
    placeholder: "A sentence is plenty.",
    sample: "Working as a registered counsellor in community health.",
  },
]

export function StatementModule({ onComplete }: ModuleProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [review, setReview] = useState(false)

  const q = STATEMENT_QUESTIONS[step]
  const answer = answers[q.id] ?? ""
  const ready = answer.trim().length >= 10
  const isLast = step === STATEMENT_QUESTIONS.length - 1

  if (review) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-2xl bg-success-soft p-4">
          <p className="text-sm font-semibold text-success">Your statement, in your words</p>
          <dl className="flex flex-col gap-3 text-sm">
            {STATEMENT_QUESTIONS.map((qq) => (
              <div key={qq.id} className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground">{qq.label}</dt>
                <dd className="leading-relaxed">{answers[qq.id]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <PrimaryButton
          onClick={() =>
            onComplete("done", {
              method: "three-questions",
              statement: STATEMENT_QUESTIONS.map((qq) => answers[qq.id]).join(" "),
            })
          }
        >
          Looks good — submit
        </PrimaryButton>
        <div className="flex justify-center">
          <TextLink
            onClick={() => {
              setReview(false)
              setStep(0)
            }}
          >
            Edit my answers
          </TextLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
          Question {step + 1} of {STATEMENT_QUESTIONS.length}
        </p>
        <label htmlFor="statement-answer" className="text-lg font-medium leading-snug">
          {q.label}
        </label>
        <textarea
          id="statement-answer"
          value={answer}
          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
          rows={3}
          placeholder={q.placeholder}
          className="w-full rounded-2xl border border-input bg-background p-4 text-base leading-relaxed placeholder:text-muted-foreground/70 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/20"
        />
      </div>
      <button
        type="button"
        onClick={() => setAnswers((a) => ({ ...a, [q.id]: q.sample }))}
        className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-brand/20 text-sm font-semibold text-brand hover:bg-brand-soft/60"
      >
        <Mic className="size-4" aria-hidden /> Say it instead — we&apos;ll write it up
      </button>
      <PrimaryButton disabled={!ready} onClick={() => (isLast ? setReview(true) : setStep(step + 1))}>
        {isLast ? "Review" : "Next"}
      </PrimaryButton>
      {step === 0 ? (
        <SecondaryButton onClick={() => onComplete("later", { method: "three-questions" })}>
          I&apos;ll do this later
        </SecondaryButton>
      ) : (
        <div className="flex justify-center">
          <TextLink onClick={() => setStep(step - 1)}>Back</TextLink>
        </div>
      )}
      <WhyWeAsk>
        Three short answers, not an essay. Your specialist reads them to understand what you want from the course, and
        they shape your placement matching. There is no wrong answer.
      </WhyWeAsk>
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
