import { isComplete } from "@/lib/application/reducer"
import type { Application, CourseConfig, FlowId, ModuleId } from "@/lib/types"

/** Steps that must be fully done, not skipped, before the final step opens. */
const MUST_BE_DONE: Partial<Record<FlowId, ModuleId[]>> = {
  "online-enrol-pay": ["identity", "address"],
}

/** What still stands between the applicant and the final step. Other steps may be set aside for later. */
export function finalStepBlockers(app: Application, course: CourseConfig, modules: ModuleId[]): ModuleId[] {
  const last = modules[modules.length - 1]
  const strict = MUST_BE_DONE[course.flow] ?? []
  return modules.filter(
    (m) => m !== last && (strict.includes(m) ? app.modules[m] !== "done" : !isComplete(app, m)),
  )
}
