"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { PrimaryButton } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import { moduleMeta } from "@/lib/config/modules"
import {
  formatMoney,
  PLAN_TITLES,
  practicalLine,
  quoteFor,
  selectedMajors,
  tierFor,
} from "@/lib/enrol/pricing"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"
import { finalStepBlockers } from "@/lib/enrol/steps"
import type { ModuleProps } from "./types"

const PROCESSING_MS = 1500
const MOCK_LAST_FOUR = "4242"

const linkClass = "font-medium text-brand underline-offset-4 hover:underline"

export function PayModule({ onComplete }: ModuleProps) {
  const { app, course, rep, modules, dispatch } = useApplication()
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" })
  const [agreed, setAgreed] = useState<Record<string, boolean>>({})
  const [processing, setProcessing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const blockers = finalStepBlockers(app, course, modules)
  const tier = tierFor(course, app)
  const plan = app.paymentPlan

  if (blockers.length > 0) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
        <p className="font-semibold">A couple of things first</p>
        <p>We need these before you can pay:</p>
        <ul className="flex flex-col gap-1">
          {blockers.map((m) => (
            <li key={m}>
              <Link href={`${ENROL_STEPS_PATH}/${m}`} className={linkClass}>
                {moduleMeta[m].title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (!tier || !plan) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
        <p className="font-semibold">Choose how to pay first</p>
        <Link href="/enrol/plan" className={`${linkClass} w-fit`}>
          See the payment options
        </Link>
      </div>
    )
  }

  const quote = quoteFor(tier, plan)
  const majors = selectedMajors(course, app)
  const byCall = plan === "contact"
  const advisor = rep?.name ?? "Your advisor"
  const practical = practicalLine(course)

  const agreements = [
    { id: "truth", label: "What I've told you is true, and I've read the Student Agreement and Privacy Notice." },
    { id: "device", label: "I have a device and internet connection I can study on." },
    ...(byCall ? [] : [{ id: "card", label: "This is my card, or I have the cardholder's permission." }]),
  ]
  const allAgreed = agreements.every((a) => agreed[a.id])
  const cardFilled = Object.values(card).every((v) => v.trim())
  const ready = allAgreed && (byCall || cardFilled)

  function finishPaid() {
    dispatch({ type: "SET_FIELDS", fields: { paidAt: new Date().toISOString() } })
    onComplete("done", { plan: plan as string, amount: String(quote.today), lastFour: MOCK_LAST_FOUR }, "You're enrolled.")
  }

  function pay() {
    setProcessing(true)
    timer.current = setTimeout(finishPaid, PROCESSING_MS)
  }

  const setCardField = (k: keyof typeof card) => (v: string) => setCard((c) => ({ ...c, [k]: v }))

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="order-summary" className="flex flex-col gap-3 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="order-summary" className="text-sm font-semibold">
            Your order
          </h2>
          <Link href="/enrol/plan" className={`text-sm ${linkClass}`}>
            Change
          </Link>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="font-semibold">{course.title}</li>
          {majors.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3">
              <span className="text-pretty">{m.title}</span>
              {m.free && (
                <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                  Free
                </span>
              )}
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border pt-3 text-sm">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium">{PLAN_TITLES[plan]}</dd>
          <dt className="text-muted-foreground">Today</dt>
          <dd className="font-medium">{byCall ? "Nothing to pay" : formatMoney(quote.today)}</dd>
          {quote.instalments && (
            <>
              <dt className="text-muted-foreground">Then</dt>
              <dd className="font-medium">
                {quote.instalments.count - 1} {quote.instalments.adjective} payments of{" "}
                {formatMoney(quote.instalments.each)}
              </dd>
            </>
          )}
          {!byCall && (
            <>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium">
                {formatMoney(quote.total)}
                {plan === "upfront" && ` (saves ${formatMoney(quote.saving)})`}
              </dd>
            </>
          )}
          {app.offerCode && (
            <>
              <dt className="text-muted-foreground">Offer code</dt>
              <dd className="font-medium">{app.offerCode}, applied at checkout</dd>
            </>
          )}
        </dl>
        {byCall && <p className="text-sm">{advisor} will call you about payment. Nothing is charged until you agree a plan.</p>}
        {practical && <p className="text-xs leading-relaxed text-muted-foreground">{practical}</p>}
      </section>

      {!byCall && (
        <section aria-labelledby="card-details" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="card-details" className="text-sm font-semibold">
              Card details
            </h2>
            <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
              Test mode, no payment is taken
            </span>
          </div>
          <TextField
            label="Card number"
            value={card.number}
            onChange={setCardField("number")}
            inputMode="numeric"
            autoComplete="off"
            placeholder="1234 1234 1234 1234"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Expiry"
              value={card.expiry}
              onChange={setCardField("expiry")}
              inputMode="numeric"
              autoComplete="off"
              placeholder="MM / YY"
            />
            <TextField
              label="CVC"
              value={card.cvc}
              onChange={setCardField("cvc")}
              inputMode="numeric"
              autoComplete="off"
              placeholder="123"
            />
          </div>
          <TextField label="Name on card" value={card.name} onChange={setCardField("name")} autoComplete="off" />
        </section>
      )}

      <div className="flex flex-col gap-2">
        {agreements.map((a) => (
          <label key={a.id} className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
            <Checkbox
              checked={!!agreed[a.id]}
              onCheckedChange={(v) => setAgreed((x) => ({ ...x, [a.id]: v === true }))}
              className="mt-0.5"
            />
            <span>{a.label}</span>
          </label>
        ))}
      </div>

      {byCall ? (
        <PrimaryButton
          disabled={!ready}
          onClick={() => onComplete("sent", { plan }, `${advisor} will call you about payment.`)}
        >
          Enrol, {rep?.name ?? "my advisor"} will call me about payment
        </PrimaryButton>
      ) : (
        <PrimaryButton arrow={false} disabled={!ready || processing} onClick={pay}>
          {processing ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden /> Processing
            </>
          ) : (
            `Enrol and pay ${formatMoney(quote.today)} today`
          )}
        </PrimaryButton>
      )}
      <p role="status" className="sr-only">
        {processing ? "Processing your payment" : ""}
      </p>
    </div>
  )
}
