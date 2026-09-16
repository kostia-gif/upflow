import type { Country, CourseConfig, ModuleId } from "@/lib/types"

export type ModuleMeta = {
  id: ModuleId
  title: string
  description: Record<Country, string>
  minutes: number
  timeLabel: string
  /** A document the applicant may need to have on hand; shown in the up-front overview. */
  needs?: Record<Country, string>
}

export const moduleMeta: Record<ModuleId, ModuleMeta> = {
  identity: {
    id: "identity",
    title: "Prove who you are",
    description: {
      NZ: "Passport, birth certificate or citizenship certificate. Take a photo, we read it.",
      AU: "Passport, birth certificate or citizenship certificate. Take a photo, we read it.",
    },
    minutes: 2,
    timeLabel: "2 min",
    needs: {
      NZ: "Photo ID — passport, birth certificate or citizenship certificate",
      AU: "Photo ID — passport, birth certificate or citizenship certificate",
    },
  },
  address: {
    id: "address",
    title: "Where you live",
    description: { NZ: "Start typing, pick your address.", AU: "Start typing, pick your address." },
    minutes: 0.5,
    timeLabel: "30 sec",
  },
  "school-record": {
    id: "school-record",
    title: "Your school record",
    description: {
      NZ: "Your NSN, or a photo of your NCEA record.",
      AU: "Your USI, and a transcript if you have one.",
    },
    minutes: 1,
    timeLabel: "1 min",
    needs: {
      NZ: "Your NSN number, or a photo of your NCEA record",
      AU: "Your USI, or a school transcript if you have one",
    },
  },
  government: {
    id: "government",
    title: "The stuff the government asks",
    description: {
      NZ: "Six questions we have to report. Never affects your application.",
      AU: "Six questions we have to report. Never affects your application.",
    },
    minutes: 1,
    timeLabel: "1 min",
  },
  money: {
    id: "money",
    title: "Paying for it",
    description: {
      NZ: "You're in and you're verified — here's how people usually pay. Nothing to decide or pay today.",
      AU: "You're in and you're verified — here's how people usually pay. Nothing to decide or pay today.",
    },
    minutes: 1.5,
    timeLabel: "2 min",
  },
  "support-person": {
    id: "support-person",
    title: "Your support person",
    description: { NZ: "Someone we can call if we need to.", AU: "Someone we can call if we need to." },
    minutes: 0.5,
    timeLabel: "30 sec",
  },
  credit: {
    id: "credit",
    title: "Credit for what you've done",
    description: {
      NZ: "Upload your CV, we read your work history.",
      AU: "Upload your CV, we read your work history.",
    },
    minutes: 1,
    timeLabel: "1 min",
    needs: {
      NZ: "A CV or other proof of work or study — only if you want credit for it",
      AU: "A CV or other proof of work or study — only if you want credit for it",
    },
  },
  statement: {
    id: "statement",
    title: "Why counselling",
    description: {
      NZ: "300 words, or a voice note — we'll write it up.",
      AU: "300 words, or a voice note — we'll write it up.",
    },
    minutes: 5,
    timeLabel: "5 min",
  },
  portfolio: {
    id: "portfolio",
    title: "Show us something you made",
    description: {
      NZ: "A link or a few images. Anything counts.",
      AU: "A link or a few images. Anything counts.",
    },
    minutes: 2,
    timeLabel: "2 min",
    needs: {
      NZ: "A link or a few images of something you've made",
      AU: "A link or a few images of something you've made",
    },
  },
  "placement-check": {
    id: "placement-check",
    title: "Placement check",
    description: {
      NZ: "A couple of yes/no questions about working with clients.",
      AU: "A couple of yes/no questions about working with clients.",
    },
    minutes: 1,
    timeLabel: "1 min",
  },
  kit: {
    id: "kit",
    title: "Your kit",
    description: {
      NZ: "Jacket and shoe size, so your kit is waiting on day one.",
      AU: "Jacket and shoe size, so your kit is waiting on day one.",
    },
    minutes: 0.5,
    timeLabel: "30 sec",
  },
  sign: {
    id: "sign",
    title: "Sign",
    description: { NZ: "Read and agree. Last step.", AU: "Read and agree. Last step." },
    minutes: 1,
    timeLabel: "1 min",
  },
}

const countryModules: Record<Country, ModuleId[]> = {
  NZ: ["identity", "address", "school-record", "government", "money", "support-person", "sign"],
  AU: ["identity", "address", "school-record", "government", "money", "support-person", "sign"],
}

export function modulesFor(course: CourseConfig, country: Country): ModuleId[] {
  const base = [...countryModules[country]]
  const extras = course.extraModules.filter((m) => !base.includes(m))
  const result: ModuleId[] = []
  for (const m of base) {
    result.push(m)
    if (m === "school-record" && extras.includes("credit")) result.push("credit")
    if (m === "money") {
      for (const e of extras) if (e !== "credit") result.push(e)
    }
  }
  return result
}

/** Documents the applicant may want on hand for this course, in flow order. */
export function needsFor(course: CourseConfig, country: Country): string[] {
  return modulesFor(course, country)
    .map((m) => moduleMeta[m].needs?.[country])
    .filter((n): n is string => !!n)
}

/** Start, You and Am I in? together take about three minutes. */
export const APPLY_MINUTES = 3

export function totalMinutesFor(course: CourseConfig, country: Country) {
  return Math.ceil(APPLY_MINUTES + modulesFor(course, country).reduce((sum, m) => sum + moduleMeta[m].minutes, 0))
}

export function minutesLabel(minutes: number) {
  if (minutes <= 0) return "Done"
  if (minutes < 1) return "About 30 seconds left"
  const rounded = Math.ceil(minutes)
  return `About ${rounded} min left`
}
