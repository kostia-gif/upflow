import { moduleMeta } from "@/lib/config/modules"
import { DEGREE_ON_FILE } from "@/lib/enrol/masters"
import type { Application, Country, CourseConfig, FlowId, ModuleId } from "@/lib/types"

/** Step descriptions that differ from the shared wording for a given flow. */
const flowDescriptions: Partial<Record<FlowId, Partial<Record<ModuleId, string>>>> = {
  "online-apply-assess": {
    money: "You pay per subject, each trimester. Nothing is due today.",
    sign: "Check it over and submit. Last step.",
  },
}

export function moduleDescription(app: Application, course: CourseConfig, id: ModuleId, country: Country) {
  if (id === "degree" && app.moduleData.degree?.method === DEGREE_ON_FILE) return "We have this on file."
  return flowDescriptions[course.flow]?.[id] ?? moduleMeta[id].description[country]
}
