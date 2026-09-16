import type { Rep } from "@/lib/types"

export const reps: Rep[] = [
  {
    id: "priya",
    name: "Priya",
    role: "Course specialist",
    brand: "aipc",
    photo: "/reps/priya.png",
    whatsapp: "#",
    phone: "#",
  },
  {
    id: "matt",
    name: "Matt",
    role: "Course advisor",
    brand: "nzma",
    photo: "/reps/matt.png",
    whatsapp: "#",
    phone: "#",
  },
  {
    id: "aroha",
    name: "Aroha",
    role: "Course advisor",
    brand: "elite",
    photo: "/reps/aroha.png",
    whatsapp: "#",
    phone: "#",
  },
  {
    id: "tane",
    name: "Tane",
    role: "Course advisor",
    brand: "yoobee",
    photo: "/reps/tane.png",
    whatsapp: "#",
    phone: "#",
  },
]

export function getRep(id: string | undefined): Rep | undefined {
  return reps.find((r) => r.id === id)
}
