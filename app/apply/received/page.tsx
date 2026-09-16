"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { CalendarClock, MessageSquare, Play } from "lucide-react"
import { useState } from "react"
import { ModuleRow } from "@/components/apply/module-row"
import { Eyebrow, Lede, TextLink, Title, PrimaryButton } from "@/components/apply/primitives"
import { RepCard } from "@/components/apply/rep-card"
import { StatusTracker } from "@/components/apply/status-tracker"
import { useApplication } from "@/lib/application/context"
import { formatDayMonth } from "@/lib/format"
import { moduleMeta } from "@/lib/config/modules"

export default function ReceivedPage() {
  const router = useRouter()
  const { app, brand, course, rep, modules, minutesLeft } = useApplication()
  const [playing, setPlaying] = useState(false)
  const campus = course.campuses.find((c) => c.id === app.campusId)
  const intake = course.intakes.find((i) => i.id === app.intakeId)
  const totalMin = Math.ceil(minutesLeft)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 px-5 pb-6 pt-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Application received</Eyebrow>
          <Title>{app.firstName ? `${app.firstName}, you're in the queue.` : "You're in the queue."}</Title>
          <Lede>
            We&apos;ve texted a confirmation to {app.mobile || "your mobile"}. Nothing else to do today unless you want
            to.
          </Lede>
        </div>

        <StatusTracker current="Applied" />

        <div className="flex items-start gap-3 rounded-2xl bg-brand p-4 text-brand-foreground">
          <CalendarClock className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">
              {campus?.placesLeft === 0 ? "You're first in line" : "We're holding your place"}
            </p>
            <p className="text-sm leading-relaxed opacity-90">
              {campus?.placesLeft === 0
                ? `${campus.name} is full for ${intake?.label ?? "this intake"}. You're on the list and we'll text you the moment a spot opens.`
                : `${campus?.name ?? "Your campus"} · ${intake?.label ?? "your start date"}. Held until ${
                    app.holdUntil ? formatDayMonth(app.holdUntil) : "next week"
                  } while you finish getting ready.`}
            </p>
          </div>
        </div>

        {rep && (
          <RepCard
            intro={
              app.repAssigned === "assigned"
                ? `${rep.name} is looking after you`
                : `${rep.name} has your application`
            }
          />
        )}

        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-foreground text-left"
          aria-label={`Play video: ${brand.tutorVideoCaption}`}
        >
          <Image
            src={brand.tutorVideoPoster}
            alt=""
            fill
            sizes="480px"
            className={playing ? "object-cover opacity-60" : "object-cover transition-transform group-hover:scale-[1.02]"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 text-background">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
              <Play className="ml-0.5 size-5" aria-hidden />
            </span>
            <span className="text-sm font-medium leading-snug">
              {playing ? "Video playback is mocked in this prototype" : brand.tutorVideoCaption}
            </span>
          </div>
        </button>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-xl font-semibold">Next: get ready</h2>
            <span className="text-sm text-muted-foreground">about {totalMin} min total</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Small steps, each under a couple of minutes. Do them now, or we&apos;ll nudge you tomorrow.
          </p>
          <ul className="flex flex-col gap-2">
            {modules.slice(0, 4).map((m) => (
              <li key={m}>
                <ModuleRow id={m} status="todo" country={brand.country} compact />
              </li>
            ))}
            {modules.length > 4 && (
              <li className="px-1 text-sm text-muted-foreground">
                + {modules.length - 4} more, including {moduleMeta[modules[modules.length - 1]].title.toLowerCase()}
              </li>
            )}
          </ul>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
          <MessageSquare className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Prefer to do this over WhatsApp? {rep ? `${rep.name} can` : "We can"} walk you through it one message at a time.{" "}
            <TextLink href="/apply/whatsapp" className="min-h-0 text-brand">
              Switch to WhatsApp
            </TextLink>
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 px-5 pb-safe pt-4 backdrop-blur sm:rounded-b-3xl">
        <PrimaryButton onClick={() => router.push("/apply/ready")}>Get ready now · {totalMin} min</PrimaryButton>
        <div className="flex justify-center">
          <TextLink href="/apply/finish-later">I&apos;ll do it later</TextLink>
        </div>
      </div>
    </div>
  )
}
