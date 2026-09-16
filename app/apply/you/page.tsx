"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { Clock, MessageCircle, Save } from "lucide-react"
import { CodeEntry } from "@/components/apply/code-entry"
import { RepCard } from "@/components/apply/rep-card"
import { StepFrame } from "@/components/apply/step-frame"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { isValidEmail, isValidMobile } from "@/lib/format"

export default function YouPage() {
  const router = useRouter()
  const { app, brand, rep, totalSteps, dispatch } = useApplication()
  const spoken = app.repAssigned === "spoken" && !!rep
  const prefilled = !!(app.firstName && app.lastName && app.mobile && app.email)
  const [stage, setStage] = useState<"details" | "code" | "welcome">(
    prefilled && !app.mobileVerified ? "code" : "details",
  )

  const set = (k: "firstName" | "lastName" | "mobile" | "email") => (v: string) =>
    dispatch({ type: "SET_FIELDS", fields: { [k]: v } })

  const complete =
    !!app.firstName?.trim() && !!app.lastName?.trim() && isValidMobile(app.mobile ?? "") && isValidEmail(app.email ?? "")

  const onVerified = useCallback(() => {
    dispatch({ type: "SET_FIELDS", fields: { mobileVerified: true } })
    dispatch({ type: "ASSIGN_ADVISOR" })
    setStage("welcome")
  }, [dispatch])

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
        body: "Missing a document? Skip that step and we'll text you when it's a good time to add it.",
      },
    ]
    return (
      <StepFrame
        step={2}
        totalSteps={totalSteps}
        back={false}
        eyebrow="You're verified"
        title={spoken ? `Welcome back, ${firstName}.` : `Nice to meet you, ${firstName}.`}
        lede={
          spoken
            ? `${rep.name} has been looking after you since your chat, and stays with you right through to your first day.`
            : rep
              ? `Meet ${rep.name}, your ${rep.role.toLowerCase()} from here on — one person, right through to your first day.`
              : "Your application is yours now. Here's how we make the rest easy."
        }
        showRep={false}
        cta="Let's keep going"
        onCta={() => router.push("/apply/am-i-in")}
      >
        <div className="flex flex-col gap-6">
          <RepCard
            intro={
              spoken
                ? `${rep.name} has your details — nothing to re-type`
                : rep
                  ? `Hi ${firstName}, I'm ${rep.name}. Ask me anything, any time.`
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

  if (stage === "code") {
    return (
      <StepFrame
        step={2}
        totalSteps={totalSteps}
        eyebrow={app.entryPath === "A" ? "Quick check" : undefined}
        title={app.entryPath === "A" ? `Just confirming it's you, ${app.firstName}.` : "Check your phone."}
        lede={
          app.entryPath === "A"
            ? spoken
              ? `${rep.name} kept everything you told them, so there's nothing to re-type. Pop in the code and we'll keep going.`
              : "We've kept everything you told us. Pop in the code and we'll keep going."
            : "A quick code keeps your application yours. It also lets you come back on any device."
        }
        showRep={false}
      >
        <CodeEntry mobile={app.mobile ?? ""} onVerified={onVerified} onChangeNumber={() => setStage("details")} />
      </StepFrame>
    )
  }

  return (
    <StepFrame
      step={2}
      totalSteps={totalSteps}
      title="First, who are you?"
      lede="Just enough to save your place."
      showRep={false}
      cta="Send me a code to confirm"
      ctaDisabled={!complete}
      onCta={() => {
        dispatch({ type: "SET_FIELDS", fields: { contactConsent: true } })
        setStage("code")
      }}
      footer={
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you&apos;re happy for {brand.shortName} to keep in touch by text or WhatsApp to support your
          application. Reply STOP any time.{" "}
          <a href="#" className="underline underline-offset-2" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
        </p>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (!complete) return
          dispatch({ type: "SET_FIELDS", fields: { contactConsent: true } })
          setStage("code")
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
          label="Mobile"
          value={app.mobile ?? ""}
          onChange={set("mobile")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={brand.country === "AU" ? "04xx xxx xxx" : "02x xxx xxxx"}
          validate={(v) => (isValidMobile(v) ? null : "That doesn't look like a mobile number")}
          why={<WhyWeAsk>We text you a code so only you can see your application, and a reminder if you stop halfway.</WhyWeAsk>}
        />
        <TextField
          label="Email"
          value={app.email ?? ""}
          onChange={set("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          validate={(v) => (isValidEmail(v) ? null : "Check the email address")}
          why={<WhyWeAsk>Your offer letter and anything you need to keep go here. We don&apos;t send marketing to it.</WhyWeAsk>}
        />
        <button type="submit" className="sr-only">
          Continue
        </button>
      </form>
    </StepFrame>
  )
}
