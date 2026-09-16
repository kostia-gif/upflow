"use client"

import { ArrowLeft, BellRing, CalendarClock, Clock } from "lucide-react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { useCallback } from "react"
import { toast } from "sonner"
import { moduleComponents } from "@/components/apply/modules"
import { Lede, TextLink, Title } from "@/components/apply/primitives"
import { ProgressSegments, WhatsAppPopOut } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { minutesLabel, moduleMeta } from "@/lib/config/modules"
import { formatDayMonth } from "@/lib/format"
import type { ModuleId, ModuleStatus } from "@/lib/types"

export default function ModulePage() {
  const params = useParams<{ module: string }>()
  const router = useRouter()
  const { app, brand, rep, modules, progress, applySteps, totalSteps, nextModule, dispatch } = useApplication()
  const id = params.module as ModuleId

  if (!modules.includes(id)) notFound()

  const meta = moduleMeta[id]
  const Component = moduleComponents[id]
  const index = modules.indexOf(id)
  const isFirst = index === 0
  const justArrived = isFirst && progress.done === 0 && !!app.submittedAt
  const backHref = isFirst ? "/apply/am-i-in" : "/apply/ready"

  const onComplete = useCallback(
    (status: ModuleStatus, data?: Record<string, string>) => {
      dispatch({ type: "SET_MODULE_STATUS", module: id, status })
      if (data) dispatch({ type: "SET_MODULE_DATA", module: id, data })
      dispatch({ type: "SET_LAST_MODULE", module: id })
      const messages: Record<ModuleStatus, string> = {
        done: `${meta.title} — done`,
        sent: `${meta.title} — sent`,
        checking: `${meta.title} — we're checking it`,
        later: `${meta.title} — we'll remind you`,
        todo: meta.title,
      }
      toast.success(messages[status])
      if (id === "sign") {
        router.push("/apply/done")
        return
      }
      const next = nextModule(id)
      router.push(next ? `/apply/ready/${next}` : "/apply/ready")
    },
    [dispatch, id, meta.title, nextModule, router],
  )

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label={isFirst ? "Back" : "Back to all steps"}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="flex-1">
          <ProgressSegments step={applySteps + index + 1} total={totalSteps} />
        </div>
        <WhatsAppPopOut />
      </div>

      {justArrived && (
        <div role="status" className="flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-sm leading-relaxed">
          <CalendarClock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">
              You&apos;re in{app.firstName?.trim() ? `, ${app.firstName.trim()}` : ""}. Place held
              {app.holdUntil ? ` until ${formatDayMonth(app.holdUntil)}` : ""}.
            </p>
            <p className="text-foreground/80">
              Confirmation texted to {app.mobile || "your mobile"}.
              {rep ? ` ${rep.name} will see your application as you go.` : ""} Now the quick bits — one at a time.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Title>{meta.title}</Title>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5" aria-hidden /> {minutesLabel(meta.minutes)}
          </span>
        </div>
        <Lede>{meta.description[brand.country]}</Lede>
      </div>
      {app.modules[id] && app.modules[id] !== "todo" && (
        <p className="rounded-2xl bg-success-soft p-3 text-sm text-success">
          You&apos;ve already done this one. Going again replaces what you sent.
        </p>
      )}
      <Component onComplete={onComplete} />
      {id !== "sign" && (
        <div className="flex flex-col items-center gap-1 border-t border-border pt-5 text-center">
          <TextLink className="gap-1.5" href={`/apply/finish-later?module=${id}`}>
            <BellRing className="size-4" aria-hidden /> Skip this step — remind me later
          </TextLink>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have this handy? We&apos;ll text you a link and you carry on with the next one.
            {app.holdUntil ? ` Your place stays held until ${formatDayMonth(app.holdUntil)}.` : ""}
          </p>
        </div>
      )}
    </div>
  )
}
