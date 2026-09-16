"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { CodeEntry } from "@/components/apply/code-entry"
import { StepFrame } from "@/components/apply/step-frame"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { isValidEmail, isValidMobile } from "@/lib/format"

export default function YouPage() {
  const router = useRouter()
  const { app, brand, dispatch } = useApplication()
  const prefilled = !!(app.firstName && app.lastName && app.mobile && app.email)
  const [stage, setStage] = useState<"details" | "code">(prefilled && !app.mobileVerified ? "code" : "details")

  const set = (k: "firstName" | "lastName" | "mobile" | "email") => (v: string) =>
    dispatch({ type: "SET_FIELDS", fields: { [k]: v } })

  const complete =
    !!app.firstName?.trim() && !!app.lastName?.trim() && isValidMobile(app.mobile ?? "") && isValidEmail(app.email ?? "")

  const onVerified = useCallback(() => {
    dispatch({ type: "SET_FIELDS", fields: { mobileVerified: true } })
    toast.success("Mobile verified")
    router.push("/apply/am-i-in")
  }, [dispatch, router])

  if (stage === "code") {
    return (
      <StepFrame
        step={2}
        eyebrow={app.entryPath === "A" ? "Almost there" : undefined}
        title={app.entryPath === "A" ? `Welcome back, ${app.firstName}.` : "Check your phone."}
        lede={
          app.entryPath === "A"
            ? "We've kept everything you told us. Just confirm it's you and we'll pick up where you left off."
            : "A quick code keeps your application yours. It also lets you come back on any device."
        }
      >
        <CodeEntry mobile={app.mobile ?? ""} onVerified={onVerified} onChangeNumber={() => setStage("details")} />
      </StepFrame>
    )
  }

  return (
    <StepFrame
      step={2}
      title="First, who are you?"
      lede="Just enough to save your place. We'll text you a code to keep it yours."
      cta="Send me a code"
      ctaDisabled={!complete}
      onCta={() => setStage("code")}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (complete) setStage("code")
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
