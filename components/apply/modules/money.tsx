"use client"

import { CircleHelp, HandHelping, ThumbsUp } from "lucide-react"
import { useState } from "react"
import { OptionCards } from "@/components/apply/option-cards"
import { PrimaryButton } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { isValidMobile } from "@/lib/format"
import type { FundingId, MoneyHelp } from "@/lib/types"
import type { ModuleProps } from "./types"

const fundingFor: Record<MoneyHelp, FundingId | undefined> = { help: "loan", sorted: "self", unsure: undefined }

export function MoneyModule({ onComplete }: ModuleProps) {
  const { app, brand, course, rep, dispatch } = useApplication()
  const au = brand.country === "AU"
  const scheme = au ? "FEE-HELP" : "Fees Free or StudyLink"
  const funding = app.funding
  const [stage, setStage] = useState<"help" | "detail">(app.moneyHelp ? "detail" : "help")
  const [plan, setPlan] = useState<string>()
  const [payer, setPayer] = useState("")
  const [tfnLater, setTfnLater] = useState<string>()

  const shareWithParent = app.parentMobile !== undefined
  const parentOk = !shareWithParent || app.parentMobile === "" || isValidMobile(app.parentMobile ?? "")

  if (stage === "help") {
    return (
      <div className="flex flex-col gap-5">
        <OptionCards
          label="Want a hand with the money side?"
          value={app.moneyHelp}
          onChange={(id) => {
            const help = id as MoneyHelp
            dispatch({ type: "SET_FIELDS", fields: { moneyHelp: help, funding: fundingFor[help] } })
          }}
          options={[
            {
              id: "help",
              title: `Yes, help me with ${scheme}`,
              description: au
                ? "We'll walk you through it. Most students pay nothing upfront."
                : "We'll check what you qualify for and walk you through it.",
              icon: HandHelping,
              tag: "Most students",
            },
            { id: "sorted", title: "I'm sorted, thanks", description: "Paying myself, or someone else is.", icon: ThumbsUp },
            {
              id: "unsure",
              title: "Not sure yet",
              description: `No problem. ${rep ? rep.name : "Your advisor"} can talk it through with you.`,
              icon: CircleHelp,
            },
          ]}
        />

        <label className="flex items-start gap-3 rounded-2xl border border-border p-4">
          <input
            type="checkbox"
            checked={shareWithParent}
            onChange={(e) => dispatch({ type: "SET_FIELDS", fields: { parentMobile: e.target.checked ? "" : undefined } })}
            className="mt-0.5 size-5 shrink-0 rounded border-border accent-brand"
          />
          <span className="flex flex-col gap-0.5 text-sm">
            <span className="font-semibold">Send this to a parent or guardian too</span>
            <span className="leading-snug text-muted-foreground">Handy if someone else is helping with fees.</span>
          </span>
        </label>
        {shareWithParent && (
          <TextField
            label="Their mobile"
            value={app.parentMobile ?? ""}
            onChange={(v) => dispatch({ type: "SET_FIELDS", fields: { parentMobile: v } })}
            type="tel"
            inputMode="tel"
            placeholder={au ? "04xx xxx xxx" : "02x xxx xxxx"}
            helper="Optional. We'll text them a summary, nothing else."
            validate={(v) => (v.trim().length === 0 || isValidMobile(v) ? null : "That doesn't look like a mobile number")}
          />
        )}

        <WhyWeAsk>Your answer only changes what we show you next. You can change your mind at any point.</WhyWeAsk>

        <PrimaryButton
          disabled={!app.moneyHelp || !parentOk}
          onClick={() => {
            if (app.parentMobile === "") dispatch({ type: "SET_FIELDS", fields: { parentMobile: undefined } })
            setStage("detail")
          }}
        >
          Next
        </PrimaryButton>
      </div>
    )
  }

  if (!funding) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Not sure is totally fine. Pick the closest fit so we can show you the one thing that matters — or skip this
          and {rep ? rep.name : "your advisor"} will talk it through with you.
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
        <PrimaryButton onClick={() => onComplete("later", { funding: "unsure" })}>
          Skip — talk it through with {rep ? rep.name : "my advisor"}
        </PrimaryButton>
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
          { t: "We send you the StudyLink link", d: "Once your enrolment is confirmed. It's a 15-minute government form, done once." },
          { t: "StudyLink asks us to confirm", d: "We do that straight away." },
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
        {au && (
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
        )}
        <PrimaryButton
          disabled={au && !tfnLater}
          onClick={() => onComplete("sent", { funding, tfn: tfnLater ?? "", studylink: au ? "" : "pending" })}
        >
          {au ? "Got it, FEE-HELP it is" : "Got it"}
        </PrimaryButton>
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
