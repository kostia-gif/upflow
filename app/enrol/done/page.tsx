"use client"

import { TextLink } from "@/components/apply/primitives"
import { StepFrame } from "@/components/apply/step-frame"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"

export default function EnrolDonePlaceholderPage() {
  return (
    <StepFrame
      back={false}
      showRep={false}
      showWhatsApp={false}
      title="That's everything."
      lede="This screen isn't built yet."
      secondary={<TextLink href={ENROL_STEPS_PATH}>Back to my steps</TextLink>}
    />
  )
}
