"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Tick } from "./primitives"

export function CodeEntry({
  mobile,
  onVerified,
  onChangeNumber,
}: {
  mobile: string
  onVerified: () => void
  onChangeNumber?: () => void
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [verified, setVerified] = useState(false)
  const [seconds, setSeconds] = useState(20)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (verified) {
      const t = setTimeout(onVerified, 600)
      return () => clearTimeout(t)
    }
  }, [verified, onVerified])

  function commit(next: string[]) {
    setDigits(next)
    if (next.every((d) => d !== "")) setVerified(true)
  }

  function handleChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, "")
    if (!v) {
      const next = [...digits]
      next[i] = ""
      setDigits(next)
      return
    }
    if (v.length > 1) {
      const next = [...digits]
      v.split("").slice(0, 6 - i).forEach((c, k) => (next[i + k] = c))
      commit(next)
      refs.current[Math.min(i + v.length, 5)]?.focus()
      return
    }
    const next = [...digits]
    next[i] = v
    commit(next)
    if (i < 5) refs.current[i + 1]?.focus()
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-base font-medium">Enter the 6-digit code we sent to {mobile}</p>
        {onChangeNumber && (
          <button
            type="button"
            onClick={onChangeNumber}
            className="mt-1 min-h-8 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Wrong number? Change it
          </button>
        )}
      </div>
      <div className="flex items-center gap-2" role="group" aria-label="Verification code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            pattern="[0-9]*"
            maxLength={6}
            value={d}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={verified}
            className={cn(
              "h-16 w-full min-w-0 flex-1 rounded-xl border-2 bg-background text-center font-heading text-2xl font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-3",
              verified
                ? "border-success/60 text-success"
                : d
                  ? "border-brand/50 focus-visible:border-brand focus-visible:ring-brand/20"
                  : "border-input focus-visible:border-brand focus-visible:ring-brand/20",
            )}
          />
        ))}
      </div>
      <div className="flex min-h-8 items-center justify-between">
        {verified ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
            <Tick /> Verified
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Any 6 digits work in this prototype.</span>
        )}
        {!verified &&
          (seconds > 0 ? (
            <span className="text-sm text-muted-foreground tabular-nums">Resend in {seconds}s</span>
          ) : (
            <button
              type="button"
              onClick={() => setSeconds(20)}
              className="text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Resend code
            </button>
          ))}
      </div>
    </div>
  )
}
