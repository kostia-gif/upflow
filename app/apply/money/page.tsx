"use client"

import { useRouter } from "next/navigation"
import { Banknote, HandCoins, Landmark } from "lucide-react"
import { OptionCards } from "@/components/apply/option-cards"
import { StepFrame } from "@/components/apply/step-frame"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import type { FundingId } from "@/lib/types"

const icons = { loan: Landmark, self: Banknote, other: HandCoins }

export default function MoneyPage() {
  const router = useRouter()
  const { app, course, dispatch } = useApplication()

  function submit() {
    dispatch({ type: "SUBMIT" })
    dispatch({ type: "ASSIGN_ADVISOR" })
    router.push("/apply/received")
  }

  return (
    <StepFrame
      step={3}
      eyebrow="Last question"
      title="How will you pay?"
      lede="Nothing is due today. This just tells us which paperwork to get ready for you."
      cta="Send my application"
      ctaDisabled={!app.funding}
      onCta={submit}
    >
      <div className="flex flex-col gap-4">
        <OptionCards
          label="How will you pay"
          value={app.funding}
          onChange={(id) => dispatch({ type: "SET_FIELDS", fields: { funding: id as FundingId } })}
          options={course.fundingOptions.map((o, i) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            icon: icons[o.id],
            tag: i === 0 ? "Most students" : undefined,
          }))}
        />
        <WhyWeAsk>
          Your answer changes which get-ready step we show you for money. You can switch later and nothing else changes.
        </WhyWeAsk>
      </div>
    </StepFrame>
  )
}
