"use client"

import { ExternalLink } from "lucide-react"
import { useState } from "react"
import { OptionCards } from "@/components/apply/option-cards"
import { PrimaryButton, SecondaryButton } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import type { FundingId } from "@/lib/types"
import type { ModuleProps } from "./types"

export function MoneyModule({ onComplete }: ModuleProps) {
  const { app, brand, course, dispatch } = useApplication()
  const au = brand.country === "AU"
  const funding = app.funding
  const [plan, setPlan] = useState<string>()
  const [payer, setPayer] = useState("")
  const [tfnLater, setTfnLater] = useState<string>()

  if (!funding) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          You said you weren&apos;t sure yet — totally fine. Pick the closest fit and we&apos;ll show you the one step
          that matters. You can change it any time.
        </p>
        <OptionCards
          label="How will you pay"
          value={undefined}
          onChange={(id) => dispatch({ type: "SET_FIELDS", fields: { funding: id as FundingId } })}
          options={course.fundingOptions.map((o, i) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            tag: i === 0 ? "Most students" : undefined,
          }))}
        />
      </div>
    )
  }

  if (funding === "loan") {
    const steps = au
      ? [
          { t: "We send you an eCAF link", d: "Electronic Commonwealth Assistance Form. Comes by email after your offer." },
          { t: "You add your Tax File Number", d: "On the government form, not ours. Takes two minutes." },
          { t: "Done — nothing upfront", d: "You repay through tax once you earn over the threshold." },
        ]
      : [
          { t: "Apply on StudyLink", d: "Choose \"Student Loan\" and pick this course. 15 minutes, once." },
          { t: "StudyLink asks us to confirm", d: "We do that as soon as you're enrolled." },
          { t: "Fees paid direct to us", d: "Plus a weekly living-cost payment if you want it." },
        ]
    return (
      <div className="flex flex-col gap-6">
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s.t} className="flex items-start gap-3 rounded-2xl border border-border p-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
                {i + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{s.t}</span>
                <span className="text-sm leading-snug text-muted-foreground">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>
        {au ? (
          <Segmented
            label="Do you have your Tax File Number handy?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "later", label: "I'll find it" },
              { value: "none", label: "Don't have one" },
            ]}
            value={tfnLater}
            onChange={setTfnLater}
            helper={
              tfnLater === "none"
                ? "You can apply for one at the ATO in about 10 minutes. We'll send the link with your eCAF."
                : undefined
            }
          />
        ) : (
          <a
            href="https://www.studylink.govt.nz"
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand/20 text-sm font-semibold text-brand"
          >
            Open StudyLink <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
        <PrimaryButton
          disabled={au && !tfnLater}
          onClick={() => onComplete("sent", { funding, tfn: tfnLater ?? "" })}
        >
          {au ? "Got it, FEE-HELP it is" : "I've applied on StudyLink"}
        </PrimaryButton>
        {!au && (
          <SecondaryButton onClick={() => onComplete("sent", { funding, studylink: "later" })}>
            Not yet — remind me tomorrow
          </SecondaryButton>
        )}
      </div>
    )
  }

  if (funding === "self") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">{course.fee}. Nothing is due until your offer is accepted.</p>
        <OptionCards
          label="Payment plan"
          value={plan}
          onChange={setPlan}
          options={[
            { id: "full", title: "Pay in full", description: "One payment before you start." },
            { id: "monthly", title: "Monthly", description: "Spread over the course. No interest.", tag: "Popular" },
            { id: "unit", title: au ? "Per unit" : "Per term", description: "Pay as you go." },
          ]}
        />
        <PrimaryButton disabled={!plan} onClick={() => onComplete("done", { funding, plan: plan ?? "" })}>
          Next
        </PrimaryButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TextField
        label="Who is paying?"
        value={payer}
        onChange={setPayer}
        placeholder="Employer, family member or scholarship name"
        helper="We'll send the invoice to them, not you."
      />
      <PrimaryButton disabled={!payer.trim()} onClick={() => onComplete("done", { funding, payer })}>
        Next
      </PrimaryButton>
    </div>
  )
}
