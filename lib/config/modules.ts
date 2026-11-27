import { getBrand } from "@/lib/config/brands"
import type { Country, CourseConfig, FlowId, ModuleId } from "@/lib/types"

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
    title: "Confirm your details",
    description: {
      NZ: "Just check your name and date of birth — no documents needed.",
      AU: "Just check your name and date of birth — no documents needed.",
    },
    minutes: 0.5,
    timeLabel: "30 sec",
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
    title: "Your academic transcript",
    description: {
      NZ: "Upload your NCEA record — we read the results for you.",
      AU: "Upload your transcript — we read the results for you.",
    },
    minutes: 1,
    timeLabel: "1 min",
    needs: {
      NZ: "Your NCEA record or transcript — a photo is fine",
      AU: "Your academic transcript — a photo is fine",
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
      NZ: "Your place is saved — here's how people usually pay. Nothing to decide or pay today.",
      AU: "Your place is saved — here's how people usually pay. Nothing to decide or pay today.",
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
      NZ: "Three quick questions — a sentence each, no essay.",
      AU: "Three quick questions — a sentence each, no essay.",
    },
    minutes: 3,
    timeLabel: "3 min",
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
  usi: {
    id: "usi",
    title: "Your USI",
    description: {
      NZ: "Your Unique Student Identifier. Everyone studying in Australia needs one, and you keep it for life.",
      AU: "Your Unique Student Identifier. Everyone studying in Australia needs one, and you keep it for life.",
    },
    minutes: 1,
    timeLabel: "1 min",
    needs: {
      NZ: "Your USI if you have it, or one form of ID so we can set one up",
      AU: "Your USI if you have it, or one form of ID so we can set one up",
    },
  },
  "support-needs": {
    id: "support-needs",
    title: "Support you might need",
    description: {
      NZ: "Anything that would make studying easier for you.",
      AU: "Anything that would make studying easier for you.",
    },
    minutes: 1,
    timeLabel: "1 min",
  },
  "au-stats": {
    id: "au-stats",
    title: "Government questions",
    description: {
      NZ: "Three short sets of questions we're required to ask.",
      AU: "Three short sets of questions we're required to ask.",
    },
    minutes: 2,
    timeLabel: "2 min",
  },
  degree: {
    id: "degree",
    title: "Your degree",
    description: {
      NZ: "The degree you're using to get in.",
      AU: "The degree you're using to get in.",
    },
    minutes: 1,
    timeLabel: "1 min",
    needs: {
      NZ: "Your degree certificate or transcript — a photo is fine",
      AU: "Your degree certificate or transcript — a photo is fine",
    },
  },
  "work-history": {
    id: "work-history",
    title: "Your work history",
    description: {
      NZ: "Where you've worked and what you did there.",
      AU: "Where you've worked and what you did there.",
    },
    minutes: 1,
    timeLabel: "1 min",
    needs: {
      NZ: "A CV, if you have one",
      AU: "A CV, if you have one",
    },
  },
  "entry-statement": {
    id: "entry-statement",
    title: "Three quick questions",
    description: {
      NZ: "A few sentences each. No essay.",
      AU: "A few sentences each. No essay.",
    },
    minutes: 4,
    timeLabel: "4 min",
  },
  pay: {
    id: "pay",
    title: "Pay and enrol",
    description: {
      NZ: "Check your order and pay. Last step.",
      AU: "Check your order and pay. Last step.",
    },
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

const flowModules: Record<Exclude<FlowId, "nz-baseline">, ModuleId[]> = {
  "online-enrol-pay": ["identity", "address", "usi", "support-needs", "au-stats", "pay"],
  "online-apply-assess": [
    "identity",
    "address",
    "degree",
    "work-history",
    "entry-statement",
    "usi",
    "support-needs",
    "au-stats",
    "money",
    "sign",
  ],
}

export function modulesForFlow(course: CourseConfig): ModuleId[] {
  if (course.flow === "nz-baseline") return modulesFor(course, getBrand(course.brand).country)
  return [...flowModules[course.flow]]
}

/** Documents the applicant may want on hand for this course, in flow order. */
export function needsFor(course: CourseConfig, country: Country): string[] {
  return modulesForFlow(course)
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
