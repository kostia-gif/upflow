"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useApplication } from "@/lib/application/context"
import { returningFixture } from "@/lib/application/reducer"
import { AIPC_DIPLOMA_ID, getCourse } from "@/lib/config/courses"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"

function WelcomeBackRedirect() {
  const router = useRouter()
  const params = useSearchParams()
  const { course: current, dispatch, hydrated } = useApplication()

  useEffect(() => {
    if (!hydrated) return
    const requested = getCourse(params.get("course") ?? undefined)
    const course =
      requested && requested.flow !== "nz-baseline"
        ? requested
        : current.flow !== "nz-baseline"
          ? current
          : getCourse(AIPC_DIPLOMA_ID)
    if (!course) return
    dispatch({ type: "SET_DEV", dev: { returning: true, returningVerified: false, aipcLegacy: false } })
    dispatch({ type: "LOAD_APP", app: returningFixture(course.brand, course.id) })
    router.replace(ENROL_STEPS_PATH)
    // Deep-link entry: once storage is read, seed the returning fixture and hand off to the steps hub.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  return null
}

export default function EnrolWelcomeBackPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground" aria-live="polite">
      Finding your application…
      <Suspense>
        <WelcomeBackRedirect />
      </Suspense>
    </div>
  )
}
