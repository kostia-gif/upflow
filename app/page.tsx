"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, MapPin, Wallet } from "lucide-react"
import { useState } from "react"
import { Segmented } from "@/components/apply/segmented"
import { Eyebrow } from "@/components/apply/primitives"
import { useApplication } from "@/lib/application/context"
import { defaultCourseFor } from "@/lib/config/courses"
import { getRep } from "@/lib/config/reps"
import { cn } from "@/lib/utils"

export default function CoursePage() {
  const { state, brand } = useApplication()
  const course = defaultCourseFor(state.dev.brand)
  const rep = getRep(brand.defaultAdvisor)
  const [campusId, setCampusId] = useState(course.campuses[0].id)
  const [intakeId, setIntakeId] = useState(course.intakes[0].id)
  const [elig, setElig] = useState<Record<string, string>>({})
  const campus = course.campuses.find((c) => c.id === campusId) ?? course.campuses[0]

  const params = new URLSearchParams({ course: course.id, campus: campus.id, intake: intakeId })
  Object.entries(elig).forEach(([k, v]) => params.set(`elig_${k}`, v))
  const applyHref = `/apply?${params.toString()}`

  const facts = [
    { Icon: Clock, k: "Length", v: course.duration },
    { Icon: Wallet, k: "Fees", v: course.fee },
    { Icon: MapPin, k: "Campus", v: `${course.campuses.length} option${course.campuses.length > 1 ? "s" : ""}` },
  ]

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col bg-background sm:my-6 sm:min-h-0 sm:overflow-hidden sm:rounded-3xl sm:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.25)]">
      <header className="flex items-center justify-between px-5 py-4">
        <Image src={brand.logo} alt={brand.name} width={120} height={36} className="h-8 w-auto" priority />
        <a href={`tel:${brand.supportPhone}`} className="text-sm font-medium text-brand">
          {brand.supportPhone}
        </a>
      </header>

      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image src={brand.tutorVideoPoster} alt="" fill sizes="480px" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/30 to-transparent" />
        <div className="absolute inset-x-5 bottom-5 flex flex-col gap-2 text-brand-foreground">
          <span className="text-xs font-semibold uppercase tracking-widest opacity-90">{course.school}</span>
          <h1 className="font-heading text-3xl font-semibold leading-tight text-balance">{course.title}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-8 px-5 pb-8 pt-6">
        <dl className="grid grid-cols-3 gap-2 text-sm">
          {facts.map(({ Icon, k, v }) => (
            <div key={k} className="flex flex-col gap-1 rounded-2xl bg-muted p-3">
              <Icon className="size-4 text-brand" aria-hidden />
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="font-medium leading-snug">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="text-base leading-relaxed text-muted-foreground">
          This page stands in for the {brand.shortName} course page on the UP web experience. The application picks
          up the campus, start date and quick-check answers you choose here, so you never answer twice.
        </p>

        <section className="flex flex-col gap-4">
          <Eyebrow>Where and when</Eyebrow>
          {course.campuses.length > 1 && (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Campus">
              {course.campuses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={c.id === campus.id}
                  onClick={() => setCampusId(c.id)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border-2 p-3 text-left",
                    c.id === campus.id ? "border-brand bg-brand-soft/50" : "border-border hover:border-brand/40",
                  )}
                >
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      c.placesLeft === 0 && "bg-destructive/10 text-destructive",
                      c.placesLeft > 0 && c.placesLeft < 5 && "bg-warning-soft text-warning",
                      c.placesLeft >= 5 && "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.placesLeft === 0 ? "Waitlist" : `${c.placesLeft} places left`}
                  </span>
                </button>
              ))}
            </div>
          )}
          <Segmented
            label="Start date"
            options={course.intakes.slice(0, 4).map((i) => ({ value: i.id, label: i.label }))}
            value={intakeId}
            onChange={setIntakeId}
          />
        </section>

        <section className="flex flex-col gap-4">
          <Eyebrow>Am I in? A 20-second check</Eyebrow>
          {course.eligibilityQuestions.map((q) => (
            <Segmented
              key={q.id}
              label={q.label}
              options={q.options}
              value={elig[q.id]}
              onChange={(v) => setElig((e) => ({ ...e, [q.id]: v }))}
            />
          ))}
          <p className="text-sm text-muted-foreground">Your answers carry into the application. Skip it if you like.</p>
        </section>

        {rep && (
          <section className="flex items-center gap-3 rounded-2xl bg-brand-soft/50 p-3">
            <Image src={rep.photo} alt={rep.name} width={48} height={48} className="size-12 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Talk to {rep.name} first</span>
              <span className="text-xs text-muted-foreground">
                {rep.role} · {brand.shortName}
              </span>
            </div>
            <a href={rep.whatsapp} className="ml-auto text-sm font-medium text-brand">
              WhatsApp
            </a>
          </section>
        )}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 px-5 pb-safe pt-4 backdrop-blur sm:rounded-b-3xl">
        <Link
          href={applyHref}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-[0_8px_24px_-12px_var(--brand)] transition-transform active:scale-[0.98]"
        >
          Apply — about 3 minutes <ArrowRight className="size-5" aria-hidden />
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          {campus.placesLeft === 0
            ? `${campus.name} is full — you can still join the waitlist.`
            : `No documents needed today. We hold your place for ${course.holdDays} days.`}
        </p>
      </div>
    </main>
  )
}
