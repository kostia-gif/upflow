import { brandOrder } from "@/lib/config/brands"
import type { BrandId } from "@/lib/types"
import { buildTranscript } from "@/lib/whatsapp/transcript"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const brandParam = searchParams.get("brand")
  const brand: BrandId = brandParam && (brandOrder as string[]).includes(brandParam) ? (brandParam as BrandId) : "aipc"
  const channelParam = searchParams.get("channel")
  const channels = channelParam === "sms" ? (["sms"] as const) : channelParam === "whatsapp" ? (["whatsapp"] as const) : (["whatsapp", "sms"] as const)

  const body = channels.map((c) => buildTranscript(brand, c)).join("\n\n\n")
  const suffix = channels.length === 1 ? channels[0] : "whatsapp-and-sms"

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${brand}-enrolment-chat-${suffix}.md"`,
      "Cache-Control": "no-store",
    },
  })
}
