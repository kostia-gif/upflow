"use client"

import { FileText, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { MockCamera } from "@/components/apply/mock-camera"
import { PrimaryButton, SecondaryButton, TextLink } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import { DEGREE_ON_FILE } from "@/lib/enrol/masters"
import { wordCount } from "@/lib/format"
import type { ModuleProps } from "./types"

export function DegreeModule({ onComplete }: ModuleProps) {
  const { app, brand } = useApplication()
  const [read, setRead] = useState(false)
  const onPhoto = useCallback(() => setRead(true), [])

  if (app.pathway === "aipc-bachelor") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 rounded-2xl bg-success-soft p-4 text-sm leading-relaxed">
          <p className="flex items-center gap-2 font-semibold text-success">
            <GraduationCap className="size-4" aria-hidden /> We have this on file
          </p>
          <p>
            You studied your Bachelor of Counselling with {brand.shortName}, so there&apos;s nothing to upload.
          </p>
        </div>
        <PrimaryButton onClick={() => onComplete("done", { method: DEGREE_ON_FILE })}>Next</PrimaryButton>
      </div>
    )
  }

  if (read) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-2xl bg-success-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <GraduationCap className="size-4" aria-hidden /> Here&apos;s what we read
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Qualification</dt>
            <dd className="font-medium">Bachelor of Psychology</dd>
            <dt className="text-muted-foreground">Institution</dt>
            <dd className="font-medium">University of Queensland</dd>
            <dt className="text-muted-foreground">Completed</dt>
            <dd className="font-medium">2014</dd>
          </dl>
        </div>
        <PrimaryButton onClick={() => onComplete("checking", { method: "photo", degree: "uploaded" })}>
          Looks right, continue
        </PrimaryButton>
        <div className="flex justify-center">
          <TextLink onClick={() => setRead(false)}>That&apos;s not right, retake</TextLink>
        </div>
        <p className="text-center text-xs text-muted-foreground">{brand.shortName} may ask for a certified copy later.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <MockCamera
        label="Photo of your degree or transcript"
        uploadLabel="Upload a file (PDF or image)"
        hint="Your degree certificate or academic transcript."
        onResult={onPhoto}
      />
      <p className="text-center text-xs text-muted-foreground">{brand.shortName} may ask for a certified copy later.</p>
      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <p className="text-center text-sm font-medium">Don&apos;t have it on you right now?</p>
        <SecondaryButton onClick={() => onComplete("later", { method: "later" })}>I&apos;ll send it later</SecondaryButton>
      </div>
    </div>
  )
}

type Role = { id: number; role: string; employer: string; from: string; to: string }

const MAX_ROLES = 4

const MOCK_ROLES: Role[] = [
  { id: 1, role: "Case manager", employer: "Southside Community Care", from: "2022", to: "Present" },
  { id: 2, role: "Youth support worker", employer: "Northside Youth Service", from: "2019", to: "2022" },
]

const roleComplete = (r: Role) => !!r.role.trim() && !!r.employer.trim()

export function WorkHistoryModule({ onComplete }: ModuleProps) {
  const [source, setSource] = useState<"cv" | "typed">()
  const [roles, setRoles] = useState<Role[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [credit, setCredit] = useState<string>()
  const nextId = useRef(MOCK_ROLES.length + 1)

  const onCv = useCallback(() => {
    setRoles(MOCK_ROLES)
    setEditing(null)
    setSource("cv")
  }, [])

  function addRole() {
    const id = nextId.current++
    setRoles((list) => [...list, { id, role: "", employer: "", from: "", to: "" }])
    setEditing(id)
  }

  function typeItIn() {
    setRoles([])
    setSource("typed")
    addRole()
  }

  function update(id: number, field: keyof Omit<Role, "id">, value: string) {
    setRoles((list) => list.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function remove(id: number) {
    setRoles((list) => list.filter((r) => r.id !== id))
    if (editing === id) setEditing(null)
  }

  if (!source) {
    return (
      <div className="flex flex-col gap-6">
        <MockCamera
          label="Photo of my CV"
          uploadLabel="Upload a file (PDF or Word)"
          hint="Any CV, even an old one. We read your work history from it."
          onResult={onCv}
        />
        <div className="flex justify-center">
          <TextLink onClick={typeItIn}>I don&apos;t have a CV, I&apos;ll type it</TextLink>
        </div>
      </div>
    )
  }

  const ready = !!credit && editing === null && roles.length > 0 && roles.every(roleComplete)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-brand" aria-hidden />
            {source === "cv" ? "Here's what we read" : "Your roles"}
          </h2>
          <span className="text-xs text-muted-foreground">
            {roles.length} of {MAX_ROLES}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {roles.map((r) =>
            editing === r.id ? (
              <li key={r.id} className="flex flex-col gap-3 rounded-2xl border-2 border-brand/40 p-4">
                <TextField label="Role" value={r.role} onChange={(v) => update(r.id, "role", v)} autoComplete="off" />
                <TextField
                  label="Employer"
                  value={r.employer}
                  onChange={(v) => update(r.id, "employer", v)}
                  autoComplete="off"
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="From"
                    value={r.from}
                    onChange={(v) => update(r.id, "from", v)}
                    placeholder="e.g. 2019"
                    autoComplete="off"
                  />
                  <TextField
                    label="To"
                    value={r.to}
                    onChange={(v) => update(r.id, "to", v)}
                    placeholder="e.g. Present"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <TextLink onClick={() => remove(r.id)}>Remove</TextLink>
                  <button
                    type="button"
                    disabled={!roleComplete(r)}
                    onClick={() => setEditing(null)}
                    className="min-h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground disabled:opacity-40"
                  >
                    Save role
                  </button>
                </div>
              </li>
            ) : (
              <li key={r.id} className="flex items-center gap-2 rounded-2xl border border-border p-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-semibold">{r.role}</p>
                  <p className="text-sm leading-snug text-muted-foreground">
                    {r.employer}
                    {(r.from || r.to) && ` · ${[r.from, r.to].filter(Boolean).join(" to ")}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(r.id)}
                  aria-label={`Edit ${r.role}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-brand hover:bg-brand-soft"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  aria-label={`Remove ${r.role}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ),
          )}
        </ul>
        {roles.length < MAX_ROLES && editing === null && (
          <button
            type="button"
            onClick={addRole}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-brand hover:border-brand/40"
          >
            <Plus className="size-4" aria-hidden /> Add a role
          </button>
        )}
      </div>

      <Segmented
        label="Want us to check whether any of this could count as credit?"
        options={["Yes please", "No thanks"]}
        value={credit}
        onChange={setCredit}
      />

      <PrimaryButton
        disabled={!ready}
        onClick={() =>
          onComplete(source === "cv" ? "checking" : "done", {
            method: source,
            roles: JSON.stringify(roles.map(({ role, employer, from, to }) => ({ role, employer, from, to }))),
            creditCheck: credit ?? "",
          })
        }
      >
        Next
      </PrimaryButton>
      <div className="flex justify-center">
        <TextLink onClick={() => setSource(undefined)}>
          {source === "cv" ? "Use a different CV" : "Upload a CV instead"}
        </TextLink>
      </div>
    </div>
  )
}

const ENTRY_QUESTIONS = [
  { id: "whyNow", label: "What's drawn you to studying counselling at this point in your life?" },
  {
    id: "subjects",
    label:
      "Thinking about what you want to do after you graduate, which subjects in the Master will help you most, and why?",
  },
  {
    id: "readiness",
    label: "How ready do you feel, personally, for advanced counsellor training? Tell us how you know.",
  },
]

const MIN_ANSWER_CHARS = 10

export function EntryStatementModule({ onComplete }: ModuleProps) {
  const { app, dispatch } = useApplication()
  const drafts = app.moduleData["entry-statement"] ?? {}
  const answerFor = (id: string) => drafts[id] ?? ""
  const isAnswered = (id: string) => answerFor(id).trim().length >= MIN_ANSWER_CHARS
  const allAnswered = ENTRY_QUESTIONS.every((q) => isAnswered(q.id))
  const hasDraft = ENTRY_QUESTIONS.some((q) => answerFor(q.id))

  const [stage, setStage] = useState<"choose" | "answer" | "review">(() =>
    allAnswered ? "review" : hasDraft ? "answer" : "choose",
  )
  const [step, setStep] = useState(() => Math.max(0, ENTRY_QUESTIONS.findIndex((q) => !isAnswered(q.id))))
  const [editingFromReview, setEditingFromReview] = useState(false)

  function saveDraft(id: string, value: string) {
    dispatch({ type: "SET_MODULE_DATA", module: "entry-statement", data: { [id]: value } })
  }

  if (stage === "choose") {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-base leading-relaxed">Three quick questions, a few sentences each. No essay.</p>
        <PrimaryButton
          onClick={() => {
            setStep(0)
            setStage("answer")
          }}
        >
          Answer now
        </PrimaryButton>
        <SecondaryButton onClick={() => onComplete("later", { method: "email" })}>
          Send them later by email
        </SecondaryButton>
      </div>
    )
  }

  if (stage === "review") {
    return (
      <div className="flex flex-col gap-5">
        <ul className="flex flex-col gap-3">
          {ENTRY_QUESTIONS.map((q, i) => (
            <li key={q.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-pretty text-sm font-semibold leading-snug">{q.label}</p>
                <TextLink
                  className="min-h-0 shrink-0 text-brand"
                  onClick={() => {
                    setStep(i)
                    setEditingFromReview(true)
                    setStage("answer")
                  }}
                >
                  Edit
                </TextLink>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{answerFor(q.id)}</p>
            </li>
          ))}
        </ul>
        <PrimaryButton
          disabled={!allAnswered}
          onClick={() =>
            onComplete(
              "checking",
              Object.fromEntries(ENTRY_QUESTIONS.map((q) => [q.id, answerFor(q.id).trim()])),
            )
          }
        >
          Send my answers
        </PrimaryButton>
      </div>
    )
  }

  const question = ENTRY_QUESTIONS[step]
  const answer = answerFor(question.id)
  const isLastQuestion = step === ENTRY_QUESTIONS.length - 1
  const words = wordCount(answer)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {step + 1} of {ENTRY_QUESTIONS.length}
        </span>
        <label htmlFor="entry-answer" className="text-pretty text-lg font-medium leading-snug">
          {question.label}
        </label>
        <textarea
          id="entry-answer"
          key={question.id}
          value={answer}
          onChange={(e) => saveDraft(question.id, e.target.value)}
          rows={4}
          placeholder="A few sentences is plenty"
          className="w-full rounded-2xl border border-input bg-background p-4 text-base leading-relaxed placeholder:text-muted-foreground/70 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/20"
        />
        <p className="text-xs text-muted-foreground">
          {words} {words === 1 ? "word" : "words"} · saved as you type
        </p>
      </div>
      <PrimaryButton
        disabled={!isAnswered(question.id)}
        onClick={() => {
          if (isLastQuestion || editingFromReview) {
            setEditingFromReview(false)
            setStage("review")
          } else {
            setStep(step + 1)
          }
        }}
      >
        {isLastQuestion || editingFromReview ? "Review my answers" : "Next"}
      </PrimaryButton>
      {step > 0 && !editingFromReview && (
        <div className="flex justify-center">
          <TextLink onClick={() => setStep(step - 1)}>Back</TextLink>
        </div>
      )}
    </div>
  )
}
