import type { Country, CourseConfig, ModuleId } from "@/lib/types"

export type ModuleMeta = {
  id: ModuleId
  title: string
  description: Record<Country, string>
  minutes: number
  timeLabel: string
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
    title: "Money",
    description: { NZ: "Your StudyLink steps.", AU: "FEE-HELP and your USI." },
    minutes: 1,
    timeLabel: "1 min",
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

export function minutesLabel(minutes: number) {
  if (minutes <= 0) return "Done"
  if (minutes < 1) return "About 30 seconds left"
  const rounded = Math.ceil(minutes)
  return `About ${rounded} min left`
}
