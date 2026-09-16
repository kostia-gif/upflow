"use client"

import Image from "next/image"
import { CalendarPlus, CheckCircle2, MapPin, Shirt } from "lucide-react"
import { Eyebrow, Lede, PrimaryButton, TextLink, Title } from "@/components/apply/primitives"
import { RepCard } from "@/components/apply/rep-card"
import { StatusTracker } from "@/components/apply/status-tracker"
import { useApplication } from "@/lib/application/context"
import { isComplete } from "@/lib/application/reducer"
import { moduleMeta } from "@/lib/config/modules"

export default function DonePage() {
  const { app, brand, course, modules } = useApplication()
  const campus = course.campuses.find((c) => c.id === app.campusId)
  const intake = course.intakes.find((i) => i.id === app.intakeId)
  const pending = modules.filter((m) => app.modules[m] === "checking" || app.modules[m] === "sent")
  const signed = isComplete(app, "sign")

  const items = [
    { icon: CalendarPlus, t: "Orientation", d: `The week before ${intake?.label ?? "you start"}. Invite comes by email and text.` },
    { icon: MapPin, t: campus?.name ?? "Campus", d: "We'll send a map, parking and the room number a few days out." },
    ...(modules.includes("kit")
      ? [{ icon: Shirt, t: "Your kit", d: "Waiting for you on day one, in the sizes you gave us." }]
      : [{ icon: CheckCircle2, t: "Your timetable", d: "Lands a fortnight before you start." }]),
  ]

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-6">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
        <Image src={brand.tutorVideoPoster} alt={`${campus?.name ?? brand.shortName} campus`} fill sizes="480px" className="object-cover" priority />
      </div>
      <div className="flex flex-col gap-3">
        <Eyebrow>{signed ? "You're enrolled" : "Nearly there"}</Eyebrow>
        <Title>
          {signed
            ? `See you in ${intake?.label.split(" ")[0] ?? "class"}, ${app.firstName?.trim() || "then"}.`
            : app.firstName?.trim()
              ? `Almost done, ${app.firstName.trim()}.`
              : "Almost done."}
        </Title>
        <Lede>
          {signed
            ? `${course.title} at ${campus?.name ?? brand.shortName}. Your offer letter is on its way to ${app.email || "your email"}.`
            : "Sign when you're ready and we'll lock it in."}
        </Lede>
      </div>

      <StatusTracker current={signed ? "Enrolled" : "Getting ready"} />

      {pending.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-warning-soft p-4 text-sm leading-relaxed">
          <p className="font-semibold text-warning">Still with us</p>
          <ul className="flex flex-col gap-1">
            {pending.map((m) => (
              <li key={m}>
                {moduleMeta[m].title} — {app.modules[m] === "checking" ? "being checked" : "sent, awaiting a look"}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">You don&apos;t need to do anything. We&apos;ll text if we need more.</p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {items.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex items-start gap-3 rounded-2xl border border-border p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{t}</span>
              <span className="text-sm leading-snug text-muted-foreground">{d}</span>
            </span>
          </li>
        ))}
      </ul>

      <RepCard intro="Questions before you start? Just ask" />

      <PrimaryButton arrow={false} onClick={() => window.alert("Calendar file download is mocked in this prototype.")}>
        <CalendarPlus className="size-5" aria-hidden /> Add start date to calendar
      </PrimaryButton>
      <div className="flex justify-center">
        <TextLink href="/">Back to {brand.shortName}</TextLink>
      </div>
    </div>
  )
}
