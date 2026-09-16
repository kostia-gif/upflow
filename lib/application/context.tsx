"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react"
import { getBrand } from "@/lib/config/brands"
import { defaultCourseFor, getCourse } from "@/lib/config/courses"
import { moduleMeta, totalMinutesFor } from "@/lib/config/modules"
import { getRep } from "@/lib/config/reps"
import type { Application, BrandConfig, CourseConfig, ModuleId, Rep } from "@/lib/types"
import {
  initialState,
  isComplete,
  moduleList,
  nextTodoModule,
  progress,
  reducer,
  type Action,
  type State,
} from "./reducer"

type Ctx = {
  state: State
  app: Application
  brand: BrandConfig
  course: CourseConfig
  rep?: Rep
  modules: ModuleId[]
  progress: { done: number; total: number }
  minutesLeft: number
  nextModule: (after?: ModuleId) => ModuleId | undefined
  dispatch: (a: Action) => void
  /** Number of steps in the apply mini-form before get-ready begins. */
  applySteps: number
  /** Total steps across the whole flow: apply steps + every get-ready module. */
  totalSteps: number
  /** Honest whole-flow estimate: the apply steps plus every module, rounded up. */
  totalMinutes: number
}

const ApplicationContext = createContext<Ctx | null>(null)

const STORAGE_KEY = "up-apply-prototype-state"

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as State })
    } catch {
      // Ignore corrupt or unavailable storage; start fresh.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage may be unavailable (private mode, quota); the prototype still works in memory.
    }
  }, [state, hydrated])

  const value = useMemo<Ctx>(() => {
    const app = state.app
    const brand = getBrand(app.brand)
    const course = getCourse(app.courseId) ?? defaultCourseFor(app.brand)
    const modules = moduleList(app)
    const minutesLeft = modules.filter((m) => !isComplete(app, m)).reduce((sum, m) => sum + moduleMeta[m].minutes, 0)
    const applySteps = 3
    const totalMinutes = totalMinutesFor(course, brand.country)
    return {
      state,
      app,
      brand,
      course,
      rep: getRep(app.rep),
      modules,
      progress: progress(app),
      minutesLeft,
      nextModule: (after) => nextTodoModule(app, after),
      dispatch,
      applySteps,
      totalSteps: applySteps + modules.length,
      totalMinutes,
    }
  }, [state])

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}

export function useApplication() {
  const ctx = useContext(ApplicationContext)
  if (!ctx) throw new Error("useApplication must be used inside ApplicationProvider")
  return ctx
}
