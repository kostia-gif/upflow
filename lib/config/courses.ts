import type { BrandId, CourseConfig } from "@/lib/types"

export const courses: CourseConfig[] = [
  {
    id: "aipc-master-counselling",
    title: "Master of Counselling",
    shortTitle: "Master of Counselling",
    brand: "aipc",
    school: "Australian Institute of Professional Counsellors",
    campuses: [{ id: "online", name: "Online", placesLeft: 14 }],
    intakes: [
      { id: "t1-2027", label: "Trimester 1, 2027", date: "2027-03-01" },
      { id: "may-2027", label: "May intake, 2027", date: "2027-05-03" },
      { id: "t2-2027", label: "Trimester 2, 2027", date: "2027-07-05" },
      { id: "t3-2027", label: "Trimester 3, 2027", date: "2027-11-01" },
    ],
    fee: "$3,200 per unit · FEE-HELP available",
    duration: "14 units · 2 years full-time or 4 part-time",
    eligibilityQuestions: [
      {
        id: "qualification",
        label: "Your highest completed qualification",
        options: ["Bachelor degree", "Grad Cert or Diploma", "Diploma or below"],
        passing: ["Bachelor degree", "Grad Cert or Diploma"],
        soft: ["Diploma or below"],
        softNote:
          "You can still get in through the Graduate Diploma pathway. A course specialist will walk you through it after you apply.",
      },
      {
        id: "experience",
        label: "Two or more years of relevant work experience?",
        options: ["Yes", "Not yet"],
        passing: ["Yes"],
        soft: ["Not yet"],
        softNote:
          "That's fine to start with. Your placement units are how you build it, and your specialist will talk you through the timeline.",
      },
    ],
    holdDays: 7,
    applyEstimate: "5–12 minutes",
    extraModules: ["credit", "statement", "placement-check"],
    fundingOptions: [
      {
        id: "loan",
        title: "FEE-HELP",
        description: "Nothing upfront. Repay through tax when you earn over the threshold.",
      },
      { id: "self", title: "I'll pay myself", description: "$3,200 per unit, one unit at a time." },
      { id: "other", title: "Employer or scholarship", description: "Someone else covers some or all of it." },
    ],
    orientation: "Online orientation, Thu 25 Feb 2027",
  },
  {
    id: "nzma-cookery-l4",
    title: "New Zealand Certificate in Cookery (Level 4)",
    shortTitle: "Cookery Level 4",
    brand: "nzma",
    school: "New Zealand Management Academies",
    campuses: [
      { id: "sylvia-park", name: "Sylvia Park", placesLeft: 4 },
      { id: "manukau", name: "Manukau", placesLeft: 11 },
      { id: "hamilton", name: "Hamilton", placesLeft: 0 },
      { id: "porirua", name: "Porirua", placesLeft: 7 },
    ],
    intakes: [
      { id: "feb-2027", label: "16 Feb 2027", date: "2027-02-16" },
      { id: "jul-2027", label: "19 Jul 2027", date: "2027-07-19" },
    ],
    fee: "$8,940 incl. GST",
    duration: "35 weeks · full-time",
    eligibilityQuestions: [
      {
        id: "age",
        label: "How old will you be when the course starts?",
        options: ["16 or under", "17", "18–20", "21–24", "25+"],
        passing: ["17", "18–20", "21–24", "25+"],
        failNote: "This course starts at 17. Here's what fits right now — and we'll hold your spot for next year.",
      },
      {
        id: "background",
        label: "Which is true for you?",
        options: ["NCEA Level 1+", "Cookery Level 3", "Worked in a kitchen", "None yet"],
        passing: ["NCEA Level 1+", "Cookery Level 3", "Worked in a kitchen"],
        soft: ["None yet"],
        softNote: "That\'s ok — plenty of students start here. We\'ll ask a little more about you later, nothing hard.",
      },
    ],
    holdDays: 7,
    extraModules: ["kit"],
    fundingOptions: [
      { id: "loan", title: "Student loan (StudyLink)", description: "$0 upfront. We'll walk you through it." },
      { id: "self", title: "I'll pay myself", description: "$8,940, payment plan available" },
      { id: "other", title: "Someone else pays", description: "Employer, family or a scholarship" },
    ],
    orientation: "Orientation day, Mon 15 Feb 2027",
  },
  {
    id: "elite-beauty-l4",
    title: "New Zealand Certificate in Beauty Therapy (Level 4)",
    shortTitle: "Beauty Therapy Level 4",
    brand: "elite",
    school: "Elite School of Beauty and Spa",
    campuses: [
      { id: "auckland", name: "Auckland", placesLeft: 6 },
      { id: "wellington", name: "Wellington", placesLeft: 9 },
      { id: "christchurch", name: "Christchurch", placesLeft: 3 },
    ],
    intakes: [
      { id: "feb-2027", label: "22 Feb 2027", date: "2027-02-22" },
      { id: "jul-2027", label: "26 Jul 2027", date: "2027-07-26" },
    ],
    fee: "$7,650 incl. GST",
    duration: "32 weeks · full-time",
    eligibilityQuestions: [
      {
        id: "age",
        label: "How old will you be when the course starts?",
        options: ["16 or under", "17", "18–20", "21–24", "25+"],
        passing: ["17", "18–20", "21–24", "25+"],
        failNote: "This course starts at 17. Here's what fits right now — and we'll hold your spot for next year.",
      },
      {
        id: "background",
        label: "Which is true for you?",
        options: ["NCEA Level 1+", "Worked in a salon", "None yet"],
        passing: ["NCEA Level 1+", "Worked in a salon"],
        soft: ["None yet"],
        softNote: "That\'s ok — plenty of students start here. We\'ll ask a little more about you later, nothing hard.",
      },
    ],
    holdDays: 7,
    extraModules: ["kit"],
    fundingOptions: [
      { id: "loan", title: "Student loan (StudyLink)", description: "$0 upfront. We'll walk you through it." },
      { id: "self", title: "I'll pay myself", description: "$7,650, payment plan available" },
      { id: "other", title: "Someone else pays", description: "Employer, family or a scholarship" },
    ],
    orientation: "Orientation day, Fri 19 Feb 2027",
  },
  {
    id: "yoobee-creative-media-l4",
    title: "New Zealand Certificate in Digital Media and Design (Level 4)",
    shortTitle: "Creative Media Level 4",
    brand: "yoobee",
    school: "Yoobee College of Creative Innovation",
    campuses: [{ id: "online", name: "Online", placesLeft: 22 }],
    intakes: [
      { id: "feb-2027", label: "8 Feb 2027", date: "2027-02-08" },
      { id: "jun-2027", label: "14 Jun 2027", date: "2027-06-14" },
    ],
    fee: "Free · fees-free eligible",
    duration: "19 weeks · online",
    eligibilityQuestions: [
      {
        id: "age",
        label: "How old will you be when the course starts?",
        options: ["16 or under", "17", "18–20", "21–24", "25+"],
        passing: ["17", "18–20", "21–24", "25+"],
        failNote: "This course starts at 17. Here's what fits right now — and we'll hold your spot for next year.",
      },
      {
        id: "background",
        label: "Which is true for you?",
        options: ["NCEA Level 1+", "Made things online before", "None yet"],
        passing: ["NCEA Level 1+", "Made things online before"],
        soft: ["None yet"],
        softNote: "That\'s ok — plenty of students start here. We\'ll ask a little more about you later, nothing hard.",
      },
    ],
    holdDays: 7,
    extraModules: ["portfolio"],
    fundingOptions: [
      { id: "loan", title: "Fees-free", description: "$0. Most first-time students qualify." },
      { id: "self", title: "I'll pay myself", description: "If you have used your fees-free entitlement" },
      { id: "other", title: "Someone else pays", description: "Employer, family or a scholarship" },
    ],
    orientation: "Online kick-off, Mon 8 Feb 2027",
  },
]

export function getCourse(id: string | undefined): CourseConfig | undefined {
  return courses.find((c) => c.id === id)
}

export function defaultCourseFor(brand: BrandId): CourseConfig {
  return courses.find((c) => c.brand === brand) ?? courses[0]
}

export function coursesGroupedBySchool() {
  const groups = new Map<string, CourseConfig[]>()
  for (const c of courses) {
    const list = groups.get(c.school) ?? []
    list.push(c)
    groups.set(c.school, list)
  }
  return Array.from(groups.entries()).map(([school, list]) => ({ school, brand: list[0].brand, courses: list }))
}
