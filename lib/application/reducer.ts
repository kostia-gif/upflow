import type { Application, BrandId, ModuleId, ModuleStatus } from "@/lib/types"
import { getBrand } from "@/lib/config/brands"
import { defaultCourseFor, getCourse } from "@/lib/config/courses"
import { modulesFor } from "@/lib/config/modules"
import { addDays } from "@/lib/format"

export type DevState = {
  brand: BrandId
  entryPath: "A" | "B"
  returning: boolean
  returningVerified: boolean
}

export type State = {
  app: Application
  dev: DevState
  lastModule?: ModuleId
}

export type Action =
  | { type: "SET_FIELDS"; fields: Partial<Application> }
  | { type: "SET_ELIGIBILITY"; id: string; value: string }
  | { type: "SET_MODULE_STATUS"; module: ModuleId; status: ModuleStatus }
  | { type: "SET_MODULE_DATA"; module: ModuleId; data: Record<string, string> }
  | { type: "SUBMIT" }
  | { type: "ASSIGN_ADVISOR" }
  | { type: "LOAD_APP"; app: Application }
  | { type: "SET_DEV"; dev: Partial<DevState> }
  | { type: "SET_BRAND"; brand: BrandId }
  | { type: "RESET" }
  | { type: "SET_LAST_MODULE"; module: ModuleId }
  | { type: "HYDRATE"; state: State }

export function newApplication(brand: BrandId, courseId?: string): Application {
  const course = getCourse(courseId) ?? defaultCourseFor(brand)
  return {
    id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
    brand,
    courseId: course.id,
    campusId: course.campuses.length === 1 ? course.campuses[0].id : undefined,
    intakeId: undefined,
    mobileVerified: false,
    eligibility: {},
    modules: {},
    moduleData: {},
  }
}

export function pathAFixture(brand: BrandId): Application {
  const b = getBrand(brand)
  const course = defaultCourseFor(brand)
  return {
    ...newApplication(brand, course.id),
    id: "APP-1042",
    campusId: course.campuses.find((c) => c.placesLeft > 0)?.id,
    intakeId: course.intakes[0].id,
    rep: b.defaultAdvisor,
    repAssigned: "spoken",
    entryPath: "A",
    firstName: "Sarah",
    lastName: "Bilkey",
    mobile: b.country === "AU" ? "0412 345 678" : "021 234 5678",
    email: "sarah.bilkey@gmail.com",
  }
}

export function returningFixture(brand: BrandId): Application {
  const b = getBrand(brand)
  const course = defaultCourseFor(brand)
  const base = pathAFixture(brand)
  return {
    ...base,
    id: "APP-1042",
    mobileVerified: true,
    residency: "yes",
    funding: "loan",
    eligibility: Object.fromEntries(course.eligibilityQuestions.map((q) => [q.id, q.passing[0]])),
    submittedAt: addDays(-2),
    holdUntil: addDays(course.holdDays - 2),
    modules: { identity: "done", address: "done", "school-record": "done" },
    moduleData: {
      identity: {
        method: "photo",
        name: "Sarah Jane Bilkey",
        dob: b.country === "AU" ? "14 May 1991" : "14 May 2008",
        citizenship: b.country === "AU" ? "Australian citizen" : "New Zealand citizen",
      },
      address: {
        line1: b.country === "AU" ? "12 Boundary Street" : "12 Kohimarama Road",
        suburb: b.country === "AU" ? "West End QLD 4101" : "Kohimarama, Auckland 1071",
      },
      "school-record": b.country === "AU" ? { usi: "K3PQ7R2M9W" } : { nsn: "0123456789" },
    },
  }
}

export const initialState: State = {
  app: newApplication("aipc"),
  dev: { brand: "aipc", entryPath: "B", returning: false, returningVerified: false },
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELDS":
      return { ...state, app: { ...state.app, ...action.fields } }
    case "SET_ELIGIBILITY":
      return { ...state, app: { ...state.app, eligibility: { ...state.app.eligibility, [action.id]: action.value } } }
    case "SET_MODULE_STATUS":
      return { ...state, app: { ...state.app, modules: { ...state.app.modules, [action.module]: action.status } } }
    case "SET_MODULE_DATA":
      return {
        ...state,
        app: {
          ...state.app,
          moduleData: {
            ...state.app.moduleData,
            [action.module]: { ...(state.app.moduleData[action.module] ?? {}), ...action.data },
          },
        },
      }
    case "SUBMIT": {
      const course = getCourse(state.app.courseId) ?? defaultCourseFor(state.app.brand)
      return {
        ...state,
        app: {
          ...state.app,
          submittedAt: new Date().toISOString(),
          holdUntil: state.app.holdUntil ?? addDays(course.holdDays),
          channel: "app",
        },
      }
    }
    case "ASSIGN_ADVISOR": {
      if (state.app.rep) return state
      const b = getBrand(state.app.brand)
      return { ...state, app: { ...state.app, rep: b.defaultAdvisor, repAssigned: "assigned" } }
    }
    case "LOAD_APP":
      return { ...state, app: action.app, dev: { ...state.dev, brand: action.app.brand } }
    case "SET_DEV":
      return { ...state, dev: { ...state.dev, ...action.dev } }
    case "SET_BRAND": {
      const dev = { ...state.dev, brand: action.brand, returningVerified: false }
      const app = dev.entryPath === "A" ? pathAFixture(action.brand) : { ...newApplication(action.brand), entryPath: "B" as const }
      return { app, dev, lastModule: undefined }
    }
    case "HYDRATE":
      return action.state
    case "RESET":
      return {
        app: { ...newApplication(state.dev.brand), entryPath: "B" },
        dev: { ...state.dev, entryPath: "B", returning: false, returningVerified: false },
        lastModule: undefined,
      }
    case "SET_LAST_MODULE":
      return { ...state, lastModule: action.module }
    default:
      return state
  }
}

export function moduleList(app: Application) {
  const brand = getBrand(app.brand)
  const course = getCourse(app.courseId) ?? defaultCourseFor(app.brand)
  return modulesFor(course, brand.country)
}

export function statusOf(app: Application, m: ModuleId): ModuleStatus {
  return app.modules[m] ?? "todo"
}

export function isComplete(app: Application, m: ModuleId) {
  const s = statusOf(app, m)
  return s === "done" || s === "sent" || s === "checking" || s === "later"
}

export function nextTodoModule(app: Application, after?: ModuleId): ModuleId | undefined {
  const list = moduleList(app)
  const start = after ? list.indexOf(after) + 1 : 0
  const ordered = [...list.slice(start), ...list.slice(0, start)]
  const others = ordered.filter((m) => m !== "sign")
  const next = others.find((m) => !isComplete(app, m))
  if (next) return next
  if (!isComplete(app, "sign")) return "sign"
  return undefined
}

export function progress(app: Application) {
  const list = moduleList(app)
  const done = list.filter((m) => isComplete(app, m)).length
  return { done, total: list.length }
}
