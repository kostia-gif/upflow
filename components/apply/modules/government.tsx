"use client"

import { ShieldCheck } from "lucide-react"
import { useState } from "react"
import { NativeSelect, PrimaryButton } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { useApplication } from "@/lib/application/context"
import type { ModuleProps } from "./types"

type Q = { id: string; label: string; options: string[]; optional?: boolean; select?: boolean }

const questions: Record<"NZ" | "AU", Q[]> = {
  NZ: [
    { id: "ethnicity", label: "Which ethnicity do you identify with?", options: ["NZ European", "Māori", "Pacific", "Asian", "MELAA", "Other"], select: true },
    { id: "iwi", label: "Iwi, if you'd like to tell us", options: ["Ngāpuhi", "Ngāti Porou", "Ngāi Tahu", "Waikato", "Te Arawa", "Other", "Prefer not to say"], optional: true, select: true },
    { id: "language", label: "First language", options: ["English", "Te Reo Māori", "Samoan", "Other"] },
    { id: "disability", label: "Do you live with a disability or health condition?", options: ["Yes", "No", "Prefer not to say"] },
    { id: "activity", label: "What were you mostly doing last year?", options: ["At school", "Working", "Studying", "Looking for work", "Other"], select: true },
    { id: "qualification", label: "Highest school qualification so far", options: ["None yet", "NCEA Level 1", "NCEA Level 2", "NCEA Level 3", "Overseas"], select: true },
  ],
  AU: [
    { id: "indigenous", label: "Are you of Aboriginal or Torres Strait Islander origin?", options: ["No", "Aboriginal", "Torres Strait Islander", "Both"] },
    { id: "language", label: "Main language at home", options: ["English", "Other"] },
    { id: "disability", label: "Do you live with a disability or health condition?", options: ["Yes", "No", "Prefer not to say"] },
    { id: "country", label: "Country of birth", options: ["Australia", "New Zealand", "United Kingdom", "India", "China", "Other"], select: true },
    { id: "activity", label: "What were you mostly doing last year?", options: ["Working full-time", "Working part-time", "Studying", "Looking for work", "Other"], select: true },
    { id: "parents", label: "Highest education of a parent or guardian", options: ["Postgraduate", "Bachelor", "Diploma or trade", "Year 12", "Below Year 12", "Don't know"], optional: true, select: true },
  ],
}

export function GovernmentModule({ onComplete }: ModuleProps) {
  const { brand } = useApplication()
  const qs = questions[brand.country]
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const complete = qs.filter((q) => !q.optional).every((q) => answers[q.id])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl bg-muted p-3 text-sm leading-relaxed">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
        <p>
          {brand.country === "AU" ? "The Australian Government" : "The Tertiary Education Commission"} asks every
          provider for these. They&apos;re reported without your name and they never affect your application.
        </p>
      </div>
      {qs.map((q) =>
        q.select ? (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label htmlFor={q.id} className="text-sm font-medium">
              {q.label}
              {q.optional && <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>}
            </label>
            <NativeSelect
              id={q.id}
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            >
              <option value="">Choose one</option>
              {q.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </NativeSelect>
          </div>
        ) : (
          <Segmented
            key={q.id}
            label={q.label}
            options={q.options}
            value={answers[q.id]}
            optional={q.optional}
            onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
          />
        ),
      )}
      <PrimaryButton disabled={!complete} onClick={() => onComplete("done", answers)}>
        Next
      </PrimaryButton>
    </div>
  )
}
