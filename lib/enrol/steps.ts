import { isComplete } from "@/lib/application/reducer"
import type { Application, CourseConfig, FlowId, ModuleId } from "@/lib/types"

/** Steps that must be fully done, not skipped, before the final step opens. */
const MUST_BE_DONE: Partial<Record<FlowId, ModuleId[]>> = {
  "online-enrol-pay": ["identity", "address"],
}

/**
 * The step to open once `current` is completed or set aside. `nextModule` is worked out before that
 * change lands, so when `current` was the only step left it points back at `current`; the final step
 * is what actually comes next.
 */
export function stepAfter(
  current: ModuleId,
  app: Application,
  modules: ModuleId[],
  nextModule: (after?: ModuleId) => ModuleId | undefined,
): ModuleId | undefined {
  const candidate = nextModule(current)
  if (candidate !== current) return candidate
  const last = modules[modules.length - 1]
  return last !== current && !isComplete(app, last) ? last : undefined
}

/** What still stands between the applicant and the final step. Other steps may be set aside for later. */
export function finalStepBlockers(app: Application, course: CourseConfig, modules: ModuleId[]): ModuleId[] {
  const last = modules[modules.length - 1]
  const strict = MUST_BE_DONE[course.flow] ?? []
  return modules.filter(
    (m) => m !== last && (strict.includes(m) ? app.modules[m] !== "done" : !isComplete(app, m)),
  )
}
