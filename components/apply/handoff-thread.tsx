"use client"

import Image from "next/image"
import { Check, CheckCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { useApplication } from "@/lib/application/context"
import { cn } from "@/lib/utils"

export function HandoffThread({ via }: { via: "whatsapp" | "sms" }) {
  const { app, brand, course, rep } = useApplication()
  const [shown, setShown] = useState(0)
  const advisor = rep?.name ?? "someone"
  const isWhatsApp = via === "whatsapp"

  const messages = [
    {
      from: "me" as const,
      text: `Hi ${brand.shortName}, I've just applied for ${course.title}. My name is ${`${app.firstName ?? ""} ${app.lastName ?? ""}`.trim() || "on my application"}.`,
    },
    {
      from: "them" as const,
      text: `Thanks for your application. ${advisor} from our team will reach out shortly. When's a good time?`,
    },
  ]

  useEffect(() => {
    if (shown >= messages.length) return
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : 1600)
    return () => clearTimeout(t)
  }, [shown, messages.length])

  return (
    <section
      aria-label={isWhatsApp ? "Your WhatsApp conversation" : "Your text conversation"}
      className={cn("flex flex-col gap-2 rounded-3xl p-4", isWhatsApp ? "bg-[oklch(0.96_0.03_150)]" : "bg-muted")}
    >
      <div className="mb-2 flex items-center gap-3 border-b border-foreground/10 pb-3">
        {rep && <Image src={rep.photo} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />}
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{brand.shortName}</span>
          <span className="text-xs text-muted-foreground">
            {isWhatsApp ? "Business account · sent from your WhatsApp" : "Text message · sent from your phone"}
          </span>
        </div>
      </div>
      <div aria-live="polite" className="flex flex-col gap-2">
        {messages.slice(0, shown).map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm animate-fade-up",
              m.from === "them"
                ? "self-start rounded-tl-sm bg-background"
                : isWhatsApp
                  ? "self-end rounded-tr-sm bg-[oklch(0.9_0.08_150)]"
                  : "self-end rounded-tr-sm bg-brand text-brand-foreground",
            )}
          >
            {m.text}
            <span
              className={cn(
                "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
                m.from === "me" && !isWhatsApp ? "text-brand-foreground/80" : "text-muted-foreground",
              )}
            >
              now{" "}
              {m.from === "me" ? <CheckCheck className="size-3" aria-hidden /> : <Check className="size-3" aria-hidden />}
            </span>
          </div>
        ))}
        {shown === 1 && (
          <span className="self-start rounded-2xl bg-background px-3 py-2 text-xs text-muted-foreground animate-pulse-soft">
            typing…
          </span>
        )}
      </div>
      <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
        Prototype: in production your first message is prefilled in {isWhatsApp ? "WhatsApp" : "your messages app"}.
        Sending it confirms your number and opts you in to updates.
      </p>
    </section>
  )
}
