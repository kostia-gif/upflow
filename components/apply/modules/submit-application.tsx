"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { PrimaryButton } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import { moduleMeta } from "@/lib/config/modules"
import { PATHWAY_NAMES, STUDY_MODES } from "@/lib/enrol/masters"
import type { ModuleStatus } from "@/lib/types"
import type { ModuleProps } from "./types"

const STATUS_LABELS: Record<ModuleStatus, string> = {
  todo: "To do",
  later: "To send later",
  sent: "Sent",
  checking: "Being checked",
  done: "Done",
}

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function SubmitApplicationModule({ onComplete }: ModuleProps) {
  const { app, brand, course, modules } = useApplication()
  const fullName = `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim()
  const [typed, setTyped] = useState("")
  const [agree, setAgree] = useState(false)
  const intake = course.intakes.find((i) => i.id === app.intakeId)
  const mode = STUDY_MODES.find((m) => m.value === app.studyMode)
  const match = typed.trim().toLowerCase() === fullName.toLowerCase() && fullName.length > 0
  const last = modules[modules.length - 1]

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-2xl border border-border p-4 text-sm">
        <dt className="text-muted-foreground">Course</dt>
        <dd className="font-medium">{course.title}</dd>
        <dt className="text-muted-foreground">Start</dt>
        <dd className="font-medium">{intake?.label ?? "—"}</dd>
        <dt className="text-muted-foreground">Mode</dt>
        <dd className="font-medium">{mode?.label ?? "—"}</dd>
        <dt className="text-muted-foreground">Pathway</dt>
        <dd className="font-medium">{app.pathway ? sentenceCase(PATHWAY_NAMES[app.pathway]) : "—"}</dd>
        <dt className="text-muted-foreground">Funding</dt>
        <dd className="font-medium">{app.moduleData.money?.fundingLabel || "To be confirmed"}</dd>
      </dl>

      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {modules
          .filter((m) => m !== last)
          .map((m) => (
            <li key={m} className="flex justify-between gap-3">
              <span>{moduleMeta[m].title}</span>
              <span>{STATUS_LABELS[app.modules[m] ?? "todo"]}</span>
            </li>
          ))}
      </ul>

      <label className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
        <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
        <span>
          What I&apos;ve told you is true, and I&apos;ve read {brand.shortName}&apos;s Student Agreement and Privacy
          Notice.
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

      <PrimaryButton
        disabled={!agree || !match}
        onClick={() =>
          onComplete("done", { signedBy: typed.trim(), at: new Date().toISOString() }, "Application submitted.")
        }
      >
        Submit my application
      </PrimaryButton>
    </div>
  )
}
