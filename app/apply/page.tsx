"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useApplication } from "@/lib/application/context"
import { pathAFixture } from "@/lib/application/reducer"
import { getCourse } from "@/lib/config/courses"
import { getRep } from "@/lib/config/reps"
import type { Application, BrandId } from "@/lib/types"

function ApplyEntry() {
  const params = useSearchParams()
  const router = useRouter()
  const { app, dispatch } = useApplication()

  useEffect(() => {
    const appId = params.get("app")
    const repId = params.get("rep")
    const rep = getRep(repId ?? undefined)

    if (appId) {
      const brand = (rep?.brand ?? params.get("brand") ?? app.brand) as BrandId
      dispatch({ type: "SET_DEV", dev: { entryPath: "A", brand } })
      dispatch({ type: "LOAD_APP", app: { ...pathAFixture(brand), id: appId, rep: rep?.id ?? pathAFixture(brand).rep } })
      router.replace("/apply/you")
      return
    }

    const fields: Partial<Application> = {}
    const course = getCourse(params.get("course") ?? undefined)
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

    router.replace("/apply/start")
    // Runs once on entry: URL params are the source of truth for this hop only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
