"use client"

import { useState } from "react"
import { OptionCards, type OptionCard } from "@/components/apply/option-cards"
import { PrimaryButton } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { feeHelpOpen } from "@/lib/enrol/masters"
import type { FundingId } from "@/lib/types"
import type { ModuleProps } from "./types"

type FundingChoice = "fee-help" | "mix" | "self" | "talk"

const FEE_HELP_STEPS = [
  { t: "We send you an eCAF link", d: "Electronic Commonwealth Assistance Form. Comes by email after your offer." },
  { t: "You add your Tax File Number", d: "On the government form, not ours. Takes two minutes." },
  { t: "Done — nothing upfront", d: "You repay through tax once you earn over the threshold." },
]

const YES_NO = ["Yes", "No"]

const appFunding: Record<FundingChoice, FundingId | undefined> = {
  "fee-help": "loan",
  mix: "loan",
  self: "self",
  talk: undefined,
}

export function MastersFundingModule({ onComplete }: ModuleProps) {
  const { app, rep, dispatch } = useApplication()
  const advisor = rep?.name ?? "your advisor"
  const [choice, setChoice] = useState<FundingChoice>()
  const [tfn, setTfn] = useState<string>()
  const [inAustralia, setInAustralia] = useState<string>()
  const [centrelink, setCentrelink] = useState<string>()

  const options: (OptionCard & { id: FundingChoice })[] = feeHelpOpen(app.citizenship)
    ? [
        {
          id: "fee-help",
          title: "FEE-HELP",
          tag: "Most students",
          description: "Nothing upfront. Repaid through tax once you earn enough.",
        },
        {
          id: "mix",
          title: "A mix of FEE-HELP and my own money",
          description: "Borrow part and pay the rest each trimester.",
        },
        { id: "self", title: "I'll pay myself", description: "We invoice you per subject, each trimester." },
      ]
    : [
        { id: "self", title: "I'll pay myself", description: "We invoice you per subject, each trimester." },
        { id: "talk", title: `Talk to ${advisor}`, description: "They'll call to go through what's open to you." },
      ]

  const usesFeeHelp = choice === "fee-help" || choice === "mix"
  const ready = !!choice && (!usesFeeHelp || (!!tfn && !!inAustralia && !!centrelink))

  function finish() {
    if (!choice) return
    dispatch({ type: "SET_FIELDS", fields: { funding: appFunding[choice] } })
    const label = options.find((o) => o.id === choice)?.title ?? ""
    onComplete(usesFeeHelp ? "sent" : "done", {
      funding: choice,
      fundingLabel: label,
      tfn: usesFeeHelp ? (tfn ?? "") : "",
      studyInAustralia: usesFeeHelp ? (inAustralia ?? "") : "",
      centrelink: usesFeeHelp ? (centrelink ?? "") : "",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <OptionCards
        label="How would you like to pay?"
        value={choice}
        onChange={(id) => setChoice(id as FundingChoice)}
        options={options}
      />

      {usesFeeHelp && (
        <>
          <ol className="flex flex-col gap-3">
            {FEE_HELP_STEPS.map((s, i) => (
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
          <Segmented
            label="Do you have your Tax File Number handy?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "later", label: "I'll find it" },
              { value: "none", label: "Don't have one" },
            ]}
            value={tfn}
            onChange={setTfn}
            helper={
              tfn === "none"
                ? "You can apply for one at the ATO in about 10 minutes. We'll send the link with your eCAF."
                : undefined
            }
          />
          <Segmented
            label="Will you study at least one subject while in Australia?"
            options={YES_NO}
            value={inAustralia}
            onChange={setInAustralia}
            why={<WhyWeAsk>It&apos;s one of the government&apos;s conditions for FEE-HELP.</WhyWeAsk>}
          />
          <Segmented
            label="Will you apply to Centrelink for Austudy, Abstudy or Youth Allowance?"
            options={YES_NO}
            value={centrelink}
            onChange={setCentrelink}
            why={<WhyWeAsk>If you do, we&apos;ll send the proof of enrolment Centrelink asks for.</WhyWeAsk>}
          />
        </>
      )}

      <PrimaryButton disabled={!ready} onClick={finish}>
        Next
      </PrimaryButton>
    </div>
  )
}
