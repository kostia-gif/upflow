"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Bot, Download, FileUp, MessageSquareText, PenLine, UserRound, Globe } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { WhatsAppChat } from "@/components/whatsapp/chat"
import { useApplication } from "@/lib/application/context"
import { returningFixture } from "@/lib/application/reducer"
import { brandOrder } from "@/lib/config/brands"
import type { BrandId } from "@/lib/types"
import type { Channel } from "@/lib/whatsapp/script"
import { cn } from "@/lib/utils"

const beats = [
  { icon: MessageSquareText, title: "Thanks, and where you're up to", body: "The provider opens the thread: you're in, your place is held, here's what's done and what's left." },
  { icon: UserRound, title: "Your advisor joins the same chat", body: "Priya — the person from the enquiry — is added to the thread, not a separate number. Student and advisor share one history." },
  { icon: Bot, title: "AI triages, a human is one tap away", body: "The assistant answers the quick stuff and offers to hand over. Anything it isn't sure of goes straight to Priya." },
  { icon: FileUp, title: "Documents land in the chat", body: "Photo ID is still outstanding, so the assistant asks for it. A passport photo or a CV arrives as a photo or file; the assistant reads it and updates the application on the spot." },
  { icon: PenLine, title: "Sign, and you're enrolled", body: "The agreement is summarised in the thread and signed with a finger. Nothing left to do in a form." },
]

const channels: { id: Channel; label: string; title: string; note: string }[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    title: "Continue in WhatsApp",
    note: "Rich thread: named senders, a group with the advisor, cards, tap-to-reply buttons, documents and a signature pad in the chat.",
  },
  {
    id: "sms",
    label: "SMS",
    title: "Continue by SMS",
    note: "Same script under carrier rules: plain text from one number, numbered replies instead of buttons, photos via MMS, and a link out for anything richer — like signing.",
  },
]

function isBrandId(v: string | null): v is BrandId {
  return !!v && (brandOrder as string[]).includes(v)
}

/** The returning fixture has ID done; here it is still outstanding so the thread can ask for a passport photo. */
function chatFixture(brand: BrandId, channel: Channel) {
  const fixture = returningFixture(brand)
  const { identity: _status, ...modules } = fixture.modules
  const { identity: _data, ...moduleData } = fixture.moduleData
  return { ...fixture, modules, moduleData, channel: channel === "sms" ? ("app" as const) : ("whatsapp" as const) }
}

function Journey() {
  const params = useSearchParams()
  const { state, dispatch } = useApplication()
  const [beat, setBeat] = useState(0)
  const [channel, setChannel] = useState<Channel>(params.get("channel") === "sms" ? "sms" : "whatsapp")
  const [seeded, setSeeded] = useState(false)
  const brand = isBrandId(params.get("brand")) ? (params.get("brand") as BrandId) : state.dev.brand

  useEffect(() => {
    dispatch({ type: "SET_DEV", dev: { brand, returning: true, returningVerified: true } })
    dispatch({ type: "LOAD_APP", app: chatFixture(brand, channel) })
    setSeeded(true)
    // Re-seed whenever the channel flips so both threads start from the same point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel])

  const current = channels.find((c) => c.id === channel) ?? channels[0]

  if (!seeded) return null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-8 lg:flex-row lg:items-start lg:gap-14 lg:py-12">
      <aside className="flex flex-col gap-8 lg:sticky lg:top-10 lg:w-[380px] lg:shrink-0">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          All journeys
        </Link>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Proof of concept</span>
          <h1 className="text-balance font-sans text-3xl font-semibold leading-[1.1] tracking-tight">{current.title}</h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            The student started in the browser and stopped. The rest of the enrolment — questions, the outstanding
            passport photo, the signature — happens in one thread the advisor is part of. Tap the replies, or type
            your own question.
          </p>
        </div>
        <ol className="hidden flex-col gap-1 lg:flex">
          {beats.map(({ icon: Icon, title, body }, i) => {
            const active = i === beat
            const past = i < beat
            return (
              <li
                key={title}
                className={cn(
                  "flex items-start gap-3 rounded-2xl p-3 transition-colors",
                  active && "bg-background shadow-sm",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                    active ? "bg-brand text-brand-foreground" : past ? "bg-success-soft text-success" : "bg-background text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className={cn("text-sm font-semibold leading-snug", !active && !past && "text-muted-foreground")}>{title}</p>
                  {active && <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>}
                </div>
              </li>
            )
          })}
        </ol>
        <div className="hidden items-start gap-3 rounded-2xl border border-border p-4 lg:flex">
          <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Opening the browser from here needs no code.</span> The
            link is minted for this {channel === "sms" ? "mobile" : "WhatsApp"} number, so the phone that taps it is the phone we already verified.
            It signs the browser in silently and lands on the same step.
          </p>
        </div>
      </aside>

      <div className="flex w-full flex-col items-center gap-4 lg:flex-1">
        <div className="flex w-full max-w-[400px] flex-col gap-2">
          <div role="tablist" aria-label="Channel" className="flex rounded-full bg-background p-1 shadow-sm">
            {channels.map((c) => {
              const active = c.id === channel
              return (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => {
                    setBeat(0)
                    setChannel(c.id)
                  }}
                  className={cn(
                    "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
          <p className="text-pretty px-2 text-center text-xs leading-relaxed text-muted-foreground">{current.note}</p>
          <a
            href={`/whatsapp/transcript?brand=${brand}&channel=${channel}`}
            download
            className="inline-flex items-center justify-center gap-1.5 self-center text-xs font-medium text-foreground underline-offset-4 hover:underline"
          >
            <Download className="size-3.5" aria-hidden="true" />
            Download the full {current.label} dialogue (Markdown)
          </a>
        </div>
        <div className="h-[calc(100svh-3rem)] w-full max-w-[400px] overflow-hidden rounded-[2rem] border-[6px] border-foreground bg-foreground shadow-2xl sm:h-[800px]">
          <div className="h-full overflow-hidden rounded-[1.6rem]">
            <WhatsAppChat key={channel} channel={channel} onBeat={setBeat} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WhatsAppJourneyPage() {
  return (
    <main className="min-h-svh bg-muted">
      <Suspense>
        <Journey />
      </Suspense>
    </main>
  )
}
