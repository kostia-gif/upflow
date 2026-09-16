"use client"

import { useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type Option = { value: string; label: string }

export function Segmented({
  label,
  options,
  value,
  onChange,
  helper,
  why,
  optional,
}: {
  label: string
  options: (Option | string)[]
  value?: string
  onChange: (v: string) => void
  helper?: ReactNode
  why?: ReactNode
  optional?: boolean
}) {
  const id = useId()
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o))
  const wrap = opts.length > 3 || opts.some((o) => o.label.length > 14)

  return (
    <fieldset className="flex flex-col gap-2" aria-labelledby={id}>
      <legend id={id} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>}
      </legend>
      <div
        role="radiogroup"
        className={cn(
          "gap-1 rounded-2xl bg-muted p-1",
          wrap ? "grid grid-cols-2" : "flex",
        )}
      >
        {opts.map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "min-h-12 flex-1 rounded-xl px-3 text-sm font-medium transition-all",
                active
                  ? "bg-background text-brand shadow-sm ring-1 ring-brand/30"
                  : "text-foreground/70 hover:bg-background/60 hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {helper && <p className="text-sm leading-snug text-muted-foreground">{helper}</p>}
      {why}
    </fieldset>
  )
}
