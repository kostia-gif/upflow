"use client"

import { useRouter } from "next/navigation"
import { Clock, MessageCircle, Save, Wallet } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { FacultyWelcome } from "@/components/apply/faculty-welcome"
import { OutcomeCallout } from "@/components/apply/outcome-callout"
import { Segmented } from "@/components/apply/segmented"
import { NativeSelect, TextLink } from "@/components/apply/primitives"
import { RepCard } from "@/components/apply/rep-card"
import { StepFrame } from "@/components/apply/step-frame"
import { TextField } from "@/components/apply/text-field"
import { WhatYouNeed } from "@/components/apply/what-you-need"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { isValidEmail, isValidMobile } from "@/lib/format"

export default function StartPage() {
  const router = useRouter()
  const { app, brand, course, rep, totalSteps, dispatch } = useApplication()
  const campus = course.campuses.find((c) => c.id === app.campusId)
  const spoken = app.repAssigned === "spoken" && !!rep
  const firstName = app.firstName?.trim()
  const [stage, setStage] = useState<"form" | "welcome">("form")

  const set = (k: "firstName" | "lastName" | "mobile" | "email") => (v: string) =>
    dispatch({ type: "SET_FIELDS", fields: { [k]: v } })

  const courseReady = !!app.campusId && !!app.intakeId
  const detailsReady =
    !!app.firstName?.trim() && !!app.lastName?.trim() && isValidMobile(app.mobile ?? "") && isValidEmail(app.email ?? "")
  const ready = courseReady && detailsReady

  function proceed() {
    if (!ready) return
    dispatch({ type: "ASSIGN_ADVISOR" })
    setStage("welcome")
  }

  if (stage === "welcome") {
    const name = app.firstName?.trim() || "there"
    const helpers = [
      {
        icon: MessageCircle,
        title: "Stuck on anything? Just ask",
        body: rep
          ? `Message or call ${rep.name} from any screen — a real person, not a bot. They usually reply in minutes.`
          : "Message or call us from any screen — a real person, not a bot.",
      },
      {
        icon: Save,
        title: "Nothing is lost",
        body: "Every answer saves the moment you give it. Close the tab, switch phones, come back next week — it's all here.",
      },
      {
        icon: Clock,
        title: "Skip what you don't have on you",
        body: "Missing a document? Skip that step and add it later — nothing holds up the rest.",
      },
    ]
    return (
      <StepFrame
        step={1}
        totalSteps={totalSteps}
        back={false}
        eyebrow="Your place is saved"
        title={`Nice to meet you, ${name}.`}
        lede={
          rep
            ? spoken
              ? `${rep.name} has been looking after you since your chat, and stays with you right through to your first day.`
              : `${rep.name} is your ${rep.role.toLowerCase()} from here on — one person, right through to your first day.`
            : "Your application is yours now. Here's how we make the rest easy."
        }
        showRep={false}
        cta="Let's keep going"
        onCta={() => router.push("/apply/am-i-in")}
      >
        <div className="flex flex-col gap-6">
          <RepCard
            intro={
              rep
                ? spoken
                  ? `Welcome back, ${name} — I've kept your details, nothing to re-type.`
                  : `Hi ${name}! Great to see you taking the next step. Ask me anything, any time.`
                : undefined
            }
          />
          <ul className="flex flex-col gap-4">
            {helpers.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold leading-snug">{title}</p>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </StepFrame>
    )
  }

  return (
    <StepFrame
      step={1}
      totalSteps={totalSteps}
      back={false}
      title={
        spoken && firstName ? (
          <>
            Good to see you again, {firstName}. <span className="text-brand">{course.shortTitle}</span> it is.
          </>
        ) : (
          <>
            {brand.greeting}. Let&apos;s get you into <span className="text-brand">{course.shortTitle}</span>.
          </>
        )
      }
      showRep={false}
      cta="Start my application"
      ctaDisabled={!ready}
      onCta={proceed}
      secondary={<TextLink href="/course">Not sure yet? Back to the course</TextLink>}
      footer={
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          No code to enter — you&apos;ll confirm your number at the end, in one tap.{" "}
          <a href="#" className="underline underline-offset-2" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
        </p>
      }
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          proceed()
        }}
      >
        <FacultyWelcome brand={brand.id} courseTitle={course.shortTitle} />

        <OutcomeCallout outcomes={course.outcomes} />

        <dl className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2 rounded-2xl bg-muted p-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Length</dt>
              <dd className="text-sm font-medium leading-snug">{course.duration}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-2xl bg-muted p-3">
            <Wallet className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Fees</dt>
              <dd className="text-sm font-medium leading-snug">{course.fee}</dd>
            </div>
          </div>
        </dl>

        {course.campuses.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="campus" className="text-sm font-medium">
              Campus
            </label>
            <NativeSelect
              id="campus"
              required
              value={app.campusId ?? ""}
              onChange={(e) => dispatch({ type: "SET_FIELDS", fields: { campusId: e.target.value || undefined } })}
            >
              <option value="" disabled>
                Choose a campus
              </option>
              {course.campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.placesLeft === 0 ? " — waitlist only" : c.placesLeft < 5 ? ` — ${c.placesLeft} places left` : ""}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        {course.intakes.length <= 4 ? (
          <Segmented
            label="When do you want to start?"
            options={course.intakes.map((i) => ({ value: i.id, label: i.label }))}
            value={app.intakeId}
            onChange={(v) => dispatch({ type: "SET_FIELDS", fields: { intakeId: v } })}
            helper={
              campus && campus.placesLeft > 0 && campus.placesLeft < 5
                ? `${campus.placesLeft} places left at ${campus.name}. We hold yours for ${course.holdDays} days once you apply.`
                : campus?.placesLeft === 0
                  ? `${campus.name} is full for this intake. You can still apply and we'll offer you the next spot that opens.`
                  : "You can change this later without starting over."
            }
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="intake" className="text-sm font-medium">
              When do you want to start?
            </label>
            <NativeSelect
              id="intake"
              required
              value={app.intakeId ?? ""}
              onChange={(e) => dispatch({ type: "SET_FIELDS", fields: { intakeId: e.target.value || undefined } })}
            >
              <option value="" disabled>
                Choose a start date
              </option>
              {course.intakes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        <WhatYouNeed />

        <div className="flex flex-col gap-5 border-t border-border pt-6">
          <p className="text-sm font-semibold">A few details to save your place</p>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="First name"
              value={app.firstName ?? ""}
              onChange={set("firstName")}
              autoComplete="given-name"
              validate={(v) => (v.trim() ? null : "We need this one")}
            />
            <TextField
              label="Last name"
              value={app.lastName ?? ""}
              onChange={set("lastName")}
              autoComplete="family-name"
              validate={(v) => (v.trim() ? null : "We need this one")}
            />
          </div>
          <TextField
            label="Email"
            value={app.email ?? ""}
            onChange={set("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            validate={(v) => (isValidEmail(v) ? null : "Check the email address")}
            why={<WhyWeAsk>Your offer letter and anything you need to keep go here.</WhyWeAsk>}
          />
          <TextField
            label="Mobile"
            value={app.mobile ?? ""}
            onChange={set("mobile")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={brand.country === "AU" ? "04xx xxx xxx" : "02x xxx xxxx"}
            validate={(v) => (isValidMobile(v) ? null : "That doesn't look like a mobile number")}
            why={
              <WhyWeAsk>
                So your advisor can reach you, and so you can pick up on your phone if you stop halfway.
              </WhyWeAsk>
            }
          />
          <label className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
            <Checkbox
              checked={!!app.contactConsent}
              onCheckedChange={(v) => dispatch({ type: "SET_FIELDS", fields: { contactConsent: v === true } })}
              className="mt-0.5"
            />
            <span>
              Keep me updated about my application by email, text or WhatsApp from {brand.name}.
              <span className="mt-0.5 block text-xs text-muted-foreground">Optional. Reply STOP any time.</span>
            </span>
          </label>
        </div>

        <button type="submit" className="sr-only">
          Continue
        </button>
      </form>
    </StepFrame>
  )
}
