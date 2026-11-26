"use client"

import { useRouter } from "next/navigation"
import { StepFrame } from "@/components/apply/step-frame"
import { useApplication } from "@/lib/application/context"
import { ENROL_STEPS_PATH } from "@/lib/enrol/routes"

export default function EnrolWayInPlaceholderPage() {
  const router = useRouter()
  const { totalSteps } = useApplication()
  return (
    <StepFrame
      step={3}
      totalSteps={totalSteps}
      showRep={false}
      showWhatsApp={false}
      title="Your way in"
      lede="This screen isn't built yet. Continue to carry on to your steps."
      cta="Continue"
      onCta={() => router.push(ENROL_STEPS_PATH)}
    />
  )
}
