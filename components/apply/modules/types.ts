import type { ModuleStatus } from "@/lib/types"

export type ModuleProps = {
  onComplete: (status: ModuleStatus, data?: Record<string, string>) => void
}
