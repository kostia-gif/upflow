"use client"

import Link from "next/link"
import {
  Banknote,
  Camera,
  Check,
  ChefHat,
  ClipboardList,
  FileText,
  GraduationCap,
  Landmark,
  Lock,
  MapPin,
  MessageSquareText,
  PenLine,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import type { ModuleId, ModuleStatus } from "@/lib/types"
import { moduleMeta } from "@/lib/config/modules"
import type { Country } from "@/lib/types"
import { cn } from "@/lib/utils"

export const moduleIcons: Record<ModuleId, LucideIcon> = {
  identity: Camera,
  address: MapPin,
  "school-record": GraduationCap,
  government: Landmark,
  money: Banknote,
  "support-person": UserRound,
  credit: FileText,
  statement: MessageSquareText,
  portfolio: Sparkles,
  "placement-check": ClipboardList,
  kit: ChefHat,
  sign: PenLine,
}

export function StatusPill({ status, locked }: { status: ModuleStatus; locked?: boolean }) {
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <Lock className="size-3" aria-hidden /> Do this last
      </span>
    )
  }
  const map: Record<ModuleStatus, string> = {
    todo: "bg-muted text-muted-foreground",
    later: "bg-muted text-foreground/70",
    sent: "bg-warning-soft text-warning",
    checking: "bg-info-soft text-info animate-pulse-soft",
    done: "bg-success-soft text-success",
  }
  const label: Record<ModuleStatus, string> = {
    todo: "To do",
    later: "Reminder set",
    sent: "Sent",
    checking: "Checking",
    done: "Done",
  }
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", map[status])}>
      {status === "done" && <Check className="size-3" strokeWidth={3} aria-hidden />}
      {label[status]}
    </span>
  )
}

export function ModuleRow({
  id,
  status,
  country,
  locked,
  compact,
  highlight,
}: {
  id: ModuleId
  status: ModuleStatus
  country: Country
  locked?: boolean
  compact?: boolean
  highlight?: boolean
}) {
  const meta = moduleMeta[id]
  const Icon = moduleIcons[id]
  const inner = (
    <>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          status === "done" ? "bg-success-soft text-success" : "bg-brand-soft text-brand",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="truncate text-base font-semibold">{meta.title}</span>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{meta.timeLabel}</span>
        </span>
        {!compact && <span className="text-sm leading-snug text-muted-foreground">{meta.description[country]}</span>}
      </span>
      <StatusPill status={status} locked={locked && status !== "done"} />
    </>
  )
  const cls = cn(
    "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors",
    !locked && "hover:border-brand/40",
    locked && "opacity-70",
    highlight && !locked && "border-brand ring-2 ring-brand/15",
  )
  if (locked || compact) return <div className={cls}>{inner}</div>
  return (
    <Link href={`/apply/ready/${id}`} className={cls}>
      {inner}
    </Link>
  )
}
