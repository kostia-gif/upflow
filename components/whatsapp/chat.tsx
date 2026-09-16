"use client"

import Image from "next/image"
import { ArrowLeft, Mic, Paperclip, Phone, SendHorizontal, Video } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Bubble, type Rendered } from "@/components/whatsapp/bubbles"
import { SignSheet, UploadSheet, type Attachment } from "@/components/whatsapp/sheets"
import { useApplication } from "@/lib/application/context"
import { isComplete } from "@/lib/application/reducer"
import { moduleMeta } from "@/lib/config/modules"
import { formatDayMonth } from "@/lib/format"
import { buildScript, chatModules, routeFreeText, type Message, type Scene } from "@/lib/whatsapp/script"
import { cn } from "@/lib/utils"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function readTime(text: string) {
  return Math.min(1600, 500 + text.length * 9)
}

export function WhatsAppChat({ onBeat }: { onBeat?: (beat: number) => void }) {
  const { app, brand, course, rep, modules, dispatch } = useApplication()
  const [log, setLog] = useState<Rendered[]>([])
  const [typing, setTyping] = useState<"assistant" | "rep" | null>(null)
  const [choices, setChoices] = useState<Scene["choices"]>()
  const [sheet, setSheet] = useState<Scene["sheet"]>()
  const [draft, setDraft] = useState("")
  const runId = useRef(0)
  const nextId = useRef(1)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  const firstName = app.firstName?.trim() || "there"
  const fullName = [app.firstName, app.lastName].filter(Boolean).join(" ") || firstName
  const campus = course.campuses.find((c) => c.id === app.campusId)?.name ?? course.campuses[0].name

  const script = useMemo(() => {
    if (!rep) return {}
    return buildScript({
      firstName,
      brand,
      course,
      rep,
      campus,
      holdUntil: app.holdUntil ? formatDayMonth(app.holdUntil) : `${course.holdDays} days from now`,
      webviewHref: `/apply/welcome-back?brand=${brand.id}&via=whatsapp`,
      doneHref: `/apply/welcome-back?brand=${brand.id}&via=whatsapp&to=done`,
      remaining: modules
        .filter((m) => !chatModules.includes(m) && !isComplete(app, m))
        .map((m) => moduleMeta[m].title),
    })
    // Built once per brand: the chat only ever completes its own modules, so the leftovers never change mid-thread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, brand, course, rep, campus, app.holdUntil])

  const chatModuleList = useMemo(() => chatModules.filter((m) => modules.includes(m)), [modules])

  const push = useCallback((message: Message) => {
    setLog((prev) => {
      const last = prev[prev.length - 1]?.message
      const sameSender = !!last && "from" in last && "from" in message && last.from === message.from
      return [
        ...prev,
        {
          id: nextId.current++,
          time: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date()),
          message,
          showSender: !sameSender,
        },
      ]
    })
  }, [])

  const appRef = useRef(app)
  appRef.current = app

  const resolve = useCallback(
    (next: string) => {
      if (next !== "resume") return next
      const pending = chatModuleList.find((m) => !isComplete(appRef.current, m))
      return pending ?? "done"
    },
    [chatModuleList],
  )

  const play = useCallback(
    async (sceneId: string) => {
      const scene = script[resolve(sceneId)]
      if (!scene) return
      const id = ++runId.current
      const alive = () => runId.current === id
      setChoices(undefined)
      setSheet(undefined)
      onBeat?.(scene.beat)

      if (scene.complete) {
        dispatch({ type: "SET_MODULE_STATUS", module: scene.complete.module, status: scene.complete.status })
        if (scene.complete.data) dispatch({ type: "SET_MODULE_DATA", module: scene.complete.module, data: scene.complete.data })
        if (scene.complete.data?.funding) {
          dispatch({ type: "SET_FIELDS", fields: { funding: scene.complete.data.funding as "loan" | "self" | "other" } })
        }
      }
      if (scene.remind) dispatch({ type: "SET_FIELDS", fields: { remindLabel: scene.remind, remindChannel: "whatsapp" } })

      for (const m of scene.messages) {
        if (!alive()) return
        if (m.kind === "text" && m.from !== "me") {
          setTyping(m.from)
          await sleep(readTime(m.text))
          if (!alive()) return
          setTyping(null)
        } else {
          await sleep(m.kind === "system" ? 700 : 500)
          if (!alive()) return
        }
        push(m)
      }

      if (!alive()) return
      if (scene.sheet) {
        await sleep(600)
        if (alive()) setSheet(scene.sheet)
      } else if (scene.auto) {
        await sleep(900)
        if (alive()) void play(scene.auto)
      } else {
        setChoices(scene.choices)
      }
    },
    [script, resolve, dispatch, push, onBeat],
  )

  useEffect(() => {
    if (started.current || !rep) return
    started.current = true
    void play("intro")
  }, [play, rep])

  useEffect(() => {
    const scroller = scrollerRef.current
    const content = contentRef.current
    if (!scroller || !content) return
    const toBottom = () => scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" })
    const ro = new ResizeObserver(toBottom)
    ro.observe(content)
    return () => ro.disconnect()
  }, [])

  function say(text: string, next: string) {
    push({ kind: "text", from: "me", text })
    void play(next)
  }

  function send() {
    const text = draft.trim()
    if (!text) return
    setDraft("")
    say(text, routeFreeText(text))
  }

  function dismissSheet() {
    const kind = sheet
    setSheet(undefined)
    if (kind === "upload") {
      setChoices([
        { label: "Send my CV now", next: "credit-upload" },
        { label: "Skip this step", next: "credit-skip" },
      ])
    } else if (kind === "sign") {
      setChoices([{ label: "Open the agreement again", next: "sign" }])
    }
  }

  function onUpload(a: Attachment) {
    setSheet(undefined)
    push({ kind: "attachment", from: "me", ...a })
    void play("credit-read")
  }

  function onSigned(image?: string) {
    setSheet(undefined)
    push({ kind: "signed", from: "me", name: fullName, image })
    void play("signed")
  }

  if (!rep) return null

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-wa-bg">
      <header className="flex items-center gap-2 bg-wa-header px-2 py-2 text-wa-header-foreground">
        <ArrowLeft className="size-5" aria-hidden />
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-background">
          <Image src={brand.logo} alt="" fill sizes="36px" className="object-contain p-1.5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[15px] font-semibold">{brand.shortName} · Your enrolment</span>
          <span className="truncate text-xs opacity-80">
            {brand.shortName} Assistant, {rep.name}, You
          </span>
        </div>
        <Video className="size-5 opacity-90" aria-hidden />
        <Phone className="ml-2 size-5 opacity-90" aria-hidden />
      </header>

      <div ref={scrollerRef} className="wa-wallpaper flex-1 overflow-y-auto px-3 py-3" aria-live="polite">
        <div ref={contentRef} className="flex flex-col gap-1.5">
          <span className="mb-1 self-center rounded-lg bg-wa-in/80 px-3 py-1 text-xs text-foreground/60 shadow-sm">Today</span>
          <span className="mb-2 self-center rounded-lg bg-warning-soft px-3 py-1.5 text-center text-xs text-foreground/70 shadow-sm">
            This business uses a secure service from Meta to manage this chat. Messages may be handled by an assistant.
          </span>
          {log.map((item) => (
            <Bubble key={item.id} item={item} brand={brand} rep={rep} modules={modules} statuses={app.modules} />
          ))}
          {typing && (
            <div className="flex items-end gap-1.5 self-start">
              {typing === "rep" ? (
                <Image src={rep.photo} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
              ) : (
                <span className="w-7" aria-hidden />
              )}
              <span className="flex items-center gap-1 rounded-lg rounded-tl-none bg-wa-in px-3 py-2.5 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </span>
            </div>
          )}
          {choices && (
            <div className="mt-1 flex flex-col gap-1.5 self-stretch pl-8 animate-fade-up">
              {choices.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => say(c.label, c.next)}
                  className="rounded-lg bg-wa-in py-2.5 text-center text-[15px] font-medium text-wa-link shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] hover:bg-background"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form
        className="flex items-center gap-2 bg-wa-bar px-2 py-2"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <div className="flex flex-1 items-center gap-2 rounded-full bg-wa-in px-3 py-2">
          <button type="button" aria-label="Attach" onClick={() => setSheet("upload")} className="text-foreground/50">
            <Paperclip className="size-5" aria-hidden />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Message"
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-foreground/40"
          />
        </div>
        <button
          type="submit"
          aria-label={draft.trim() ? "Send" : "Record voice message"}
          className={cn("flex size-11 items-center justify-center rounded-full bg-wa-accent text-wa-header-foreground transition-transform", draft.trim() && "scale-100")}
        >
          {draft.trim() ? <SendHorizontal className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
        </button>
      </form>

        {sheet === "upload" && <UploadSheet onPick={onUpload} onClose={dismissSheet} />}
        {sheet === "sign" && <SignSheet name={fullName} onSigned={onSigned} onClose={dismissSheet} />}
    </div>
  )
}
