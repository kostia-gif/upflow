"use client"

import { FileText } from "lucide-react"
import { useApplication } from "@/lib/application/context"
import { needsFor } from "@/lib/config/modules"

/**
 * Up-front overview of documents the applicant may want on hand, with the
 * reassurance that none of them block starting.
 */
export function WhatYouNeed() {
  const { brand, course } = useApplication()
  const needs = needsFor(course, brand.country)
  if (needs.length === 0) return null

  return (
    <section aria-labelledby="what-you-need" className="flex flex-col gap-3 rounded-2xl border border-border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="what-you-need" className="text-sm font-semibold">
          Handy to have nearby
        </h2>
        <span className="text-xs text-muted-foreground">None of it needed to start</span>
      </div>
      <ul className="flex flex-col gap-2">
        {needs.map((n) => (
          <li key={n} className="flex items-start gap-2 text-sm leading-snug">
            <FileText className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>{n}</span>
          </li>
        ))}
      </ul>
      <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
        Haven&apos;t got something? Skip that bit and we&apos;ll text you when it&apos;s a good time to add it. The
        main thing is to get started.
      </p>
    </section>
  )
}
