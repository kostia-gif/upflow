"use client"

import Image from "next/image"
import Link from "next/link"
import { BellRing, Check, CheckCheck, CheckCircle2, Circle, ExternalLink, FileText, ImageIcon, PenLine } from "lucide-react"
import type { ReactNode } from "react"
import { moduleMeta } from "@/lib/config/modules"
import type { Message } from "@/lib/whatsapp/script"
import type { BrandConfig, ModuleId, ModuleStatus, Rep } from "@/lib/types"
import { cn } from "@/lib/utils"

export type Rendered = { id: number; time: string; message: Message; showSender: boolean }

type BubbleProps = {
  item: Rendered
  brand: BrandConfig
  rep: Rep
  modules: ModuleId[]
  statuses: Partial<Record<ModuleId, ModuleStatus>>
}

function Ticks({ mine }: { mine: boolean }) {
  return mine ? <CheckCheck className="size-3.5 text-wa-tick" aria-hidden /> : <Check className="size-3.5" aria-hidden />
}

function Shell({
  mine,
  time,
  children,
  className,
  tail = true,
}: {
  mine: boolean
  time: string
  children: ReactNode
  className?: string
  tail?: boolean
}) {
  return (
    <div
      className={cn(
        "relative max-w-[82%] rounded-lg px-2.5 pb-1.5 pt-1.5 text-[15px] leading-snug shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] animate-fade-up",
        mine ? "self-end bg-wa-out" : "self-start bg-wa-in",
        tail && (mine ? "rounded-tr-none" : "rounded-tl-none"),
        className,
      )}
    >
      {children}
      <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] leading-none text-foreground/50">
        {time}
        <Ticks mine={mine} />
      </span>
    </div>
  )
}

function SenderLine({ item, brand, rep }: { item: Rendered; brand: BrandConfig; rep: Rep }) {
  const m = item.message
  if (!item.showSender || !("from" in m) || m.from === "me") return null
  return m.from === "rep" ? (
    <span className="mb-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-wa-rep">
      {rep.name}
      <span className="text-[11px] font-normal text-foreground/50">· {rep.role}</span>
    </span>
  ) : (
    <span className="mb-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-brand">
      {brand.shortName} Assistant
      <span className="rounded-sm bg-brand-soft px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-brand">
        AI
      </span>
    </span>
  )
}

export function Bubble({ item, brand, rep, modules, statuses }: BubbleProps) {
  const m = item.message
  const mine = "from" in m && m.from === "me"

  if (m.kind === "system") {
    return (
      <span className="self-center rounded-lg bg-wa-in/80 px-3 py-1 text-center text-xs text-foreground/60 shadow-sm animate-fade-up">
        {m.text}
      </span>
    )
  }

  if (m.kind === "remind") {
    return (
      <span className="flex items-center gap-1.5 self-center rounded-lg bg-warning-soft px-3 py-1 text-xs font-medium text-warning shadow-sm animate-fade-up">
        <BellRing className="size-3.5" aria-hidden />
        {m.label}
      </span>
    )
  }

  if (m.kind === "progress") {
    const done = modules.filter((id) => ["done", "sent", "checking"].includes(statuses[id] ?? "todo"))
    const waiting = modules.filter((id) => !done.includes(id))
    return (
      <Shell mine={false} time={item.time} tail={false} className="w-[82%]">
        <div className="flex flex-col gap-2 pb-1">
          <p className="text-[13px] font-semibold">Where you're up to</p>
          <ul className="flex flex-col gap-1">
            {done.map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm text-foreground/70">
                <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                <span className="line-through decoration-foreground/30">{moduleMeta[id].title}</span>
              </li>
            ))}
            {waiting.map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm">
                <Circle className="size-4 shrink-0 text-foreground/30" aria-hidden />
                <span>{moduleMeta[id].title}</span>
                <span className="ml-auto text-xs text-foreground/50">{moduleMeta[id].timeLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    )
  }

  if (m.kind === "link") {
    return (
      <Shell mine={false} time={item.time} tail={false} className="w-[82%] p-0 pb-1.5">
        <Link href={m.href} className="group flex flex-col">
          <div className="flex items-start gap-3 rounded-t-lg bg-brand-soft p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Image src={brand.logo} alt="" width={28} height={28} className="size-6 object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold leading-snug">{m.title}</p>
              <p className="text-[13px] leading-snug text-foreground/70">{m.body}</p>
            </div>
          </div>
          <span className="flex items-center justify-center gap-1.5 px-3 pt-2 text-sm font-semibold text-wa-link group-hover:underline">
            <ExternalLink className="size-4" aria-hidden />
            {m.cta}
          </span>
        </Link>
      </Shell>
    )
  }

  if (m.kind === "doc") {
    return (
      <Shell mine={false} time={item.time} className="w-[82%]">
        <div className="flex flex-col gap-2 pb-1">
          <div className="flex items-start gap-3 rounded-md bg-background/70 p-2.5">
            <FileText className="mt-0.5 size-6 shrink-0 text-destructive" aria-hidden />
            <div className="flex flex-col">
              <p className="text-sm font-semibold leading-snug">{m.title}</p>
              <p className="text-xs text-foreground/50">PDF · 3 pages</p>
            </div>
          </div>
          <ul className="flex flex-col gap-0.5 text-[13px] text-foreground/80">
            {m.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </Shell>
    )
  }

  if (m.kind === "attachment") {
    if (m.preview) {
      return (
        <Shell mine time={item.time} className="w-[72%] p-1 pb-1.5">
          <Image src={m.preview} alt={m.name} width={480} height={360} className="aspect-[4/3] w-full rounded-md object-cover" />
          <p className="px-1.5 pt-1 text-xs text-foreground/60">{m.meta}</p>
        </Shell>
      )
    }
    return (
      <Shell mine time={item.time}>
        <div className="flex items-center gap-3 rounded-md bg-foreground/5 p-2 pr-3">
          {m.image ? (
            <ImageIcon className="size-7 shrink-0 text-foreground/60" aria-hidden />
          ) : (
            <FileText className="size-7 shrink-0 text-destructive" aria-hidden />
          )}
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-snug">{m.name}</p>
            <p className="text-xs text-foreground/50">{m.meta}</p>
          </div>
        </div>
      </Shell>
    )
  }

  if (m.kind === "signed") {
    return (
      <Shell mine time={item.time}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <PenLine className="size-3.5" aria-hidden />
            Signed
          </div>
          {m.image ? (
            <Image src={m.image} alt={`Signature of ${m.name}`} width={220} height={80} className="h-16 w-auto rounded bg-background/80" unoptimized />
          ) : (
            <p className="font-heading text-2xl italic leading-none">{m.name}</p>
          )}
          <p className="text-xs text-foreground/60">{m.name} · enrolment agreement</p>
        </div>
      </Shell>
    )
  }

  return (
    <div className={cn("flex max-w-[88%] items-end gap-1.5", mine ? "self-end" : "self-start")}>
      {!mine && m.from === "rep" && item.showSender ? (
        <Image src={rep.photo} alt="" width={28} height={28} className="mb-5 size-7 shrink-0 rounded-full object-cover" />
      ) : (
        !mine && <span className="w-7 shrink-0" aria-hidden />
      )}
      <Shell mine={mine} time={item.time} tail={item.showSender || mine} className="max-w-none">
        <SenderLine item={item} brand={brand} rep={rep} />
        <span className="whitespace-pre-line">{m.text}</span>
      </Shell>
    </div>
  )
}
