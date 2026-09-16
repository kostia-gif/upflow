"use client"

import Image from "next/image"
import { MessageCircle, Phone } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useApplication } from "@/lib/application/context"
import { cn } from "@/lib/utils"

export function RepCard({ className, intro }: { className?: string; intro?: string }) {
  const { app, rep } = useApplication()
  const ref = useRef<HTMLDivElement>(null)
  const [offscreen, setOffscreen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [rep])

  if (!rep) return null
  const line =
    intro ??
    (app.repAssigned === "assigned"
      ? `${rep.name} is your ${rep.role.toLowerCase()} — ask them anything`
      : `You've already chatted with ${rep.name} — they've got your details`)

  return (
    <>
      <div
        ref={ref}
        className={cn("flex items-center gap-3 rounded-2xl border border-border bg-brand-soft/50 p-3", className)}
      >
        <Image
          src={rep.photo}
          alt={`${rep.name}, ${rep.role}`}
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{line}</p>
          <p className="truncate text-xs text-muted-foreground">{rep.role} · usually replies in minutes</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <a
            href={rep.whatsapp}
            aria-label={`WhatsApp ${rep.name}`}
            className="flex size-10 items-center justify-center rounded-full bg-background text-brand shadow-sm hover:bg-brand hover:text-brand-foreground"
          >
            <MessageCircle className="size-5" aria-hidden />
          </a>
          <a
            href={rep.phone}
            aria-label={`Call ${rep.name}`}
            className="flex size-10 items-center justify-center rounded-full bg-background text-brand shadow-sm hover:bg-brand hover:text-brand-foreground"
          >
            <Phone className="size-5" aria-hidden />
          </a>
        </div>
      </div>
      {offscreen && (
        <a
          href={rep.whatsapp}
          aria-label={`Message ${rep.name} on WhatsApp`}
          className="fixed bottom-28 right-4 z-30 flex items-center gap-2 rounded-full bg-background p-1 pr-3 shadow-lg ring-1 ring-border sm:right-[calc(50%-240px+1rem)]"
        >
          <Image src={rep.photo} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
          <span className="text-sm font-medium">{rep.name}</span>
          <MessageCircle className="size-4 text-brand" aria-hidden />
        </a>
      )}
    </>
  )
}
