"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { BellRing, Link2 } from "lucide-react"
import { Suspense, useState } from "react"
import { toast } from "sonner"
import { OptionCards } from "@/components/apply/option-cards"
import { StepFrame } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { minutesLabel, moduleMeta } from "@/lib/config/modules"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"
import { addDays, formatDayMonth } from "@/lib/format"
import type { ModuleId } from "@/lib/types"

type Preset = "tonight" | "tomorrow" | "3days" | "week" | "pick"

const presets: { id: Preset; title: string; description: string; days: number }[] = [
  { id: "tonight", title: "Tonight", description: "Around 7pm", days: 0 },
  { id: "tomorrow", title: "Tomorrow", description: "Morning", days: 1 },
  { id: "3days", title: "In 3 days", description: "Gives you a bit of room", days: 3 },
  { id: "week", title: "Next week", description: "Same day, one week on", days: 7 },
  { id: "pick", title: "Pick a day", description: "Choose your own", days: 0 },
]

function labelFor(preset: Preset, picked: string) {
  if (preset === "tonight") return "tonight at 7pm"
  if (preset === "tomorrow") return "tomorrow morning"
  if (preset === "pick") return picked ? formatDayMonth(picked) : ""
  const p = presets.find((x) => x.id === preset)!
  return formatDayMonth(addDays(p.days))
}

function RemindMe() {
  const router = useRouter()
  const search = useSearchParams()
  const moduleParam = search.get("module") as ModuleId | null
  const { modules, progress, minutesLeft, rep, nextModule, dispatch } = useApplication()
  const skipping = moduleParam && modules.includes(moduleParam) ? moduleParam : undefined
  const [preset, setPreset] = useState<Preset>("tomorrow")
  const [picked, setPicked] = useState("")
  const [saved, setSaved] = useState(false)

  const label = labelFor(preset, picked)
  const canSave = preset !== "pick" || !!picked

  function save() {
    const at = preset === "pick" ? picked : addDays(presets.find((p) => p.id === preset)!.days)
    dispatch({ type: "SET_FIELDS", fields: { remindAt: at, remindLabel: label } })
    if (skipping) {
      dispatch({ type: "SET_MODULE_STATUS", module: skipping, status: "later" })
      dispatch({ type: "SET_LAST_MODULE", module: skipping })
      toast.success(`${moduleMeta[skipping].title} — we'll remind you ${label}`)
      const next = nextModule(skipping)
      router.push(next ? `${ENROL_STEPS_PATH}/${next}` : ENROL_STEPS_PATH)
      return
    }
    setSaved(true)
  }

  const title = saved ? "Sorted. See you then." : skipping ? `Skip "${moduleMeta[skipping].title}" for now?` : "Pause here?"
  const lede = saved
    ? `We'll remind you by text or email ${label}, with a link straight back to where you left off.`
    : skipping
      ? "No problem — we'll remind you to send it, and you carry straight on with the next step."
      : `${progress.done} of ${progress.total} done, ${minutesLabel(minutesLeft).toLowerCase()}. Everything's saved. Come back on any device — the link in your message opens right here.`

  return (
    <StepFrame
      showRep={false}
      showWhatsApp={false}
      title={title}
      lede={lede}
      cta={saved ? "Back to the course" : skipping ? "Skip and keep going" : "Set reminder"}
      ctaDisabled={!saved && !canSave}
      onCta={saved ? () => router.push("/course") : save}
      secondary={
        !saved ? (
          <button type="button" onClick={() => router.back()} className="min-h-11 text-sm font-medium text-muted-foreground">
            Actually, keep going
          </button>
        ) : undefined
      }
    >
      {!saved && (
        <div className="flex flex-col gap-6">
          <OptionCards
            label="When should we remind you?"
            value={preset}
            onChange={(id) => setPreset(id as Preset)}
            options={presets.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.id === "pick" || p.id === "tonight" || p.id === "tomorrow" ? p.description : formatDayMonth(addDays(p.days)),
            }))}
          />
          {preset === "pick" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="remind-date" className="text-sm font-medium">
                Which day?
              </label>
              <input
                id="remind-date"
                type="date"
                required
                min={addDays(1).slice(0, 10)}
                value={picked.slice(0, 10)}
                onChange={(e) => setPicked(e.target.value ? new Date(e.target.value).toISOString() : "")}
                className="h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground"
              />
            </div>
          )}
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <BellRing className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              One reminder by text or email. If you miss it, we try once more, then{" "}
              {rep ? `${rep.name} gives you a call` : "your course advisor calls"}.
            </li>
            <li className="flex items-start gap-3">
              <Link2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              The link opens right where you left off, on any device.
            </li>
          </ul>
        </div>
      )}
    </StepFrame>
  )
}

export default function EnrolFinishLaterPage() {
  return (
    <Suspense fallback={null}>
      <RemindMe />
    </Suspense>
  )
}
