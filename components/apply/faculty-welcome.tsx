import Image from "next/image"
import { getFacultyLead } from "@/lib/config/faculty"
import type { BrandId } from "@/lib/types"

/** A short, personal welcome from the person who runs the course — sets the tone before the form. */
export function FacultyWelcome({ brand, courseTitle }: { brand: BrandId; courseTitle: string }) {
  const lead = getFacultyLead(brand)
  return (
    <figure className="flex flex-col gap-3 rounded-3xl border border-border bg-muted/60 p-5">
      <blockquote className="text-pretty text-[15px] italic leading-relaxed text-foreground">
        &ldquo;{lead.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <Image
          src={lead.photo || "/placeholder.svg"}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{lead.name}</span>
          <span className="text-xs text-muted-foreground">
            {lead.role} · {courseTitle}
          </span>
        </div>
      </figcaption>
    </figure>
  )
}
