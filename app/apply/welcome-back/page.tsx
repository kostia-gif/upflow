"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useApplication } from "@/lib/application/context"
import { returningFixture } from "@/lib/application/reducer"
import { brandOrder } from "@/lib/config/brands"
import type { BrandId } from "@/lib/types"

function isBrandId(value: string | null): value is BrandId {
  return !!value && (brandOrder as string[]).includes(value)
}

function WelcomeBackRedirect() {
  const router = useRouter()
  const params = useSearchParams()
  const { state, dispatch } = useApplication()

  useEffect(() => {
    const requested = params.get("brand")
    const brand = isBrandId(requested) ? requested : state.dev.brand
    dispatch({ type: "SET_DEV", dev: { returning: true, returningVerified: false } })
    dispatch({ type: "LOAD_APP", app: returningFixture(brand) })
    router.replace("/apply/ready")
    // Deep-link entry: seed the returning fixture for the requested (or current) brand, then hand off to the hub.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default function WelcomeBackPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground" aria-live="polite">
      Finding your application…
      <Suspense>
        <WelcomeBackRedirect />
      </Suspense>
    </div>
  )
}
