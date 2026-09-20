"use client"

import Image from "next/image"
import { ArrowLeft, ArrowUp, Camera, ChevronLeft, Mic, Paperclip, Phone, SendHorizontal, Video } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Bubble, type Rendered } from "@/components/whatsapp/bubbles"
import { SignSheet, UploadSheet, type Attachment } from "@/components/whatsapp/sheets"
import { SmsBubble } from "@/components/whatsapp/sms-bubble"
import { useApplication } from "@/lib/application/context"
import { isComplete } from "@/lib/application/reducer"
import { moduleMeta } from "@/lib/config/modules"
import { formatDayMonth } from "@/lib/format"
import type { ModuleId } from "@/lib/types"
import { buildScript, chatModules, routeFreeText, type Channel, type Choice, type Message, type Scene } from "@/lib/whatsapp/script"
import { cn } from "@/lib/utils"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function readTime(text: string) {
  return Math.min(1600, 500 + text.length * 9)
}

function numberedReplies(choices: Choice[]) {
  return `Reply with a number:\n${choices.map((c, i) => `${i + 1} — ${c.label}`).join("\n")}`
}

export function WhatsAppChat({ channel = "whatsapp", onBeat }: { channel?: Channel; onBeat?: (beat: number) => void }) {
  const sms = channel === "sms"
  const { app, brand, course, rep, modules, dispatch } = useApplication()
  const [log, setLog] = useState<Rendered[]>([])
  const [typing, setTyping] = useState<"assistant" | "rep" | null>(null)
  const [choices, setChoices] = useState<Scene["choices"]>()
  const [sheet, setSheet] = useState<Scene["sheet"]>()
  const [draft, setDraft] = useState("")
  const runId = useRef(0)
  const nextId = useRef(1)
  const captureNext = useRef<string | undefined>(undefined)
  const deferred = useRef(new Set<ModuleId>())
  const scrollerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  const firstName = app.firstName?.trim() || "there"
  const fullName = [app.firstName, app.lastName].filter(Boolean).join(" ") || firstName
  const campus = course.campuses.find((c) => c.id === app.campusId)?.name ?? course.campuses[0].name
  const signHref = `/apply/welcome-back?brand=${brand.id}&via=${channel}&to=sign`

  const script = useMemo(() => {
    if (!rep) return {}
    return buildScript({
      firstName,
      brand,
      course,
      rep,
      campus,
      holdUntil: app.holdUntil ? formatDayMonth(app.holdUntil) : `${course.holdDays} days from now`,
      webviewHref: `/apply/welcome-back?brand=${brand.id}&via=${channel}`,
      doneHref: `/apply/welcome-back?brand=${brand.id}&via=${channel}&to=done`,
      remaining: modules
        .filter((m) => !chatModules.includes(m) && !isComplete(app, m))
        .map((m) => moduleMeta[m].title),
    })
    // Built once per brand: the chat only ever completes its own modules, so the leftovers never change mid-thread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, brand, course, rep, campus, app.holdUntil, channel])

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
      const pending = chatModuleList.find((m) => !isComplete(appRef.current, m) && !deferred.current.has(m))
      return pending ?? "done"
    },
    [chatModuleList],
  )

  const offer = useCallback(
    (list: Choice[] | undefined) => {
      if (sms && list?.length) push({ kind: "text", from: "assistant", text: numberedReplies(list) })
      setChoices(list)
    },
    [sms, push],
  )

  const play = useCallback(
    async (sceneId: string) => {
      const scene = script[resolve(sceneId)]
      if (!scene) return
      const id = ++runId.current
      const alive = () => runId.current === id
      setChoices(undefined)
      setSheet(undefined)
      captureNext.current = undefined
      onBeat?.(scene.beat)

      if (scene.complete) {
        dispatch({ type: "SET_MODULE_STATUS", module: scene.complete.module, status: scene.complete.status })
        if (scene.complete.data) dispatch({ type: "SET_MODULE_DATA", module: scene.complete.module, data: scene.complete.data })
        if (scene.complete.data?.funding) {
          dispatch({ type: "SET_FIELDS", fields: { funding: scene.complete.data.funding as "loan" | "self" | "other" } })
        }
      }
      if (scene.defer) deferred.current.add(scene.defer)
      if (scene.remind) dispatch({ type: "SET_FIELDS", fields: { remindLabel: scene.remind, remindChannel: channel } })

      for (const m of scene.messages) {
        if (!alive()) return
        if (m.kind === "text" && m.from !== "me") {
          if (!sms) setTyping(m.from)
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
      if (scene.sheet === "sign" && sms) {
        // SMS cannot carry a signature pad: hand the student a link and let them tell us when it's done.
        await sleep(600)
        if (!alive()) return
        push({ kind: "link", title: "Sign in your browser", body: "About a minute, already signed in — no code to type.", href: signHref, cta: "Open" })
        offer([{ label: "Done, I've signed it", next: "signed" }])
      } else if (scene.sheet) {
        await sleep(600)
        if (alive()) setSheet(scene.sheet)
      } else if (scene.auto) {
        await sleep(900)
        if (alive()) void play(scene.auto)
      } else {
        captureNext.current = scene.capture
        offer(scene.choices)
      }
    },
    [script, resolve, dispatch, push, onBeat, sms, channel, signHref, offer],
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

  function pick(c: Choice, index: number) {
    say(sms ? String(index + 1) : c.label, c.next)
  }

  function send() {
    const text = draft.trim()
    if (!text) return
    setDraft("")
    const numbered = choices && /^\d$/.test(text) ? choices[Number(text) - 1] : undefined
    if (numbered) {
      say(text, numbered.next)
      return
    }
    // Mid-question scenes capture whatever the student writes as their answer instead of routing by keyword.
    if (captureNext.current) {
      const next = captureNext.current
      captureNext.current = undefined
      say(text, next)
      return
    }
    say(text, routeFreeText(text))
  }

  function dismissSheet() {
    const kind = sheet
    setSheet(undefined)
    if (kind === "upload") {
      offer([
        { label: "Do it now", next: "credit-upload" },
        { label: "I'll send it later", next: "credit-later" },
      ])
    } else if (kind === "transcript") {
      offer([
        { label: "Do it now", next: "school-record-upload" },
        { label: "I'll send it later", next: "school-record-later" },
      ])
    } else if (kind === "sign") {
      offer([{ label: "Open the agreement again", next: "sign" }])
    }
  }

  function onUpload(a: Attachment) {
    const kind = sheet
    setSheet(undefined)
    push({ kind: "attachment", from: "me", ...a })
    void play(kind === "transcript" ? "school-record-read" : "credit-read")
  }

  function onSigned(image?: string) {
    setSheet(undefined)
    push({ kind: "signed", from: "me", name: fullName, image })
    void play("signed")
  }

  if (!rep) return null

  const shortcode = brand.country === "AU" ? "0480 012 345" : "4040"

  return (
    <div className={cn("relative flex h-full flex-col overflow-hidden", sms ? "bg-sms-bg" : "bg-wa-bg")}>
      {sms ? (
        <header className="flex items-center gap-1 border-b border-border/60 bg-sms-header px-2 pb-2 pt-3">
          <ChevronLeft className="size-6 text-wa-link" aria-hidden />
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="relative size-11 overflow-hidden rounded-full bg-background shadow-sm">
              <Image src={brand.logo} alt="" fill sizes="44px" className="object-contain p-2" />
            </div>
            <span className="text-xs font-medium leading-none">{brand.shortName}</span>
            <span className="text-[10px] leading-none text-foreground/50">{shortcode}</span>
          </div>
          <span className="w-6" aria-hidden />
        </header>
      ) : (
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
      )}

      <div ref={scrollerRef} className={cn("flex-1 overflow-y-auto px-3 py-3", !sms && "wa-wallpaper")} aria-live="polite">
        <div ref={contentRef} className="flex flex-col gap-1.5">
          {sms ? (
            <span className="mb-2 self-center text-[11px] font-medium text-foreground/50">Text Message · Today</span>
          ) : (
            <>
              <span className="mb-1 self-center rounded-lg bg-wa-in/80 px-3 py-1 text-xs text-foreground/60 shadow-sm">Today</span>
              <span className="mb-2 self-center rounded-lg bg-warning-soft px-3 py-1.5 text-center text-xs text-foreground/70 shadow-sm">
                This business uses a secure service from Meta to manage this chat. Messages may be handled by an assistant.
              </span>
            </>
          )}
          {log.map((item) =>
            sms ? (
              <SmsBubble key={item.id} item={item} brand={brand} rep={rep} modules={modules} statuses={app.modules} />
            ) : (
              <Bubble key={item.id} item={item} brand={brand} rep={rep} modules={modules} statuses={app.modules} />
            ),
          )}
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
          {choices &&
            (sms ? (
              <div className="mt-1 flex justify-end gap-2 animate-fade-up" aria-label="Quick replies">
                {choices.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => pick(c, i)}
                    aria-label={`Reply ${i + 1}: ${c.label}`}
                    className="flex size-11 items-center justify-center rounded-full border border-sms-out text-lg font-semibold text-sms-out hover:bg-sms-out hover:text-sms-out-foreground"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-1 flex flex-col gap-1.5 self-stretch pl-8 animate-fade-up">
                {choices.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => pick(c, i)}
                    className="rounded-lg bg-wa-in py-2.5 text-center text-[15px] font-medium text-wa-link shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] hover:bg-background"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            ))}
        </div>
      </div>

      <form
        className={cn("flex items-center gap-2 px-2 py-2", sms ? "bg-sms-bar" : "bg-wa-bar")}
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        {sms && (
          <button type="button" aria-label="Camera" onClick={() => setSheet(sheet ?? "transcript")} className="px-1 text-foreground/50">
            <Camera className="size-6" aria-hidden />
          </button>
        )}
        <div className={cn("flex flex-1 items-center gap-2 rounded-full px-3 py-2", sms ? "border border-border bg-background py-1.5" : "bg-wa-in")}>
          {!sms && (
            <button type="button" aria-label="Attach" onClick={() => setSheet("upload")} className="text-foreground/50">
              <Paperclip className="size-5" aria-hidden />
            </button>
          )}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={sms ? "Text Message · SMS" : "Message"}
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-foreground/40"
          />
          {sms && (
            <button
              type="submit"
              aria-label="Send"
              disabled={!draft.trim()}
              className={cn("flex size-7 items-center justify-center rounded-full text-sms-out-foreground", draft.trim() ? "bg-sms-out" : "bg-foreground/20")}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>
        {!sms && (
          <button
            type="submit"
            aria-label={draft.trim() ? "Send" : "Record voice message"}
            className="flex size-11 items-center justify-center rounded-full bg-wa-accent text-wa-header-foreground"
          >
            {draft.trim() ? <SendHorizontal className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
          </button>
        )}
      </form>

      {sheet === "upload" && <UploadSheet purpose="cv" onPick={onUpload} onClose={dismissSheet} />}
      {sheet === "transcript" && <UploadSheet purpose="transcript" onPick={onUpload} onClose={dismissSheet} />}
      {sheet === "sign" && <SignSheet name={fullName} onSigned={onSigned} onClose={dismissSheet} />}
    </div>
  )
}
