"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  Copy,
  Compass,
  MessageCircleOff,
  ScanFace,
  ThermometerSnowflake,
  TrendingDown,
} from "lucide-react"
import type { ComponentType } from "react"
import { useApplication } from "@/lib/application/context"
import { brandOrder, brands } from "@/lib/config/brands"
import { defaultCourseFor } from "@/lib/config/courses"
import type { BrandId } from "@/lib/types"
import { cn } from "@/lib/utils"

const problems: { Icon: ComponentType<{ className?: string }>; title: string; body: string }[] = [
  {
    Icon: TrendingDown,
    title: "Most people who start never finish",
    body: "Long, unbroken forms with no sense of what's left. Momentum dies the moment the tab closes, and few come back to reopen it.",
  },
  {
    Icon: ThermometerSnowflake,
    title: "The first reply feels like a form letter",
    body: "\u201cThank you, we'll be in touch\u201d and a missed call from an unknown number, instead of a real person who already knows why you asked.",
  },
  {
    Icon: MessageCircleOff,
    title: "There's only one way back in",
    body: "Leave the form and the only way to finish is an email, a password reset and the start of the sidebar again — no WhatsApp, no text, no pick-up-where-you-left-off.",
  },
  {
    Icon: Copy,
    title: "Nothing told us before counts for anything",
    body: "A sales call, an enquiry, a prior year's application — all ignored. People re-type their own name, course and story from scratch.",
  },
  {
    Icon: Compass,
    title: "No idea how long this takes, or what's needed",
    body: "No time estimate, no checklist of ID, transcript or funding steps up front — so nobody can tell if this is five minutes or a wasted evening.",
  },
  {
    Icon: ScanFace,
    title: "Identity checks still run on paper",
    body: "Certified copies, a Justice of the Peace, a weekend errand — instead of a photo that's read and verified in seconds.",
  },
]

const comparison = [
  {
    label: "Time to an offer",
    before: "Three weeks, one laptop weekend, one JP",
    after: "Six to nine days, one phone, no essay night",
  },
  {
    label: "First contact",
    before: "An email reply, or a missed call from a number you don't know",
    after: "A real person, on WhatsApp, within the hour",
  },
  {
    label: "Starting the application",
    before: "A six-section login form — set a password, start from nothing",
    after: "One link that already knows your name, course and intake",
  },
  {
    label: "What you've told us before",
    before: "Typed again, even the bits from the sales call on Tuesday",
    after: "Everything you told us once stays told",
  },
  {
    label: "Getting ready to enrol",
    before: "Forty questions, no idea how much is left",
    after: "About ten minutes, one thing at a time, always know what's next",
  },
  {
    label: "Proving who you are",
    before: "Certified copies, a JP, a Saturday spent at the post office",
    after: "A photo of your passport — read back and confirmed in seconds",
  },
]

const schoolBlurbs: Record<BrandId, string> = {
  aipc:
    "Domestic postgraduate, Australia. Adds a credit-for-experience check and a spoken-or-written personal statement, with FEE-HELP as the funding path.",
  nzma:
    "Vocational trades, New Zealand. Age and NCEA gating, a StudyLink funding walk-through, and a kit step so knives and whites are sized before day one.",
  elite:
    "Vocational trades, New Zealand. Same NZ spine as NZMA — age/NCEA gating, StudyLink, a kit step — configured for salon campuses across three cities.",
  yoobee:
    "Online creative certificate, New Zealand. Swaps the physical kit for a portfolio step, and leads with fees-free as the default funding path.",
}

export default function IntroPage() {
  const router = useRouter()
  const { dispatch } = useApplication()

  function openSchool(id: BrandId) {
    dispatch({ type: "SET_BRAND", brand: id })
    router.push("/course")
  }

  return (
    <div className="min-h-svh w-full bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-6 py-16 sm:px-10 sm:py-24">
      <header className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Building2 className="size-3.5" aria-hidden />
          UP Education · Domestic application redesign
        </span>
        <h1 className="max-w-3xl text-balance font-sans text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
          One application, rebuilt as a conversation — for four very different schools.
        </h1>
        <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          UP Apply is a working prototype of a three-minute application followed by a guided, one-thing-at-a-time
          get-ready flow. The same spine runs under AIPC, NZMA, Elite and Yoobee — what changes underneath is
          configuration, not a rebuild.
        </p>
      </header>

      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground">
            The problems this is solving for
          </h2>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Six things wrong with the application experience today, in students&apos; own words.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-border sm:grid-cols-2">
          {problems.map(({ Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 bg-background p-6">
              <Icon className="size-5 text-foreground" aria-hidden />
              <h3 className="text-base font-semibold leading-snug text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground">Today, versus the new way</h2>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Drawn from side-by-side student journeys for AIPC and NZMA — same person, same course, two very different
            weeks.
          </p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[1fr_1.4fr_1.4fr]">
            <div className="hidden bg-muted px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block" />
            <div className="hidden bg-muted px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
              Today
            </div>
            <div className="hidden bg-muted px-6 py-3 text-xs font-semibold uppercase tracking-wider text-brand sm:block">
              The new way
            </div>
            {comparison.map((row, i) => (
              <div key={row.label} className="contents">
                <div
                  className={cn(
                    "flex items-center px-6 py-4 text-sm font-semibold text-foreground sm:py-5",
                    i > 0 && "border-t border-border sm:border-t",
                  )}
                >
                  {row.label}
                </div>
                <div
                  className={cn(
                    "border-t border-border px-6 py-4 text-sm leading-relaxed text-muted-foreground sm:border-t sm:py-5",
                  )}
                >
                  {row.before}
                </div>
                <div className="border-t border-border bg-brand-soft/40 px-6 py-4 text-sm leading-relaxed text-foreground sm:border-t sm:py-5">
                  {row.after}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground">Four schools, one spine</h2>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Pick a school to walk its course page and application exactly as a student would.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {brandOrder.map((id) => {
            const b = brands[id]
            const course = defaultCourseFor(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => openSchool(id)}
                className="group flex flex-col gap-5 rounded-3xl border border-border p-6 text-left transition-colors hover:border-foreground/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <Image src={b.logo} alt={b.name} width={120} height={36} className="h-7 w-auto" />
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: b.primary }}
                    aria-hidden
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {course.shortTitle} · {b.country === "AU" ? "Australia" : "New Zealand"}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{schoolBlurbs[id]}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  Walk the {b.shortName} flow
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="flex flex-col gap-1 border-t border-border pt-8 text-xs text-muted-foreground">
        <p>UP Education · Project Daft Punk · Working draft, prototype for internal review.</p>
        <p>Use the Prototype button in the corner to jump between screens, brands and entry states.</p>
      </footer>
      </main>
    </div>
  )
}
