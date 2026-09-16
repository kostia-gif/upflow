"use client"

import Link from "next/link"
import { ArrowLeft, Globe, Languages, Plane, Wallet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { NativeSelect, PrimaryButton, Eyebrow, Lede, Title } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import { isValidEmail } from "@/lib/format"

const countries = ["India", "China", "Philippines", "Nepal", "Vietnam", "Brazil", "Colombia", "Sri Lanka", "Other"]

export default function InternationalPage() {
  const { app, brand, course } = useApplication()
  const [country, setCountry] = useState("")
  const [email, setEmail] = useState(app.email ?? "")
  const [sent, setSent] = useState(false)

  const steps = [
    { icon: Plane, t: "Visa", d: brand.country === "AU" ? "Student visa (subclass 500). We issue the CoE you need." : "Fee-paying student visa. We issue the offer of place." },
    { icon: Languages, t: "English", d: "IELTS 6.0 or equivalent. We accept several tests and can suggest a prep route." },
    { icon: Wallet, t: "Fees", d: `International fees differ from the ${course.fee} shown for domestic students.` },
  ]

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col gap-6 bg-background px-5 pb-10 pt-4 sm:my-6 sm:min-h-0 sm:rounded-3xl sm:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.25)]">
      <Link href="/apply/am-i-in" className="flex size-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Back">
        <ArrowLeft className="size-5" aria-hidden />
      </Link>
      <div className="flex flex-col gap-3">
        <Eyebrow>International students</Eyebrow>
        <Title>Studying {course.shortTitle} from overseas.</Title>
        <Lede>
          A few extra steps, handled by people who do this every day. Tell us where you are and we&apos;ll send the
          right pack.
        </Lede>
      </div>

      <ul className="flex flex-col gap-3">
        {steps.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex items-start gap-3 rounded-2xl border border-border p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{t}</span>
              <span className="text-sm leading-snug text-muted-foreground">{d}</span>
            </span>
          </li>
        ))}
      </ul>

      {sent ? (
        <div className="flex items-start gap-3 rounded-2xl bg-success-soft p-4 text-sm leading-relaxed">
          <Globe className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <p>
            Pack on its way to <strong>{email}</strong>. An international advisor will follow up within two working days.
          </p>
        </div>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
            toast.success("International pack sent")
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="text-sm font-medium">
              Where are you applying from?
            </label>
            <NativeSelect id="country" value={country} onChange={(e) => setCountry(e.target.value)} required>
              <option value="">Choose a country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </NativeSelect>
          </div>
          <TextField label="Email" value={email} onChange={setEmail} type="email" inputMode="email" autoComplete="email" validate={(v) => (isValidEmail(v) ? null : "Check the email address")} />
          <PrimaryButton type="submit" disabled={!country || !isValidEmail(email)}>
            Send me the international pack
          </PrimaryButton>
        </form>
      )}
    </main>
  )
}
