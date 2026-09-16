"use client"

import { Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type OptionCard = { id: string; title: string; description?: string; icon?: LucideIcon; tag?: string }

export function OptionCards({
  options,
  value,
  onChange,
  label,
}: {
  options: OptionCard[]
  value?: string
  onChange: (id: string) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-3">
      {options.map((o) => {
        const active = value === o.id
        const Icon = o.icon
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all active:scale-[0.99]",
              active ? "border-brand bg-brand-soft/40" : "border-border hover:border-foreground/30",
            )}
          >
            {Icon && (
              <span
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                  active ? "bg-brand text-brand-foreground" : "bg-muted text-foreground/70",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="text-base font-semibold">{o.title}</span>
                {o.tag && (
                  <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-xs font-medium text-foreground">
                    {o.tag}
                  </span>
                )}
              </span>
              {o.description && <span className="text-sm leading-snug text-muted-foreground">{o.description}</span>}
            </span>
            <span
              className={cn(
                "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                active ? "border-brand bg-brand text-brand-foreground" : "border-border",
              )}
              aria-hidden
            >
              {active && <Check className="size-3.5" strokeWidth={3} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
