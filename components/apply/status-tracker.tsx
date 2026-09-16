import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = ["Applied", "Getting ready", "Offer", "Enrolled"] as const

export function StatusTracker({ current }: { current: (typeof steps)[number] }) {
  const currentIndex = steps.indexOf(current)
  return (
    <ol className="flex items-start" aria-label="Application progress">
      {steps.map((s, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={s} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : done || active ? "bg-brand" : "bg-border")} />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  done && "border-brand bg-brand text-brand-foreground",
                  active && "border-brand bg-background text-brand ring-4 ring-brand/15",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span className={cn("h-0.5 flex-1", i === steps.length - 1 ? "bg-transparent" : done ? "bg-brand" : "bg-border")} />
            </div>
            <span
              className={cn(
                "text-center text-xs leading-tight",
                active ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
