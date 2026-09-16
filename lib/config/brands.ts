import type { BrandConfig, BrandId } from "@/lib/types"

const SITE = "https://up-webexperience.vercel.app"

export const brands: Record<BrandId, BrandConfig> = {
  aipc: {
    id: "aipc",
    country: "AU",
    name: "Australian Institute of Professional Counsellors",
    shortName: "AIPC",
    logo: "/brands/aipc.svg",
    primary: "#2D388E",
    primaryForeground: "#FFFFFF",
    accent: "#F79321",
    soft: "#EAE9F4",
    headingFont: "outfit",
    greeting: "Hi",
    supportPhone: "1300 139 239",
    tutorVideoPoster: "/images/aipc-poster.png",
    tutorVideoCaption: "Dr Lee, Program Director — why we teach counselling this way",
    defaultAdvisor: "priya",
    coursePageUrl: `${SITE}/courses/counselling/master-of-counselling`,
  },
  nzma: {
    id: "nzma",
    country: "NZ",
    name: "New Zealand Management Academies",
    shortName: "NZMA",
    logo: "/brands/nzma.svg",
    primary: "#0407F2",
    primaryForeground: "#FFFFFF",
    accent: "#EA496A",
    soft: "#EEF0FF",
    headingFont: "barlow",
    greeting: "Kia ora",
    supportPhone: "0800 222 833",
    tutorVideoPoster: "/images/nzma-poster.png",
    tutorVideoCaption: "Chef Renee, Sylvia Park — 20 seconds on week one",
    defaultAdvisor: "matt",
    coursePageUrl: `${SITE}/courses/cookery/certificate-in-cookery-level-4`,
  },
  elite: {
    id: "elite",
    country: "NZ",
    name: "Elite School of Beauty and Spa",
    shortName: "Elite",
    logo: "/brands/elite.svg",
    primary: "#161616",
    primaryForeground: "#FFFFFF",
    accent: "#CBB073",
    soft: "#F5F1E8",
    headingFont: "cormorant",
    greeting: "Kia ora",
    supportPhone: "0800 354 834",
    tutorVideoPoster: "/images/elite-poster.png",
    tutorVideoCaption: "Jess, Head Tutor — what your first treatment day feels like",
    defaultAdvisor: "aroha",
    coursePageUrl: `${SITE}/courses/beauty/certificate-in-beauty-therapy-level-4`,
  },
  yoobee: {
    id: "yoobee",
    country: "NZ",
    name: "Yoobee College of Creative Innovation",
    shortName: "Yoobee",
    logo: "/brands/yoobee.svg",
    primary: "#141414",
    primaryForeground: "#FFFFFF",
    accent: "#BD89FF",
    soft: "#F1E9FF",
    headingFont: "syne",
    greeting: "Kia ora",
    supportPhone: "0800 966 233",
    tutorVideoPoster: "/images/yoobee-poster.png",
    tutorVideoCaption: "Sam, Creative Lead — the first thing you will make",
    defaultAdvisor: "tane",
    coursePageUrl: `${SITE}/courses/design/creative-media-certificate`,
  },
}

export const brandOrder: BrandId[] = ["aipc", "nzma", "elite", "yoobee"]

export function getBrand(id: BrandId): BrandConfig {
  return brands[id]
}
