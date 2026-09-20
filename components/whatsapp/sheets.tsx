"use client"

import { Camera, FileText, Images, PenLine, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

function SheetFrame({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-foreground/40 animate-in fade-in" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
      <div className="flex flex-col gap-4 rounded-t-2xl bg-background p-4 pb-safe animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{title}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-full hover:bg-muted">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export type Attachment = { name: string; meta: string; image?: boolean; preview?: string }

export type UploadPurpose = "cv" | "transcript"

type UploadOption = { icon: typeof Camera; label: string; hint: string; result: Attachment }

const uploadOptions: Record<UploadPurpose, { title: string; options: UploadOption[] }> = {
  cv: {
    title: "Send your CV or evidence",
    options: [
      { icon: Camera, label: "Camera", hint: "Take a photo of a printed CV or certificate", result: { name: "IMG_2041.jpg", meta: "Photo · 2.1 MB", image: true } },
      { icon: Images, label: "Photos", hint: "Choose from your camera roll", result: { name: "IMG_1987.jpg", meta: "Photo · 1.8 MB", image: true } },
      { icon: FileText, label: "Document", hint: "PDF or Word from your files or Drive", result: { name: "Sarah_Bilkey_CV.pdf", meta: "PDF · 184 KB" } },
    ],
  },
  transcript: {
    title: "Send your academic transcript",
    options: [
      {
        icon: Camera,
        label: "Camera",
        hint: "Photograph the whole transcript page",
        result: { name: "IMG_2044.jpg", meta: "Photo · 2.4 MB", image: true, preview: "/images/whatsapp/transcript-photo.png" },
      },
      {
        icon: Images,
        label: "Photos",
        hint: "Pick a scan from your camera roll",
        result: { name: "IMG_1120.jpg", meta: "Photo · 2.2 MB", image: true, preview: "/images/whatsapp/transcript-photo.png" },
      },
      { icon: FileText, label: "Document", hint: "A PDF from your files or Drive", result: { name: "Transcript.pdf", meta: "PDF · 512 KB" } },
    ],
  },
}

export function UploadSheet({ purpose = "cv", onPick, onClose }: { purpose?: UploadPurpose; onPick: (a: Attachment) => void; onClose: () => void }) {
  const { title, options } = uploadOptions[purpose]
  return (
    <SheetFrame title={title} onClose={onClose}>
      <ul className="grid grid-cols-3 gap-3">
        {options.map(({ icon: Icon, label, hint, result }) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => onPick(result)}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border border-border p-3 text-center hover:border-foreground/30"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-muted-foreground">Mocked for the prototype — any option sends a sample file.</p>
    </SheetFrame>
  )
}

export function SignSheet({ name, onSigned, onClose }: { name: string; onSigned: (image?: string) => void; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasInk, setHasInk] = useState(false)
  const [typed, setTyped] = useState(false)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * ratio
    c.height = rect.height * ratio
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#161616"
  }, [typed])

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    drawing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasInk(true)
  }
  function end() {
    drawing.current = false
  }
  function clear() {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    setHasInk(false)
  }

  return (
    <SheetFrame title="Sign your enrolment agreement" onClose={onClose}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        By signing you agree to the enrolment terms and confirm what you&apos;ve told us is true. It&apos;s stored with
        your application and emailed to you.
      </p>
      {typed ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
          <span className="font-heading text-3xl italic">{name}</span>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="h-32 w-full touch-none rounded-2xl border border-dashed border-border bg-muted/40"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            aria-label="Signature pad"
          />
          {!hasInk && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <PenLine className="size-4" aria-hidden />
              Sign with your finger
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <button type="button" className="font-medium text-foreground underline-offset-2 hover:underline" onClick={() => { setTyped((t) => !t); clear() }}>
          {typed ? "Draw instead" : "Type my name instead"}
        </button>
        {!typed && hasInk && (
          <button type="button" className="text-muted-foreground hover:text-foreground" onClick={clear}>
            Clear
          </button>
        )}
      </div>
      <button
        type="button"
        disabled={!typed && !hasInk}
        onClick={() => onSigned(typed ? undefined : canvasRef.current?.toDataURL("image/png"))}
        className={cn(
          "flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-colors",
          typed || hasInk ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        Sign and send
      </button>
    </SheetFrame>
  )
}
