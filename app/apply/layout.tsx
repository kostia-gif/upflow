import type { ReactNode } from "react"
import { CourseContextBar } from "@/components/apply/course-context-bar"

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col bg-background sm:my-6 sm:min-h-0 sm:rounded-3xl sm:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.25)]">
      <div className="sm:rounded-t-3xl sm:overflow-hidden">
        <CourseContextBar />
      </div>
      {children}
    </main>
  )
}
