"use client"

import Link from "next/link"
import { BookOpen, LogIn, PhoneCall, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Eyebrow, Lede, PrimaryButton, TextLink, Title } from "@/components/apply/primitives"
import { RepCard } from "@/components/apply/rep-card"
import { StatusTracker } from "@/components/apply/status-tracker"
import { StepFrame } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { isComplete } from "@/lib/application/reducer"
import { moduleMeta } from "@/lib/config/modules"
import { formatMoney, nextPaymentDate, PLAN_TITLES, quoteFor, tierFor } from "@/lib/enrol/pricing"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"
import { formatDayMonth } from "@/lib/format"
import type { ModuleId } from "@/lib/types"

const FINISH_LATER_STEPS: ModuleId[] = ["usi", "support-needs", "au-stats"]

function EnrolledDone() {
  const { app, brand, course, rep } = useApplication()
  const firstName = app.firstName?.trim()
  const advisor = rep?.name ?? "Your advisor"
  const tier = tierFor(course, app)
  const plan = app.paymentPlan
  const quote = tier && plan ? quoteFor(tier, plan) : undefined
  const paid = !!app.paidAt && !!quote && plan !== "contact"
  const nextPayment = paid && plan && app.paidAt ? nextPaymentDate(plan, app.paidAt) : undefined
  const pending = FINISH_LATER_STEPS.filter((m) => app.modules[m] === "later" || app.modules[m] === "checking")

  const nextSteps: { icon: LucideIcon; title: string; detail: string; action?: boolean }[] = [
    {
      icon: LogIn,
      title: "Log in to your learning portal",
      detail: `Your login is on its way to ${app.email || "your email"}.`,
      action: true,
    },
    { icon: BookOpen, title: "Your first unit: Counselling foundations", detail: "It's open in your portal now." },
    { icon: PhoneCall, title: `${advisor} will check in this week`, detail: "A quick call or text to see how you're settling in." },
  ]

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-6">
      <div className="flex flex-col gap-3">
        <Eyebrow>You&apos;re enrolled</Eyebrow>
        <Title>
          Welcome to {brand.shortName}
          {firstName ? `, ${firstName}` : ""}. You can start today.
        </Title>
      </div>

      <section aria-labelledby="receipt" className="flex flex-col gap-3 rounded-2xl border border-border p-4">
        <h2 id="receipt" className="text-sm font-semibold">
          {paid ? "Receipt" : "Payment"}
        </h2>
        {paid && quote && plan ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Paid today</dt>
            <dd className="font-medium">{formatMoney(quote.today)}</dd>
            <dt className="text-muted-foreground">Card</dt>
            <dd className="font-medium">Ending {app.moduleData.pay?.lastFour ?? "4242"}</dd>
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium">{PLAN_TITLES[plan]}</dd>
            <dt className="text-muted-foreground">Next payment</dt>
            <dd className="font-medium">
              {nextPayment && quote.instalments
                ? `${formatMoney(quote.instalments.each)} on ${formatDayMonth(nextPayment)}`
                : "None, you've paid in full"}
            </dd>
          </dl>
        ) : (
          <p className="text-sm leading-relaxed">
            Nothing has been charged. {advisor} will call you to set up payment.
          </p>
        )}
        {paid && (
          <p className="text-xs text-muted-foreground">
            Test mode, no payment was taken. A copy goes to {app.email || "your email"}.
          </p>
        )}
      </section>

      <ul className="flex flex-col gap-3">
        {nextSteps.map(({ icon: Icon, title, detail, action }) => (
          <li key={title} className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-sm leading-snug text-muted-foreground">{detail}</span>
              </span>
            </div>
            {action && (
              <PrimaryButton onClick={() => toast("The learning portal is mocked in this prototype.")}>
                Log in to the portal
              </PrimaryButton>
            )}
          </li>
        ))}
      </ul>

      {pending.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-warning-soft p-4 text-sm leading-relaxed">
          <p className="font-semibold text-warning">Still with us</p>
          <ul className="flex flex-col gap-1">
            {pending.map((m) => (
              <li key={m}>
                <Link href={`${ENROL_STEPS_PATH}/${m}`} className="font-medium underline underline-offset-4">
                  {moduleMeta[m].title}
                </Link>{" "}
                — {app.modules[m] === "checking" ? "being checked" : "still to do"}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">Finish these any time in your first two weeks.</p>
        </div>
      )}

      <RepCard channel="text" intro="Questions before you start? Just ask" />

      <div className="flex justify-center">
        <TextLink href="/">Back to {brand.shortName}</TextLink>
      </div>
    </div>
  )
}

const ASSESSMENT_STEPS = ["Submitted", "Being assessed", "Offer", "You accept", "FEE-HELP form", "Enrolled"]

function ApplicationInDone() {
  const { app, brand, rep, modules } = useApplication()
  const firstName = app.firstName?.trim()
  const pending = modules.filter((m) => app.modules[m] === "later" || app.modules[m] === "checking")

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-6">
      <div className="flex flex-col gap-3">
        <Eyebrow>Application in</Eyebrow>
        <Title>Thanks{firstName ? `, ${firstName}` : ""}. It&apos;s with admissions now.</Title>
        <Lede>You&apos;ll hear from {rep?.name ?? "your advisor"} within two working days.</Lede>
      </div>

      <StatusTracker current="Being assessed" steps={ASSESSMENT_STEPS} />

      {pending.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-warning-soft p-4 text-sm leading-relaxed">
          <p className="font-semibold text-warning">Still with us</p>
          <ul className="flex flex-col gap-1">
            {pending.map((m) => (
              <li key={m}>
                {app.modules[m] === "later" ? (
                  <Link href={`${ENROL_STEPS_PATH}/${m}`} className="font-medium underline underline-offset-4">
                    {moduleMeta[m].title}
                  </Link>
                ) : (
                  moduleMeta[m].title
                )}{" "}
                — {app.modules[m] === "checking" ? "being checked" : "still to send"}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">
            Admissions can start without these. We&apos;ll remind you by text or email about anything still to send.
          </p>
        </div>
      )}

      <RepCard channel="text" intro="Questions while you wait? Just ask" />

      <div className="flex justify-center">
        <TextLink href="/">Back to {brand.shortName}</TextLink>
      </div>
    </div>
  )
}

function NotFinishedYet({ lede }: { lede: string }) {
  return (
    <StepFrame
      back={false}
      showRep={false}
      showWhatsApp={false}
      eyebrow="Nearly there"
      title="A few steps to go."
      lede={lede}
      secondary={<TextLink href={ENROL_STEPS_PATH}>Back to my steps</TextLink>}
    />
  )
}

export default function EnrolDonePage() {
  const { app, course, modules, hydrated } = useApplication()
  if (!hydrated) return null
  if (course.flow === "online-enrol-pay") {
    if (!isComplete(app, "pay")) {
      return <NotFinishedYet lede="Finish your steps and pay, and you can start straight away." />
    }
    return <EnrolledDone />
  }
  if (!isComplete(app, modules[modules.length - 1])) {
    return <NotFinishedYet lede="Finish your steps and submit, and admissions will take it from there." />
  }
  return <ApplicationInDone />
}
