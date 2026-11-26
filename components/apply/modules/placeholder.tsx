"use client"

import { PrimaryButton } from "@/components/apply/primitives"
import { moduleMeta } from "@/lib/config/modules"
import type { ModuleId } from "@/lib/types"
import type { ModuleProps } from "./types"

function placeholderFor(id: ModuleId) {
  function PlaceholderModule({ onComplete }: ModuleProps) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 rounded-2xl border border-dashed border-border p-4">
          <p className="text-sm font-semibold">{moduleMeta[id].title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This step isn&apos;t built yet. Tap Next to carry on.
          </p>
        </div>
        <PrimaryButton onClick={() => onComplete("done")}>Next</PrimaryButton>
      </div>
    )
  }
  PlaceholderModule.displayName = `PlaceholderModule(${id})`
  return PlaceholderModule
}

export const DegreeModule = placeholderFor("degree")
export const WorkHistoryModule = placeholderFor("work-history")
export const EntryStatementModule = placeholderFor("entry-statement")
