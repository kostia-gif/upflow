import type { BrandConfig, CourseConfig, ModuleId, Rep } from "@/lib/types"

export type Sender = "assistant" | "rep" | "me"

export type Channel = "whatsapp" | "sms"

export type Message =
  | { kind: "text"; from: Sender; text: string }
  | { kind: "system"; text: string }
  | { kind: "progress" }
  | { kind: "attachment"; from: "me"; name: string; meta: string; image?: boolean; preview?: string }
  | { kind: "doc"; title: string; lines: string[] }
  | { kind: "signed"; from: "me"; name: string; image?: string }
  | { kind: "link"; title: string; body: string; href: string; cta: string }
  | { kind: "remind"; label: string }

export type Choice = { label: string; next: string }

export type Scene = {
  id: string
  messages: Message[]
  choices?: Choice[]
  /** Continue straight into another scene once the messages have played. */
  auto?: string
  /** Open a bottom sheet after the messages; the sheet decides the next scene. */
  sheet?: "upload" | "id-upload" | "sign"
  /** Mark a module in the shared application state when this scene plays. */
  complete?: { module: ModuleId; status: "done" | "checking" | "sent"; data?: Record<string, string> }
  /** Skip this module for the rest of the thread — the student has chosen to do it later. */
  defer?: ModuleId
  remind?: string
  /** Storytelling beat this scene belongs to, for the explainer panel. */
  beat: number
}

export type ScriptCtx = {
  firstName: string
  brand: BrandConfig
  course: CourseConfig
  rep: Rep
  campus: string
  holdUntil: string
  webviewHref: string
  doneHref: string
  /** Titles of steps the chat does not cover, still to do in the browser or later in the thread. */
  remaining: string[]
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

/** Modules the chat can finish, in the order the assistant offers them. */
export const chatModules: ModuleId[] = ["identity", "money", "credit", "sign"]

export function buildScript(ctx: ScriptCtx): Record<string, Scene> {
  const { firstName, brand, course, rep, campus, holdUntil, webviewHref, doneHref, remaining } = ctx
  const au = brand.country === "AU"
  const leftover = remaining.length
    ? ` ${remaining.length} short ${remaining.length === 1 ? "step is" : "steps are"} left — ${joinList(remaining.map((r) => r.toLowerCase()))}. I'll message you each one here, or you can knock them off in the browser now.`
    : ""
  const loanName = au ? "FEE-HELP" : "a StudyLink loan"
  const first = rep.name

  const webview: Message = {
    kind: "link",
    title: "Continue in your browser",
    body: "Same application, already signed in — no code to type. This link only works from your number.",
    href: webviewHref,
    cta: "Open",
  }

  const scenes: Scene[] = [
    {
      id: "intro",
      beat: 0,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `Hi ${firstName}, thanks for starting your ${course.shortTitle} application with ${brand.shortName}. You're in — your place is held until ${holdUntil}.`,
        },
        { kind: "progress" },
        {
          kind: "text",
          from: "assistant",
          text: `You can finish the rest right here, or open it in your browser any time. I'm the ${brand.shortName} assistant — I handle the quick bits and bring in a person when it matters.`,
        },
        webview,
        { kind: "system", text: `${first} (${rep.role}) was added` },
        {
          kind: "text",
          from: "rep",
          text: `Hey ${firstName}, ${first} here — we spoke when you enquired. Great to see you've taken the leap. I'm in this chat the whole way, so ask me anything.`,
        },
      ],
      choices: [
        { label: "Let's finish it now", next: "resume" },
        { label: "I've got a question first", next: "ask" },
        { label: "Can I do this later?", next: "later" },
      ],
    },
    {
      id: "ask",
      beat: 2,
      messages: [{ kind: "text", from: "assistant", text: "Sure — what's on your mind? Type it, or pick one." }],
      choices: [
        { label: "How do placements work?", next: "q-placement" },
        { label: "What will it cost me?", next: "q-fees" },
        { label: `Can I talk to ${first}?`, next: "human" },
      ],
    },
    {
      id: "q-placement",
      beat: 2,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text:
            brand.id === "aipc"
              ? `Placements are built in: 200 hours across two agencies, usually from your third trimester. We have partner agencies near ${campus} and the placement team matches you — you don't have to find one yourself.`
              : `Work placement is arranged with you in the second half of the course. We have partner employers near ${campus} and the team matches you — you don't have to find one yourself.`,
        },
        {
          kind: "text",
          from: "assistant",
          text: `Want ${first} to talk you through how it's worked for other students?`,
        },
      ],
      choices: [
        { label: "Yes please", next: "human-placement" },
        { label: "No, that answers it", next: "resume" },
      ],
    },
    {
      id: "human-placement",
      beat: 2,
      messages: [
        { kind: "system", text: `Handed to ${first}` },
        {
          kind: "text",
          from: "rep",
          text: `Happy to. This is the one most of my students worry about. Last intake everyone was placed by week three, and the team works around your job and family. If you've got a preference — schools, community, private practice — tell me now and I'll flag it.`,
        },
      ],
      choices: [
        { label: "Community would be ideal", next: "rep-ack" },
        { label: "Let's carry on", next: "resume" },
      ],
    },
    {
      id: "rep-ack",
      beat: 2,
      messages: [
        {
          kind: "text",
          from: "rep",
          text: "Noted — it's on your file. Right, let's get the rest sorted.",
        },
      ],
      auto: "resume",
    },
    {
      id: "q-fees",
      beat: 2,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `${course.fee}. ${
            au
              ? "Most students use FEE-HELP — nothing up front, you repay through tax once you earn over the threshold."
              : "Most students use a StudyLink loan — nothing to pay up front."
          } Nothing is due today, and we'll go through the options in a minute.`,
        },
      ],
      choices: [
        { label: "Got it, let's continue", next: "resume" },
        { label: `Can I talk to ${first}?`, next: "human" },
      ],
    },
    {
      id: "human",
      beat: 2,
      messages: [
        { kind: "system", text: `Handed to ${first}` },
        {
          kind: "text",
          from: "rep",
          text: "I'm here. What do you want to know? If it's easier to talk, I can call you — just say when.",
        },
      ],
      choices: [
        { label: "Call me tomorrow morning", next: "call-booked" },
        { label: "Actually, let's keep going", next: "resume" },
      ],
    },
    {
      id: "call-booked",
      beat: 2,
      messages: [
        {
          kind: "text",
          from: "rep",
          text: "Done — I'll call tomorrow between 9 and 10. We can knock off the easy bits here in the meantime if you like.",
        },
      ],
      choices: [
        { label: "Sure, let's do it", next: "resume" },
        { label: "I'll wait for the call", next: "wait-call" },
      ],
    },
    {
      id: "wait-call",
      beat: 2,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `No problem. Your place is held until ${holdUntil} either way, and I'll nudge you after the call.`,
        },
      ],
      choices: [{ label: "Actually, let's keep going", next: "resume" }],
    },
    {
      id: "later",
      beat: 2,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `No problem — your place is held until ${holdUntil} either way. When should I check back in?`,
        },
      ],
      choices: [
        { label: "Tonight", next: "later-tonight" },
        { label: "Tomorrow", next: "later-tomorrow" },
        { label: "Next week", next: "later-week" },
      ],
    },
    ...(["tonight", "tomorrow", "week"] as const).map<Scene>((when) => {
      const label = when === "week" ? "next week" : when
      return {
        id: `later-${when}`,
        beat: 2,
        remind: label,
        messages: [
          { kind: "remind", label: `Reminder set · ${label}` },
          {
            kind: "text",
            from: "assistant",
            text: `Done. I'll message you ${label}. Reply any time before then and we'll pick it straight up.`,
          },
        ],
        choices: [{ label: "Actually, let's keep going", next: "resume" }],
      }
    }),
    {
      id: "identity",
      beat: 3,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `One thing is still waiting from before: your photo ID. A passport, birth certificate or citizenship certificate — take a photo of it and I'll read the details, no typing.`,
        },
      ],
      choices: [
        { label: "Take a photo now", next: "identity-upload" },
        { label: "I'll do it later", next: "identity-later" },
      ],
    },
    {
      id: "identity-upload",
      beat: 3,
      messages: [{ kind: "text", from: "assistant", text: "Lay it flat in good light with all four corners in frame, then send it here." }],
      sheet: "id-upload",
    },
    {
      id: "identity-read",
      beat: 3,
      complete: {
        module: "identity",
        status: "done",
        data: {
          method: "photo",
          document: "Passport",
          name: "Sarah Jane Bilkey",
          dob: au ? "14 May 1991" : "14 May 2008",
          citizenship: au ? "Australian citizen" : "New Zealand citizen",
        },
      },
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `Read it — passport, Sarah Jane Bilkey, born ${au ? "14 May 1991" : "14 May 2008"}, ${
            au ? "Australian" : "New Zealand"
          } citizen. That matches what you told us, so you're verified. The photo isn't kept — only those details are.`,
        },
      ],
      auto: "resume",
    },
    {
      id: "identity-later",
      beat: 3,
      defer: "identity",
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: "No problem — it's the one thing we can't finish without, so I'll nudge you about it tomorrow. Let's do the rest.",
        },
      ],
      auto: "resume",
    },
    {
      id: "money",
      beat: 3,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `Next: paying for it. Nothing to pay today — this just tells us how you're likely to cover the fees (${course.fee}). How are you thinking?`,
        },
      ],
      choices: [
        { label: au ? "FEE-HELP" : "StudyLink loan", next: "money-loan" },
        { label: "Paying myself", next: "money-self" },
        { label: "Not sure yet", next: "money-unsure" },
      ],
    },
    {
      id: "money-loan",
      beat: 3,
      complete: { module: "money", status: "done", data: { funding: "loan" } },
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: au
            ? "Good — most people do. We'll send your FEE-HELP form after enrolment. It takes about ten minutes and needs your USI, which we already have."
            : "Good — most people do. We'll send your StudyLink link after enrolment. It takes about ten minutes and uses the details you've already given us.",
        },
      ],
      auto: "resume",
    },
    {
      id: "money-self",
      beat: 3,
      complete: { module: "money", status: "done", data: { funding: "self" } },
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: "No problem. We'll send a payment plan after enrolment — fortnightly or per term. Nothing to set up now.",
        },
      ],
      auto: "resume",
    },
    {
      id: "money-unsure",
      beat: 3,
      complete: { module: "money", status: "checking", data: { funding: "other" } },
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `That's fine — most people aren't at this point. I've asked ${first} to send you the options. Nothing to decide today.`,
        },
        {
          kind: "text",
          from: "rep",
          text: `I'll send you a plain-English breakdown tonight, ${firstName} — ${loanName} versus paying as you go. Two minutes to read.`,
        },
      ],
      auto: "resume",
    },
    {
      id: "credit",
      beat: 3,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: "Next: credit for what you've already done. A CV or proof of past work or study might shorten the course and save fees. Got anything handy?",
        },
      ],
      choices: [
        { label: "Yes, I'll send it", next: "credit-upload" },
        { label: "No, skip it", next: "credit-skip" },
      ],
    },
    {
      id: "credit-upload",
      beat: 3,
      messages: [{ kind: "text", from: "assistant", text: "Great — send it as a photo or a file, whatever's easiest." }],
      sheet: "upload",
    },
    {
      id: "credit-read",
      beat: 3,
      complete: { module: "credit", status: "checking", data: { cv: "uploaded" } },
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: "Got it. I can see three years as a youth support worker and a Bachelor of Psychology — both may count toward units. A course specialist confirms what's eligible; nothing's promised yet.",
        },
      ],
      auto: "resume",
    },
    {
      id: "credit-skip",
      beat: 3,
      complete: { module: "credit", status: "done", data: { cv: "skipped" } },
      messages: [{ kind: "text", from: "assistant", text: "No worries — you can send it later if you find something." }],
      auto: "resume",
    },
    {
      id: "sign",
      beat: 4,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `Last one, ${firstName}: your enrolment agreement. It's what you've told us plus the standard terms.`,
        },
        {
          kind: "doc",
          title: `Enrolment agreement · ${course.shortTitle}`,
          lines: [`${campus} campus`, course.fee, `Place held until ${holdUntil}`],
        },
      ],
      sheet: "sign",
    },
    {
      id: "signed",
      beat: 4,
      complete: { module: "sign", status: "done" },
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `Signed and stored — that's the agreement done.${leftover || " That's everything: you're enrolled."}`,
        },
        {
          kind: "text",
          from: "rep",
          text: `You're officially in, ${firstName}. ${course.orientation}${campus.toLowerCase() === "online" ? "" : ` at ${campus}`} — I'll see you there, and I'm right here until then.`,
        },
        {
          kind: "link",
          title: "Your enrolment",
          body: "Orientation details, what to bring, and your agreement.",
          href: doneHref,
          cta: "Open",
        },
      ],
      choices: [{ label: `Thanks ${first}!`, next: "thanks" }],
    },
    {
      id: "thanks",
      beat: 4,
      messages: [{ kind: "text", from: "rep", text: "Any time. Now go and celebrate." }],
    },
    {
      id: "done",
      beat: 4,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: remaining.length
            ? `That's everything we can do in this chat for now.${leftover}`
            : "You've done everything on your list — nothing left to send.",
        },
        {
          kind: "link",
          title: "Your enrolment",
          body: "Orientation details, what to bring, and your agreement.",
          href: doneHref,
          cta: "Open",
        },
      ],
    },
    {
      id: "fallback",
      beat: 2,
      messages: [
        {
          kind: "text",
          from: "assistant",
          text: `I'm not sure about that one and I'd rather not guess. Want me to bring ${first} in?`,
        },
      ],
      choices: [
        { label: `Yes, ask ${first}`, next: "human" },
        { label: "No, let's continue", next: "resume" },
      ],
    },
  ]

  return Object.fromEntries(scenes.map((s) => [s.id, s]))
}

/** Very small intent router for anything the student types rather than taps. */
export function routeFreeText(text: string): string {
  const t = text.toLowerCase()
  if (/placement|practicum|hours|agency|agencies/.test(t)) return "q-placement"
  if (/passport|photo id|licence|license|birth cert|citizenship|identity|\bid\b/.test(t)) return "identity"
  if (/fee|cost|price|pay|loan|money|afford|studylink|help/.test(t)) return "q-fees"
  if (/later|tomorrow|tonight|busy|next week|not now|remind/.test(t)) return "later"
  if (/human|person|someone|advisor|adviser|call|talk|speak|chat to|priya|matt|aroha|tane/.test(t)) return "human"
  if (/sign|finish|continue|next|go|ok|yes|sure|ready|let's/.test(t)) return "resume"
  return "fallback"
}
