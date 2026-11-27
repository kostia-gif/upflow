"use client"

import { ArrowLeft, BellRing, Clock } from "lucide-react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { useCallback } from "react"
import { toast } from "sonner"
import { moduleComponentFor } from "@/components/apply/modules"
import { Lede, TextLink, Title } from "@/components/apply/primitives"
import { ProgressSegments } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { minutesLabel, moduleMeta } from "@/lib/config/modules"
import { moduleDescription } from "@/lib/enrol/copy"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"
import { stepAfter } from "@/lib/enrol/steps"
import type { ModuleId, ModuleStatus } from "@/lib/types"

export default function EnrolModulePage() {
  const params = useParams<{ module: string }>()
  const { modules, hydrated } = useApplication()
  const id = params.module as ModuleId

  // Before saved state loads, the step list is the default course's, which may not include this step.
  if (!hydrated) return null
  if (!modules.includes(id)) notFound()

  return <EnrolModule id={id} />
}

function EnrolModule({ id }: { id: ModuleId }) {
  const router = useRouter()
  const { app, brand, course, modules, applySteps, totalSteps, nextModule, dispatch } = useApplication()
  const meta = moduleMeta[id]
  const Component = moduleComponentFor(course.flow, id)
  const index = modules.indexOf(id)
  const isLast = index === modules.length - 1

  const onComplete = useCallback(
    (status: ModuleStatus, data?: Record<string, string>, message?: string) => {
      dispatch({ type: "SET_MODULE_STATUS", module: id, status })
      if (data) dispatch({ type: "SET_MODULE_DATA", module: id, data })
      dispatch({ type: "SET_LAST_MODULE", module: id })
      const messages: Record<ModuleStatus, string> = {
        done: `${meta.title} — done`,
        sent: `${meta.title} — sent`,
        checking: `${meta.title} — received. A specialist will check it, no need to wait.`,
        later: `${meta.title} — we'll remind you`,
        todo: meta.title,
      }
      toast.success(message ?? messages[status])
      if (isLast) {
        router.push("/enrol/done")
        return
      }
      const next = stepAfter(id, app, modules, nextModule)
      router.push(next ? `${ENROL_STEPS_PATH}/${next}` : ENROL_STEPS_PATH)
    },
    [app, dispatch, id, isLast, meta.title, modules, nextModule, router],
  )

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href={ENROL_STEPS_PATH}
          aria-label="Back to all steps"
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="flex-1">
          <ProgressSegments step={applySteps + index + 1} total={totalSteps} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Title>{meta.title}</Title>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5" aria-hidden /> {minutesLabel(meta.minutes)}
          </span>
        </div>
        <Lede>{moduleDescription(app, course, id, brand.country)}</Lede>
      </div>
      {app.modules[id] && app.modules[id] !== "todo" && (
        <p className="rounded-2xl bg-success-soft p-3 text-sm text-success">
          You&apos;ve already done this one. Going again replaces what you sent.
        </p>
      )}
      <Component onComplete={onComplete} />
      {!isLast && (
        <div className="flex flex-col items-center gap-1 border-t border-border pt-5 text-center">
          <TextLink className="gap-1.5" href={`/enrol/finish-later?module=${id}`}>
            <BellRing className="size-4" aria-hidden /> Skip this step — remind me later
          </TextLink>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have this handy? We&apos;ll send you a link by text or email and you carry on with the next
            one.
          </p>
        </div>
      )}
    </div>
  )
}
