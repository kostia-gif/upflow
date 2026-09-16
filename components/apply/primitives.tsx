"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import type { ComponentProps, ReactNode, SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function PrimaryButton({
  children,
  className,
  arrow = true,
  ...props
}: ComponentProps<"button"> & { arrow?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-base font-semibold text-brand-foreground transition-all hover:brightness-110 active:translate-y-px disabled:opacity-40 disabled:hover:brightness-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/40",
        className,
      )}
      {...props}
    >
      {children}
      {arrow && <ArrowRight className="size-5" aria-hidden />}
    </button>
  )
}

export function SecondaryButton({ children, className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand/20 bg-background px-6 text-base font-semibold text-brand transition-colors hover:bg-brand-soft/60 active:translate-y-px focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TextLink({
  href,
  children,
  className,
  onClick,
}: {
  href?: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const cls = cn(
    "inline-flex min-h-11 items-center justify-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
    className,
  )
  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.12em] text-brand", className)}>{children}</p>
  )
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-balance font-heading text-[2rem] font-semibold leading-[1.1] tracking-tight", className)}>
      {children}
    </h1>
  )
}

export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-pretty text-base leading-relaxed text-muted-foreground", className)}>{children}</p>
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-4", className)}>{children}</div>
}

export function Tick({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex size-5 items-center justify-center rounded-full bg-success text-background", className)}
      aria-hidden
    >
      <Check className="size-3.5" strokeWidth={3} />
    </span>
  )
}

export function NativeSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-14 w-full appearance-none rounded-2xl border border-input bg-background px-4 pr-10 text-base text-foreground focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/20 invalid:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </div>
  )
}
