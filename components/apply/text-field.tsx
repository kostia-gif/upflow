"use client"

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Tick } from "./primitives"

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string
  value: string
  onChange: (v: string) => void
  validate?: (v: string) => string | null
  helper?: ReactNode
  why?: ReactNode
}

export function TextField({ label, value, onChange, validate, helper, why, className, ...props }: Props) {
  const id = useId()
  const [touched, setTouched] = useState(false)
  const error = touched && validate ? validate(value) : null
  const valid = value.trim().length > 0 && (!validate || validate(value) === null)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={!!error}
          aria-describedby={helper || error ? `${id}-help` : undefined}
          className={cn(
            "h-14 w-full rounded-2xl border bg-background px-4 pr-11 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-3",
            error
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              : valid
                ? "border-success/60 focus-visible:border-success focus-visible:ring-success/20"
                : "border-input focus-visible:border-brand focus-visible:ring-brand/20",
            className,
          )}
          {...props}
        />
        {valid && !error && <Tick className="absolute right-4 top-1/2 -translate-y-1/2" />}
      </div>
      {(error || helper) && (
        <p id={`${id}-help`} className={cn("text-sm leading-snug", error ? "text-destructive" : "text-muted-foreground")}>
          {error ?? helper}
        </p>
      )}
      {why}
    </div>
  )
}
