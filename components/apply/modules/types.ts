import type { ModuleStatus } from "@/lib/types"

export type ModuleProps = {
  /** `message` replaces the default confirmation toast where the page supports it. */
  onComplete: (status: ModuleStatus, data?: Record<string, string>, message?: string) => void
}
