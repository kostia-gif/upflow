import type { BrandId } from "@/lib/types"

export type FacultyLead = {
  name: string
  role: string
  photo: string
  quote: string
}

/**
 * The person who introduces the course on the first application screen.
 * Same figures credited elsewhere in the brand (e.g. the orientation video),
 * so the voice is consistent across the prototype.
 */
export const facultyLeads: Record<BrandId, FacultyLead> = {
  aipc: {
    name: "Dr Lee",
    role: "Program Director, Counselling",
    photo: "/faculty/aipc.png",
    quote: "One good conversation can change someone's week — I can't wait to see you become the person who has them.",
  },
  nzma: {
    name: "Chef Renee",
    role: "Head Chef Tutor",
    photo: "/faculty/nzma.png",
    quote:
      "I've trained hundreds of cooks who walked in nervous and walked out with a trade. Let's get you one step closer to your own kitchen.",
  },
  elite: {
    name: "Jess",
    role: "Head Tutor, Beauty Therapy",
    photo: "/faculty/elite.png",
    quote: "Every therapist on our team started exactly where you are now. I'll see you in the salon soon.",
  },
  yoobee: {
    name: "Sam",
    role: "Creative Lead",
    photo: "/faculty/yoobee.png",
    quote: "Every great folio starts with a single brief. Let's get yours started.",
  },
}

export function getFacultyLead(brand: BrandId): FacultyLead {
  return facultyLeads[brand]
}
