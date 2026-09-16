"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { toast } from "sonner"
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
  const { state, dispatch, hydrated } = useApplication()

  useEffect(() => {
    if (!hydrated) return
    const requested = params.get("brand")
    const brand = isBrandId(requested) ? requested : state.dev.brand
    const viaWhatsApp = params.get("via") === "whatsapp"
    const alreadyLoaded = state.app.brand === brand && !!state.app.submittedAt

    // A link minted for a verified WhatsApp number signs the browser in silently — no code screen.
    dispatch({ type: "SET_DEV", dev: { returning: true, returningVerified: viaWhatsApp } })
    if (!(viaWhatsApp && alreadyLoaded)) dispatch({ type: "LOAD_APP", app: returningFixture(brand) })
    if (viaWhatsApp) toast.success("Signed in from WhatsApp", { description: "Same application, picked up where you left it." })
    router.replace(params.get("to") === "done" ? "/apply/done" : "/apply/ready")
    // Deep-link entry: once storage is read, seed the returning fixture (unless WhatsApp progress already exists), then hand off to the hub.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

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
