"use client"

import { MapPin } from "lucide-react"
import { useState } from "react"
import { PrimaryButton, TextLink } from "@/components/apply/primitives"
import { TextField } from "@/components/apply/text-field"
import { useApplication } from "@/lib/application/context"
import type { ModuleProps } from "./types"

const suggestions: Record<"NZ" | "AU", { line1: string; suburb: string }[]> = {
  NZ: [
    { line1: "12 Kohimarama Road", suburb: "Kohimarama, Auckland 1071" },
    { line1: "12A Karangahape Road", suburb: "Auckland Central, Auckland 1010" },
    { line1: "120 Great South Road", suburb: "Manukau, Auckland 2104" },
    { line1: "12 Victoria Street", suburb: "Hamilton Central, Hamilton 3204" },
    { line1: "1/12 Titahi Bay Road", suburb: "Porirua 5022" },
  ],
  AU: [
    { line1: "12 Boundary Street", suburb: "West End QLD 4101" },
    { line1: "12 Bourke Street", suburb: "Melbourne VIC 3000" },
    { line1: "120 Pitt Street", suburb: "Sydney NSW 2000" },
    { line1: "12 Hindley Street", suburb: "Adelaide SA 5000" },
    { line1: "1/12 Murray Street", suburb: "Perth WA 6000" },
  ],
}

export function AddressModule({ onComplete }: ModuleProps) {
  const { brand } = useApplication()
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<{ line1: string; suburb: string }>()
  const [manual, setManual] = useState(false)
  const [line1, setLine1] = useState("")
  const [suburb, setSuburb] = useState("")

  const list = suggestions[brand.country].filter((s) =>
    `${s.line1} ${s.suburb}`.toLowerCase().includes(query.toLowerCase()),
  )

  if (manual) {
    return (
      <div className="flex flex-col gap-5">
        <TextField label="Street address" value={line1} onChange={setLine1} autoComplete="address-line1" />
        <TextField
          label={brand.country === "AU" ? "Suburb, state and postcode" : "Suburb, city and postcode"}
          value={suburb}
          onChange={setSuburb}
          autoComplete="address-level2"
        />
        <PrimaryButton disabled={!line1.trim() || !suburb.trim()} onClick={() => onComplete("done", { line1, suburb })}>
          Next
        </PrimaryButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Start typing your address"
        value={picked ? `${picked.line1}, ${picked.suburb}` : query}
        onChange={(v) => {
          setPicked(undefined)
          setQuery(v)
        }}
        placeholder="12 …"
        autoComplete="off"
        role="combobox"
        aria-expanded={!picked && query.length > 0}
      />
      {!picked && query.length > 0 && (
        <ul className="flex flex-col overflow-hidden rounded-2xl border border-border" role="listbox">
          {list.length === 0 && <li className="p-4 text-sm text-muted-foreground">No matches. Try a different spelling.</li>}
          {list.map((s) => (
            <li key={s.line1 + s.suburb}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => setPicked(s)}
                className="flex w-full items-start gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-muted"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{s.line1}</span>
                  <span className="text-xs text-muted-foreground">{s.suburb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <PrimaryButton disabled={!picked} onClick={() => picked && onComplete("done", picked)}>
        That&apos;s my address
      </PrimaryButton>
      <div className="flex justify-center">
        <TextLink onClick={() => setManual(true)}>Can&apos;t find it? Type it in</TextLink>
      </div>
    </div>
  )
}
