"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useApplication } from "@/lib/application/context"
import { cn } from "@/lib/utils"

const REPLY_DELAY_MS = 1400

/** The first message the provider sends after submission, on the channel the applicant agreed to. */
export function HandoffThread({ via }: { via: "whatsapp" | "sms" }) {
  const { brand, rep } = useApplication()
  const [arrived, setArrived] = useState(false)
  const advisor = rep?.name ?? "Someone"
  const isWhatsApp = via === "whatsapp"

  useEffect(() => {
    const t = setTimeout(() => setArrived(true), REPLY_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

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
            {isWhatsApp ? "Business account · WhatsApp" : "Text message"}
          </span>
        </div>
      </div>
      <div aria-live="polite" className="flex flex-col gap-2">
        {arrived ? (
          <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-background px-3 py-2 text-sm leading-relaxed shadow-sm animate-fade-up">
            Thanks for your application. {advisor} from our team will reach out shortly. When&apos;s a good time?
            <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              now <Check className="size-3" aria-hidden />
            </span>
          </div>
        ) : (
          <span className="self-start rounded-2xl bg-background px-3 py-2 text-xs text-muted-foreground animate-pulse-soft">
            typing…
          </span>
        )}
      </div>
      <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
        Prototype: in production this arrives {isWhatsApp ? "on WhatsApp" : "by text"} within minutes of submitting,
        because you agreed to updates when you started.
      </p>
    </section>
  )
}
