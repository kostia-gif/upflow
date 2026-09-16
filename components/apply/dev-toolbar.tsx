"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bug, Monitor, RotateCcw } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useApplication } from "@/lib/application/context"
import { brandOrder, brands } from "@/lib/config/brands"
import { pathAFixture, returningFixture } from "@/lib/application/reducer"
import type { BrandId } from "@/lib/types"
import { cn } from "@/lib/utils"

const jumps = [
  ["/", "Intro"],
  ["/course", "Course page"],
  ["/apply", "Apply"],
  ["/apply/received", "Received"],
  ["/apply/ready", "Get ready hub"],
  ["/apply/done", "Done"],
  ["/apply/whatsapp", "WhatsApp"],
  ["/international", "International"],
]

export function DevToolbar() {
  const { state, dispatch } = useApplication()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { dev } = state

  function setBrand(brand: BrandId) {
    dispatch({ type: "SET_BRAND", brand })
    if (dev.returning) {
      dispatch({ type: "LOAD_APP", app: returningFixture(brand) })
    }
  }

  function setEntryPath(path: "A" | "B") {
    dispatch({ type: "SET_DEV", dev: { entryPath: path } })
    if (path === "A") {
      dispatch({ type: "LOAD_APP", app: pathAFixture(dev.brand) })
      setOpen(false)
      router.push(`/apply?app=APP-1042&rep=${brands[dev.brand].defaultAdvisor}`)
    } else {
      dispatch({ type: "RESET" })
      router.push("/course")
      setOpen(false)
    }
  }

  function restart() {
    dispatch({ type: "RESET" })
    setOpen(false)
    router.push("/")
  }

  function setReturning(on: boolean) {
    dispatch({ type: "SET_DEV", dev: { returning: on, returningVerified: false } })
    if (on) {
      dispatch({ type: "LOAD_APP", app: returningFixture(dev.brand) })
      setOpen(false)
      router.push("/apply/ready")
    } else {
      dispatch({ type: "RESET" })
    }
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          title="Back"
          className="flex size-9 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:opacity-90"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={restart}
          aria-label="Restart prototype"
          title="Restart prototype"
          className="flex size-9 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:opacity-90"
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open prototype controls"
          className="flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-medium text-background shadow-lg hover:opacity-90"
        >
          <Bug className="size-3.5" aria-hidden />
          Prototype
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full max-w-sm px-5 pt-6">
          <SheetHeader className="p-0">
            <SheetTitle className="font-heading text-xl">Prototype controls</SheetTitle>
            <SheetDescription>Switch brand, entry path and returning state. Nothing here ships.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 overflow-y-auto">
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand</h3>
              <div className="grid grid-cols-2 gap-2">
                {brandOrder.map((id) => {
                  const b = brands[id]
                  const active = dev.brand === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBrand(id)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-medium",
                        active ? "border-foreground" : "border-border hover:border-foreground/40",
                      )}
                    >
                      <span className="size-4 rounded-full" style={{ background: b.primary }} aria-hidden />
                      <span className="flex-1">{b.shortName}</span>
                      <span className="text-xs text-muted-foreground">{b.country}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry path</h3>
              <div className="flex gap-1 rounded-xl bg-muted p-1">
                {(["A", "B"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEntryPath(p)}
                    className={cn(
                      "min-h-10 flex-1 rounded-lg px-2 text-sm font-medium",
                      dev.entryPath === p ? "bg-background shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    {p === "A" ? "A · Rep sent a link" : "B · Self-serve"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                A loads Sarah Bilkey with a rep attached and jumps to the code step. B starts fresh from the course page.
              </p>
            </section>

            <section className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">Returning student</h3>
                <p className="text-xs text-muted-foreground">Three modules done, hold running. Gate by code.</p>
              </div>
              <Switch checked={dev.returning} onCheckedChange={setReturning} aria-label="Returning student" />
            </section>

            <section className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Monitor className="size-4 text-muted-foreground" aria-hidden />
                <div>
                  <h3 className="text-sm font-medium">Full desktop view</h3>
                  <p className="text-xs text-muted-foreground">Widen the phone mockup to review at desktop size.</p>
                </div>
              </div>
              <Switch
                checked={dev.desktopView}
                onCheckedChange={(on) => dispatch({ type: "SET_DEV", dev: { desktopView: on } })}
                aria-label="Full desktop view"
              />
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jump to</h3>
              <div className="flex flex-wrap gap-2">
                {jumps.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={restart}
              className="min-h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted"
            >
              Reset everything
            </button>
            <p className="text-xs text-muted-foreground">
              Application {state.app.id} · {state.app.entryPath ?? "B"} · {Object.keys(state.app.modules).length} modules touched
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
