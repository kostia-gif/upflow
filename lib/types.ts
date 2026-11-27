export type Country = "NZ" | "AU"

export type BrandId = "aipc" | "nzma" | "elite" | "yoobee"

export type BrandConfig = {
  id: BrandId
  country: Country
  name: string
  shortName: string
  logo: string
  primary: string
  primaryForeground: string
  accent: string
  soft: string
  headingFont: "outfit" | "barlow" | "cormorant" | "syne"
  greeting: string
  /** CTA label leaving the welcome screen and into the application proper. */
  applyCta: string
  supportPhone: string
  tutorVideoPoster: string
  tutorVideoCaption: string
  defaultAdvisor: string
  coursePageUrl: string
}

export type ModuleId =
  | "identity"
  | "address"
  | "school-record"
  | "government"
  | "money"
  | "support-person"
  | "credit"
  | "statement"
  | "portfolio"
  | "placement-check"
  | "kit"
  | "sign"
  | "usi"
  | "support-needs"
  | "au-stats"
  | "degree"
  | "work-history"
  | "entry-statement"
  | "pay"

export type FlowId = "nz-baseline" | "online-enrol-pay" | "online-apply-assess"

export type PricingTier = {
  majorsPaid: number
  upfront: number
  fortnightly: number
  fortnights: number
  monthly: number
  months: number
}

export type EligibilityQuestion = {
  id: string
  label: string
  options: string[]
  passing: string[]
  soft?: string[]
  softNote?: string
  failNote?: string
}

export type CourseConfig = {
  id: string
  title: string
  shortTitle: string
  brand: BrandId
  flow: FlowId
  school: string
  campuses: { id: string; name: string; placesLeft: number }[]
  intakes: { id: string; label: string; date: string }[]
  fee: string
  duration: string
  eligibilityQuestions: EligibilityQuestion[]
  holdDays: number
  /** Friendly time range shown before applying, overriding the computed single figure. */
  applyEstimate?: string
  /** Short "what you'll walk away with" bullets shown on the first application screen. */
  outcomes: string[]
  extraModules: ModuleId[]
  fundingOptions: { id: FundingId; title: string; description: string }[]
  orientation: string
  majors?: { id: string; title: string }[]
  pricing?: PricingTier[]
  practical?: { sessions: number; each: number }
}

export type FundingId = "loan" | "self" | "other"

export type ModuleStatus = "todo" | "later" | "sent" | "checking" | "done"

export type MoneyHelp = "help" | "sorted" | "unsure"

export type Rep = {
  id: string
  name: string
  role: string
  brand: BrandId
  photo: string
  whatsapp: string
  phone: string
}

export type Application = {
  id: string
  brand: BrandId
  courseId: string
  campusId?: string
  intakeId?: string
  rep?: string
  repAssigned?: "spoken" | "assigned"
  entryPath?: "A" | "B"
  firstName?: string
  lastName?: string
  mobile?: string
  email?: string
  mobileVerified: boolean
  eligibility: Record<string, string>
  residency?: "yes" | "no"
  funding?: FundingId
  moneyHelp?: MoneyHelp
  parentMobile?: string
  contactConsent?: boolean
  submittedAt?: string
  holdUntil?: string
  modules: Partial<Record<ModuleId, ModuleStatus>>
  moduleData: Partial<Record<ModuleId, Record<string, string>>>
  channel?: "app" | "whatsapp"
  remindAt?: string
  remindLabel?: string
  remindChannel?: "sms" | "whatsapp"
  majors?: string[]
  paymentPlan?: "upfront" | "monthly" | "fortnightly" | "contact"
  offerCode?: string
  pathway?: "aipc-bachelor" | "counselling-bachelor" | "other-bachelor" | "none"
  studyMode?: "online" | "sydney"
  citizenship?: string
  paidAt?: string
}
