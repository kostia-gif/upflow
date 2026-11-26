import type { CourseConfig } from "@/lib/types"

export const ENROL_STEPS_PATH = "/enrol/steps"

/** The screen between "about you" and the step list: build your course (2A) or your way in (2B). */
export function preStepsPath(course: CourseConfig) {
  return course.flow === "online-enrol-pay" ? "/enrol/build" : "/enrol/way-in"
}
