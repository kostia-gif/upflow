import { CheckCircle2 } from "lucide-react"

/** The payoff, up front: what finishing this application leads to. */
export function OutcomeCallout({ outcomes }: { outcomes: string[] }) {
  return (
    <section aria-labelledby="outcome-heading" className="flex flex-col gap-3 rounded-2xl bg-brand-soft p-4">
      <h2 id="outcome-heading" className="text-sm font-semibold text-brand">
        What you&apos;ll walk away with
      </h2>
      <ul className="flex flex-col gap-2">
        {outcomes.map((o) => (
          <li key={o} className="flex items-start gap-2.5 text-sm leading-snug">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>{o}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
