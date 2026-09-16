"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check, CheckCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { Eyebrow, Lede, PrimaryButton, TextLink, Title } from "@/components/apply/primitives"
import { useApplication } from "@/lib/application/context"
import { moduleMeta } from "@/lib/config/modules"
import { cn } from "@/lib/utils"

type Msg = { from: "rep" | "me"; text: string }

export default function WhatsAppPage() {
  const router = useRouter()
  const { app, brand, rep, nextModule, dispatch } = useApplication()
  const next = nextModule(undefined)
  const [shown, setShown] = useState(0)

  const script: Msg[] = [
    { from: "rep", text: `Hi ${app.firstName ?? "there"}, ${rep?.name ?? "the team"} here from ${brand.shortName}. Happy to finish your enrolment over here instead.` },
    { from: "rep", text: next ? `Next up is ${moduleMeta[next].title.toLowerCase()} — ${moduleMeta[next].description[brand.country]}` : "Looks like you've done everything already. Nice." },
    { from: "me", text: "Great, let's do it" },
    { from: "rep", text: next === "identity" ? "Just send me a photo of your passport or birth certificate whenever you've got it." : "Send me whatever you've got and I'll fill it in on my end. No rush." },
  ]

  useEffect(() => {
    if (shown >= script.length) return
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 300 : 1100)
    return () => clearTimeout(t)
  }, [shown, script.length])

  useEffect(() => {
    dispatch({ type: "SET_FIELDS", fields: { channel: "whatsapp" } })
  }, [dispatch])

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 px-5 pb-6 pt-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Switched to WhatsApp</Eyebrow>
          <Title>Same application, different window.</Title>
          <Lede>
            Everything you&apos;ve done comes with you. {rep?.name ?? "Your advisor"} can see the same steps and will
            tick them off as you send things.
          </Lede>
        </div>

        <div className="flex flex-col gap-2 rounded-3xl bg-[oklch(0.96_0.03_150)] p-4" aria-live="polite">
          <div className="mb-2 flex items-center gap-3 border-b border-foreground/10 pb-3">
            {rep && (
              <Image src={rep.photo} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {rep?.name ?? brand.shortName} · {brand.shortName}
              </span>
              <span className="text-xs text-muted-foreground">Business account</span>
            </div>
          </div>
          {script.slice(0, shown).map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm animate-fade-up",
                m.from === "rep" ? "self-start rounded-tl-sm bg-background" : "self-end rounded-tr-sm bg-[oklch(0.9_0.08_150)]",
              )}
            >
              {m.text}
              <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                now {m.from === "me" ? <CheckCheck className="size-3 text-brand" aria-hidden /> : <Check className="size-3" aria-hidden />}
              </span>
            </div>
          ))}
          {shown < script.length && (
            <span className="self-start rounded-2xl bg-background px-3 py-2 text-xs text-muted-foreground animate-pulse-soft">
              typing…
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          This is a mock of the WhatsApp handoff. In production the button below opens WhatsApp with this thread
          pre-filled, and progress syncs back to your get-ready list.
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 px-5 pb-safe pt-4 backdrop-blur sm:rounded-b-3xl">
        <PrimaryButton arrow={false} onClick={() => rep && window.open(rep.whatsapp, "_blank", "noopener")}>
          Open WhatsApp
        </PrimaryButton>
        <div className="flex justify-center">
          <TextLink onClick={() => router.push("/apply/ready")}>Stay here instead</TextLink>
        </div>
      </div>
    </div>
  )
}
