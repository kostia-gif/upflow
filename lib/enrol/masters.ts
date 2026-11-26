import type { Application } from "@/lib/types"

export type Pathway = NonNullable<Application["pathway"]>
export type StudyMode = NonNullable<Application["studyMode"]>

export const PATHWAY_OPTIONS: { id: Pathway; title: string; description?: string }[] = [
  {
    id: "aipc-bachelor",
    title: "I have AIPC's Bachelor of Counselling",
    description: "We already hold your record. Nothing to upload.",
  },
  { id: "counselling-bachelor", title: "I have a Bachelor in counselling from somewhere else" },
  { id: "other-bachelor", title: "I have a Bachelor in another field" },
  { id: "none", title: "None of these yet" },
]

/** How each pathway reads mid-sentence: "eligible through ...". */
export const PATHWAY_NAMES: Record<Pathway, string> = {
  "aipc-bachelor": "AIPC's Bachelor of Counselling",
  "counselling-bachelor": "a Bachelor in counselling",
  "other-bachelor": "a Bachelor in another field",
  none: "No Bachelor yet",
}

export const STUDY_MODES: { value: StudyMode; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "sydney", label: "On campus in Sydney" },
]

export const NOT_DOMESTIC = "None of these"

/** Values match the citizenship list in the government questions, so the answer carries over. */
export const CITIZENSHIP_ANSWERS: { value: string; label: string }[] = [
  { value: "Australian citizen", label: "Australian citizen" },
  { value: "New Zealand citizen", label: "NZ citizen" },
  { value: "Permanent resident", label: "Permanent resident" },
  { value: NOT_DOMESTIC, label: NOT_DOMESTIC },
]

/** Key under `app.eligibility` for "Is English your first language?". */
export const ENGLISH_FIRST_LANGUAGE = "english"

/**
 * FEE-HELP is open to Australian citizens and permanent humanitarian visa holders.
 * Other permanent residents and most New Zealand citizens are not eligible.
 */
export function feeHelpOpen(citizenship: string | undefined) {
  return citizenship === "Australian citizen" || citizenship === "Permanent humanitarian visa"
}

export const DEGREE_ON_FILE = "on-file"
