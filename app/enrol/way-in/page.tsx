"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, CircleAlert, Globe } from "lucide-react"
import { OptionCards } from "@/components/apply/option-cards"
import { PrimaryButton } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { StepFrame } from "@/components/apply/step-frame"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import {
  CITIZENSHIP_ANSWERS,
  DEGREE_ON_FILE,
  ENGLISH_FIRST_LANGUAGE,
  NOT_DOMESTIC,
  PATHWAY_NAMES,
  PATHWAY_OPTIONS,
  type Pathway,
} from "@/lib/enrol/masters"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"

export default function EnrolWayInPage() {
  const router = useRouter()
  const { app, rep, totalSteps, nextModule, dispatch } = useApplication()
  const advisor = rep?.name ?? "Your advisor"
  const english = app.eligibility[ENGLISH_FIRST_LANGUAGE]
  const international = app.citizenship === NOT_DOMESTIC
  const answered = !!app.pathway && !!app.citizenship && !!english
  const noBachelor = app.pathway === "none"

  function continueApplication() {
    dispatch({ type: "SUBMIT" })
    if (app.pathway === "aipc-bachelor") {
      dispatch({ type: "SET_MODULE_STATUS", module: "degree", status: "done" })
      dispatch({ type: "SET_MODULE_DATA", module: "degree", data: { method: DEGREE_ON_FILE } })
    } else if (app.moduleData.degree?.method === DEGREE_ON_FILE) {
      dispatch({ type: "SET_MODULE_STATUS", module: "degree", status: "todo" })
      dispatch({ type: "SET_MODULE_DATA", module: "degree", data: { method: "" } })
    }
    const first = nextModule()
    router.push(first ? `${ENROL_STEPS_PATH}/${first}` : ENROL_STEPS_PATH)
  }

  return (
    <StepFrame
      step={3}
      totalSteps={totalSteps}
      showRep={false}
      showWhatsApp={false}
      eyebrow="Your way in"
      title="Which of these is you?"
      lede="There are three ways into the Master. You only need one."
    >
      <div className="flex flex-col gap-6">
        <OptionCards
          label="Which of these is you?"
          value={app.pathway}
          onChange={(id) => dispatch({ type: "SET_FIELDS", fields: { pathway: id as Pathway } })}
          options={PATHWAY_OPTIONS}
        />
        <Segmented
          label="Are you an Australian citizen or permanent resident?"
          options={CITIZENSHIP_ANSWERS}
          value={app.citizenship}
          onChange={(v) =>
            dispatch({ type: "SET_FIELDS", fields: { citizenship: v, residency: v === NOT_DOMESTIC ? "no" : "yes" } })
          }
          why={<WhyWeAsk>It decides whether FEE-HELP is open to you.</WhyWeAsk>}
        />
        <Segmented
          label="Is English your first language?"
          options={["Yes", "No"]}
          value={english}
          onChange={(v) => dispatch({ type: "SET_ELIGIBILITY", id: ENGLISH_FIRST_LANGUAGE, value: v })}
        />

        {international && (
          <div className="flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <p className="text-sm leading-relaxed">
                International applications work a little differently — visa, English level and fees. Our international
                team handles those personally.
              </p>
            </div>
            <Link
              href="/international"
              className="flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground"
            >
              Go to international applications
            </Link>
          </div>
        )}

        {!international && answered && noBachelor && (
          <div role="status" className="flex flex-col gap-3 rounded-2xl bg-warning-soft p-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
              <p className="text-sm leading-relaxed">
                The Master needs a Bachelor degree. The Graduate Diploma of Counselling could be your way in.
              </p>
            </div>
            <Link
              href="/"
              className="flex h-12 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background"
            >
              Talk to {rep?.name ?? "an advisor"} about options
            </Link>
          </div>
        )}

        {!international && answered && !noBachelor && app.pathway && (
          <div role="status" className="flex flex-col gap-3 rounded-2xl bg-success-soft p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
              <div className="flex flex-col gap-2 text-sm leading-relaxed">
                <p>
                  <span className="font-semibold">You look eligible through {PATHWAY_NAMES[app.pathway]}.</span>{" "}
                  Admissions will confirm once they&apos;ve seen your degree, usually within two working days.
                </p>
                {english === "No" && (
                  <p className="text-foreground/80">
                    We&apos;ll also ask for proof of your English level. {advisor} will tell you exactly what counts.
                  </p>
                )}
              </div>
            </div>
            <PrimaryButton onClick={continueApplication}>Continue my application</PrimaryButton>
          </div>
        )}
      </div>
    </StepFrame>
  )
}
