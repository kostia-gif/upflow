"use client"

import { useRouter } from "next/navigation"
import { BellRing, CalendarClock, MessageSquare } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Segmented } from "@/components/apply/segmented"
import { StepFrame } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { formatDayMonth } from "@/lib/format"
import { minutesLabel } from "@/lib/config/modules"

export default function FinishLaterPage() {
  const router = useRouter()
  const { app, progress, minutesLeft, rep } = useApplication()
  const [when, setWhen] = useState<string>("tomorrow")
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    toast.success(`Reminder set — ${labels[when]}`)
  }

  const labels: Record<string, string> = {
    tonight: "tonight at 7pm",
    tomorrow: "tomorrow morning",
    weekend: "Saturday morning",
  }

  return (
    <StepFrame
      showRep={false}
      title={saved ? "Sorted. See you then." : "No worries. We've saved everything."}
      lede={
        saved
          ? `We'll text ${app.mobile || "you"} ${labels[when]} with a link straight back to where you left off.`
          : `${progress.done} of ${progress.total} done, about ${minutesLabel(minutesLeft)} left. Come back on any device — the link in your text opens right here.`
      }
      cta={saved ? "Back to the course" : "Set reminder"}
      onCta={saved ? () => router.push("/course") : save}
      secondary={
        !saved ? (
          <button type="button" onClick={() => router.push("/apply/ready")} className="min-h-11 text-sm font-medium text-muted-foreground">
            Actually, keep going
          </button>
        ) : undefined
      }
    >
      {!saved && (
        <div className="flex flex-col gap-6">
          <Segmented
            label="When should we remind you?"
            options={[
              { value: "tonight", label: "Tonight" },
              { value: "tomorrow", label: "Tomorrow" },
              { value: "weekend", label: "Weekend" },
            ]}
            value={when}
            onChange={setWhen}
          />
          {app.holdUntil && (
            <div className="flex items-start gap-3 rounded-2xl bg-warning-soft p-3 text-sm leading-relaxed">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <p>
                Your place is held until <strong>{formatDayMonth(app.holdUntil)}</strong>. Plenty of time, but not
                forever.
              </p>
            </div>
          )}
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <BellRing className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              One text. If you ignore it, we try once more, then {rep ? `${rep.name} gives you a call` : "an advisor calls"}.
            </li>
            <li className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              Or reply to the text and finish on WhatsApp instead.
            </li>
          </ul>
        </div>
      )}
    </StepFrame>
  )
}
