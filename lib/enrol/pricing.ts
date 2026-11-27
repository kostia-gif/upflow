import { MAX_MAJORS, priceFor } from "@/lib/config/courses"
import { addDays } from "@/lib/format"
import type { Application, CourseConfig, PricingTier } from "@/lib/types"

export type PaymentPlan = NonNullable<Application["paymentPlan"]>

export function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-AU", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

export function tierFor(course: CourseConfig, app: Application): PricingTier | undefined {
  return priceFor(course, (app.majors ?? []).length)
}

/** Selected majors in the order they were picked. Every second one is the free one. */
export function selectedMajors(course: CourseConfig, app: Application) {
  return (app.majors ?? [])
    .slice(0, MAX_MAJORS)
    .map((id) => course.majors?.find((m) => m.id === id))
    .filter((m): m is { id: string; title: string } => !!m)
    .map((m, i) => ({ ...m, free: i % 2 === 1 }))
}

export function orderLabel(majorCount: number) {
  if (majorCount === 0) return "Diploma only"
  return `Diploma + ${majorCount} major${majorCount === 1 ? "" : "s"}`
}

export type PlanQuote = {
  today: number
  total: number
  /** What going upfront saves against paying in instalments. */
  saving: number
  instalments?: { each: number; count: number; unit: "month" | "fortnight"; adjective: "monthly" | "fortnightly" }
}

export function quoteFor(tier: PricingTier, plan: PaymentPlan): PlanQuote {
  const instalmentTotal = tier.monthly * tier.months
  const saving = instalmentTotal - tier.upfront
  if (plan === "monthly") {
    return {
      today: tier.monthly,
      total: instalmentTotal,
      saving,
      instalments: { each: tier.monthly, count: tier.months, unit: "month", adjective: "monthly" },
    }
  }
  if (plan === "fortnightly") {
    return {
      today: tier.fortnightly,
      total: tier.fortnightly * tier.fortnights,
      saving,
      instalments: { each: tier.fortnightly, count: tier.fortnights, unit: "fortnight", adjective: "fortnightly" },
    }
  }
  if (plan === "upfront") return { today: tier.upfront, total: tier.upfront, saving }
  return { today: 0, total: 0, saving }
}

export const PLAN_TITLES: Record<PaymentPlan, string> = {
  monthly: "Pay monthly",
  fortnightly: "Pay fortnightly",
  upfront: "Pay upfront and save",
  contact: "Talk to me first",
}

export function practicalLine(course: CourseConfig) {
  if (!course.practical) return undefined
  const { sessions, each } = course.practical
  return `Plus ${sessions} practical sessions at ${formatMoney(each)} each, paid as you take them (${formatMoney(sessions * each)}).`
}

export function nextPaymentDate(plan: PaymentPlan, paidAt: string): string | undefined {
  if (plan === "fortnightly") return addDays(14, new Date(paidAt))
  if (plan === "monthly") {
    const d = new Date(paidAt)
    d.setMonth(d.getMonth() + 1)
    return d.toISOString()
  }
  return undefined
}
