"use client"

import type { ReactNode } from "react"
import { CourseContextBar } from "@/components/apply/course-context-bar"
import { useApplication } from "@/lib/application/context"
import { cn, frameClass } from "@/lib/utils"

export default function ApplyLayout({ children }: { children: ReactNode }) {
  const { state } = useApplication()
  return (
    <main
      className={cn(
        "mx-auto flex min-h-svh w-full flex-col bg-background sm:my-6 sm:min-h-0",
        frameClass(state.dev.desktopView),
      )}
    >
      <div className="sm:overflow-hidden sm:rounded-t-[inherit]">
        <CourseContextBar />
      </div>
      {children}
    </main>
  )
}
