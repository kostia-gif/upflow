"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Clock, MessageCircle, Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RepCard } from "@/components/apply/rep-card"
import { StepFrame } from "@/components/apply/step-frame"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { preStepsPath } from "@/lib/enrol/routes"
import { isValidEmail, isValidMobile } from "@/lib/format"

export default function EnrolYouPage() {
  const router = useRouter()
  const { app, brand, course, rep, totalSteps, dispatch } = useApplication()
  const spoken = app.repAssigned === "spoken" && !!rep
  const returning = app.entryPath === "A"
  const [stage, setStage] = useState<"details" | "welcome">("details")

  const set = (k: "firstName" | "lastName" | "mobile" | "email") => (v: string) =>
    dispatch({ type: "SET_FIELDS", fields: { [k]: v } })

  const complete =
    !!app.firstName?.trim() && !!app.lastName?.trim() && isValidMobile(app.mobile ?? "") && isValidEmail(app.email ?? "")

  function proceed() {
    if (!complete) return
    dispatch({ type: "ASSIGN_ADVISOR" })
    setStage("welcome")
  }

  if (stage === "welcome") {
    const firstName = app.firstName?.trim() || "there"
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
        step={2}
        totalSteps={totalSteps}
        back={false}
        showWhatsApp={false}
        eyebrow="Your place is saved"
        title={returning ? `Welcome back, ${firstName}.` : `Nice to meet you, ${firstName}.`}
        lede={
          rep
            ? spoken
              ? `${rep.name} has been looking after you since your chat, and stays with you right through to your first day.`
              : returning
                ? `Good to hear from you again. ${rep.name}, who you spoke to when you enquired, is your ${rep.role.toLowerCase()} from here on — one person, right through to your first day.`
                : `${rep.name} is your ${rep.role.toLowerCase()} from here on — one person, right through to your first day.`
            : "Your application is yours now. Here's how we make the rest easy."
        }
        showRep={false}
        cta="Let's keep going"
        onCta={() => router.push(preStepsPath(course))}
      >
        <div className="flex flex-col gap-6">
          <RepCard
            channel="text"
            intro={
              rep
                ? spoken
                  ? `Welcome back, ${firstName} — I've kept your details, nothing to re-type.`
                  : `Hi ${firstName}! Great to see you taking the next step. Ask me anything, any time.`
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
      step={2}
      totalSteps={totalSteps}
      showWhatsApp={false}
      eyebrow={returning ? "Quick check" : undefined}
      title={returning && app.firstName ? `Just checking these are right, ${app.firstName}.` : "First, who are you?"}
      lede={
        returning
          ? spoken
            ? `${rep.name} kept everything you told them, so there's nothing to re-type.`
            : "We've kept everything you told us, so there's nothing to re-type."
          : "Just enough to save your place."
      }
      showRep={false}
      cta="Continue"
      ctaDisabled={!complete}
      onCta={proceed}
      footer={
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to our{" "}
          <a href="#" className="underline underline-offset-2" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
          .
        </p>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          proceed()
        }}
      >
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

        <div className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
          <Save className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <p>
            Stop any time — we save as you go. If something&apos;s missing, we follow up when you&apos;re ready to
            add it, not before.
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
          <Checkbox
            checked={!!app.contactConsent}
            onCheckedChange={(v) => dispatch({ type: "SET_FIELDS", fields: { contactConsent: v === true } })}
            className="mt-0.5"
          />
          <span>
            Let {brand.shortName} keep track of my application and reach out by text or email if anything&apos;s
            needed to finish it.
            <span className="mt-0.5 block text-xs text-muted-foreground">
              This is about finishing your application, not marketing. Reply STOP any time.
            </span>
          </span>
        </label>

        <button type="submit" className="sr-only">
          Continue
        </button>
      </form>
    </StepFrame>
  )
}
