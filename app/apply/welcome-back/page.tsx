"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useApplication } from "@/lib/application/context"
import { returningFixture } from "@/lib/application/reducer"

export default function WelcomeBackPage() {
  const router = useRouter()
  const { state, dispatch } = useApplication()

  useEffect(() => {
    dispatch({ type: "SET_DEV", dev: { returning: true, returningVerified: false } })
    dispatch({ type: "LOAD_APP", app: returningFixture(state.dev.brand) })
    router.replace("/apply/ready")
    // Deep-link entry from the reminder text: seed the returning fixture once, then hand off to the hub.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground" aria-live="polite">
      Finding your application…
    </div>
  )
}
