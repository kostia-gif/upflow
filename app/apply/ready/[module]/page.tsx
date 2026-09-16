"use client"

import { ArrowLeft, BellRing, Clock } from "lucide-react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { useCallback } from "react"
import { toast } from "sonner"
import { moduleComponents } from "@/components/apply/modules"
import { Lede, TextLink, Title } from "@/components/apply/primitives"
import { useApplication } from "@/lib/application/context"
import { minutesLabel, moduleMeta } from "@/lib/config/modules"
import type { ModuleId, ModuleStatus } from "@/lib/types"

export default function ModulePage() {
  const params = useParams<{ module: string }>()
  const router = useRouter()
  const { app, brand, modules, progress, nextModule, dispatch } = useApplication()
  const id = params.module as ModuleId

  if (!modules.includes(id)) notFound()

  const meta = moduleMeta[id]
  const Component = moduleComponents[id]
  const index = modules.indexOf(id)

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
          href="/apply/ready"
          aria-label="Back to all steps"
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <p className="text-xs font-medium text-muted-foreground">
          Step {index + 1} of {modules.length} · {progress.done} done
        </p>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Clock className="size-3.5" aria-hidden /> {minutesLabel(meta.minutes)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <Title>{meta.title}</Title>
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
          <TextLink className="gap-1.5" onClick={() => onComplete("later")}>
            <BellRing className="size-4" aria-hidden /> Don&apos;t have this handy? Remind me later
          </TextLink>
          <p className="text-xs text-muted-foreground">We&apos;ll text you a link. It won&apos;t hold anything up.</p>
        </div>
      )}
    </div>
  )
}
