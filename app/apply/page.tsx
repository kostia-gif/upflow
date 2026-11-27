"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useApplication } from "@/lib/application/context"
import { pathAFixture } from "@/lib/application/reducer"
import { getCourse, resolveCourse } from "@/lib/config/courses"
import { getRep } from "@/lib/config/reps"
import type { Application, BrandId } from "@/lib/types"

function ApplyEntry() {
  const params = useSearchParams()
  const router = useRouter()
  const { app, state, hydrated, dispatch } = useApplication()

  useEffect(() => {
    if (!hydrated) return
    const legacy = !!state.dev.aipcLegacy
    const appId = params.get("app")
    const repId = params.get("rep")
    const rep = getRep(repId ?? undefined)
    const course = getCourse(params.get("course") ?? undefined)

    if (appId) {
      const brand = (rep?.brand ?? params.get("brand") ?? app.brand) as BrandId
      const fixture = pathAFixture(brand, course?.id, legacy)
      dispatch({ type: "SET_DEV", dev: { entryPath: "A", brand } })
      dispatch({ type: "LOAD_APP", app: { ...fixture, id: appId, rep: rep?.id ?? fixture.rep } })
      router.replace(resolveCourse(fixture, legacy).flow === "nz-baseline" ? "/apply/you" : "/enrol/you")
      return
    }

    const fields: Partial<Application> = {}
    if (course) {
      fields.courseId = course.id
      fields.brand = course.brand
      dispatch({ type: "SET_DEV", dev: { brand: course.brand } })
    }
    const campus = params.get("campus")
    if (campus) fields.campusId = campus
    const intake = params.get("intake")
    if (intake) fields.intakeId = intake
    if (rep) {
      fields.rep = rep.id
      fields.repAssigned = "spoken"
    }
    fields.entryPath = "B"
    dispatch({ type: "SET_FIELDS", fields })

    params.forEach((value, key) => {
      if (key.startsWith("elig_")) dispatch({ type: "SET_ELIGIBILITY", id: key.slice(5), value })
    })

    const flowCourse = resolveCourse(
      { courseId: course?.id ?? app.courseId, brand: course?.brand ?? app.brand },
      legacy,
    )
    router.replace(flowCourse.flow !== "nz-baseline" ? "/enrol/start" : "/apply/start")
    // Runs once on entry, after saved state loads: URL params are the source of truth for this hop only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  return (
    <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground" aria-live="polite">
      Opening your application…
    </div>
  )
}

export default function ApplyPage() {
  return (
    <Suspense fallback={null}>
      <ApplyEntry />
    </Suspense>
  )
}
