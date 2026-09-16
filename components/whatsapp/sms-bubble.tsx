"use client"

import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import type { Rendered } from "@/components/whatsapp/bubbles"
import { moduleMeta } from "@/lib/config/modules"
import type { BrandConfig, ModuleId, ModuleStatus, Rep } from "@/lib/types"
import { cn } from "@/lib/utils"

type SmsBubbleProps = {
  item: Rendered
  brand: BrandConfig
  rep: Rep
  modules: ModuleId[]
  statuses: Partial<Record<ModuleId, ModuleStatus>>
}

/** Short branded link a carrier message would carry instead of a rich card. */
export function smsLink(brand: BrandConfig, path: string) {
  const code = Math.abs(Array.from(path).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).slice(0, 5)
  return `${brand.id}.link/${code}`
}

function Plain({ mine, children }: { mine: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "max-w-[78%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-[15px] leading-snug animate-fade-up",
        mine ? "self-end rounded-br-sm bg-sms-out text-sms-out-foreground" : "self-start rounded-bl-sm bg-sms-in text-foreground",
      )}
    >
      {children}
    </div>
  )
}

function Url({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="break-all underline underline-offset-2">
      {label}
    </Link>
  )
}

/**
 * Renders the same script as the WhatsApp thread under SMS constraints: plain text, no sender identity,
 * no cards or buttons, links as URLs, photos via MMS. The gap between the two is the point of the toggle.
 */
export function SmsBubble({ item, brand, rep, modules, statuses }: SmsBubbleProps) {
  const m = item.message
  const prefix = item.showSender && "from" in m && m.from !== "me" ? (m.from === "rep" ? `${rep.name} (${brand.shortName}): ` : `${brand.shortName}: `) : ""

  switch (m.kind) {
    case "system":
      return <Plain mine={false}>{`${brand.shortName}: ${m.text.replace(/ was added$/, " has joined this thread — reply here to reach them.")}`}</Plain>
    case "remind":
      return <Plain mine={false}>{`${brand.shortName}: ${m.label.replace(" · ", " for ")}.`}</Plain>
    case "progress": {
      const done = modules.filter((id) => ["done", "sent", "checking"].includes(statuses[id] ?? "todo"))
      const waiting = modules.filter((id) => !done.includes(id))
      return (
        <Plain mine={false}>
          {`${brand.shortName}: Done so far — ${done.map((id) => moduleMeta[id].title).join(", ")}.\nStill to do — ${waiting
            .map((id) => `${moduleMeta[id].title} (${moduleMeta[id].timeLabel})`)
            .join(", ")}.`}
        </Plain>
      )
    }
    case "link":
      return (
        <Plain mine={false}>
          {`${brand.shortName}: ${m.title} — `}
          <Url href={m.href} label={smsLink(brand, m.href)} />
          {`\n${m.body}`}
        </Plain>
      )
    case "doc":
      return (
        <Plain mine={false}>
          {`${brand.shortName}: ${m.title} (PDF, 3 pages) — `}
          <Url href="#" label={smsLink(brand, m.title)} />
          {`\n${m.lines.join(" · ")}`}
        </Plain>
      )
    case "attachment":
      return m.preview ? (
        <div className="max-w-[70%] self-end overflow-hidden rounded-2xl rounded-br-sm animate-fade-up">
          <Image src={m.preview} alt={m.name} width={480} height={360} className="aspect-[4/3] w-full object-cover" />
        </div>
      ) : (
        <Plain mine>{`${m.name}\n${m.meta}${m.image ? "" : " · attached via MMS"}`}</Plain>
      )
    case "signed":
      return <Plain mine>{`Done — signed it in the browser.`}</Plain>
    default:
      return <Plain mine={m.from === "me"}>{`${prefix}${m.text}`}</Plain>
  }
}
