"use client"

import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { useState } from "react"
import { OptionCards } from "@/components/apply/option-cards"
import { TextLink } from "@/components/apply/primitives"
import { StepFrame } from "@/components/apply/step-frame"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import {
  formatMoney,
  orderLabel,
  PLAN_TITLES,
  practicalLine,
  quoteFor,
  tierFor,
  type PaymentPlan,
} from "@/lib/enrol/pricing"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"

export default function EnrolPlanPage() {
  const router = useRouter()
  const { app, course, rep, totalSteps, hydrated, dispatch } = useApplication()
  const [codeOpened, setCodeOpened] = useState(false)
  const codeOpen = codeOpened || !!app.offerCode
  const tier = tierFor(course, app)
  const practical = practicalLine(course)

  if (!hydrated) return null
  if (!tier) {
    return (
      <StepFrame
        showRep={false}
        showWhatsApp={false}
        title="Choose how to pay"
        lede="This course doesn't have payment plans set up."
        secondary={<TextLink href={ENROL_STEPS_PATH}>Go to my steps</TextLink>}
      />
    )
  }

  const monthly = quoteFor(tier, "monthly")
  const fortnightly = quoteFor(tier, "fortnightly")
  const upfront = quoteFor(tier, "upfront")

  const options = [
    {
      id: "monthly",
      title: PLAN_TITLES.monthly,
      tag: "Most popular",
      description: `${formatMoney(tier.monthly)} a month for ${tier.months} months. ${formatMoney(monthly.total)} in total.`,
    },
    {
      id: "fortnightly",
      title: PLAN_TITLES.fortnightly,
      description: `${formatMoney(tier.fortnightly)} a fortnight for ${tier.fortnights} fortnights. ${formatMoney(fortnightly.total)} in total.`,
    },
    {
      id: "upfront",
      title: PLAN_TITLES.upfront,
      description: `${formatMoney(tier.upfront)} once. Saves ${formatMoney(upfront.saving)}.`,
    },
    {
      id: "contact",
      title: PLAN_TITLES.contact,
      description: `${rep?.name ?? "Your advisor"} will call you about other options. Nothing to pay today.`,
    },
  ]

  return (
    <StepFrame
      step={4}
      totalSteps={totalSteps}
      showRep={false}
      showWhatsApp={false}
      title="Choose how to pay"
      lede={`${orderLabel((app.majors ?? []).length)}. Pick the way that suits you.`}
      cta="Continue"
      ctaDisabled={!app.paymentPlan}
      onCta={() => router.push(ENROL_STEPS_PATH)}
      footer={<p className="text-center text-xs text-muted-foreground">You pay on the last step, not now.</p>}
    >
      <div className="flex flex-col gap-5">
        <OptionCards
          label="How would you like to pay?"
          value={app.paymentPlan}
          onChange={(id) => dispatch({ type: "SET_FIELDS", fields: { paymentPlan: id as PaymentPlan } })}
          options={options}
        />

        {practical && (
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {practical} On campus, by video call, or by sending a recording.
          </p>
        )}

        {codeOpen ? (
          <div className="flex flex-col gap-2">
            <TextField
              label="Offer code"
              value={app.offerCode ?? ""}
              onChange={(v) => {
                setCodeOpened(true)
                dispatch({ type: "SET_FIELDS", fields: { offerCode: v.trim() || undefined } })
              }}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
            {app.offerCode && (
              <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="size-4" strokeWidth={3} aria-hidden /> Code applied at checkout
              </p>
            )}
          </div>
        ) : (
          <TextLink onClick={() => setCodeOpened(true)} className="w-fit justify-start">
            I have an offer code
          </TextLink>
        )}
      </div>
    </StepFrame>
  )
}
