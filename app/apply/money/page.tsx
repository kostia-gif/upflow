"use client"

import { useRouter } from "next/navigation"
import { CircleHelp, HandHelping, ThumbsUp } from "lucide-react"
import { OptionCards } from "@/components/apply/option-cards"
import { StepFrame } from "@/components/apply/step-frame"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { isValidMobile } from "@/lib/format"
import type { FundingId, MoneyHelp } from "@/lib/types"

const fundingFor: Record<MoneyHelp, FundingId | undefined> = { help: "loan", sorted: "self", unsure: undefined }

export default function MoneyPage() {
  const router = useRouter()
  const { app, brand, dispatch } = useApplication()
  const au = brand.country === "AU"
  const scheme = au ? "FEE-HELP" : "Fees Free or StudyLink"
  const shareWithParent = app.parentMobile !== undefined
  const parentOk = !shareWithParent || app.parentMobile === "" || isValidMobile(app.parentMobile ?? "")

  function submit() {
    if (app.parentMobile === "") dispatch({ type: "SET_FIELDS", fields: { parentMobile: undefined } })
    dispatch({ type: "SUBMIT" })
    dispatch({ type: "ASSIGN_ADVISOR" })
    router.push("/apply/received")
  }

  return (
    <StepFrame
      step={3}
      eyebrow="Last one"
      title="Want a hand with the money side?"
      lede="Nothing to decide and nothing to pay today. We just want to point you the right way."
      cta="Send my application"
      ctaDisabled={!app.moneyHelp || !parentOk}
      onCta={submit}
    >
      <div className="flex flex-col gap-5">
        <OptionCards
          label="Money help"
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
              description: "No problem. We'll talk it through once you're in.",
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

        <WhyWeAsk>
          Your answer only changes which money step we show you later. You can change your mind at any point.
        </WhyWeAsk>
      </div>
    </StepFrame>
  )
}
