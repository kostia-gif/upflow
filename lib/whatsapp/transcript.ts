import { isComplete, moduleList, returningFixture } from "@/lib/application/reducer"
import { getBrand } from "@/lib/config/brands"
import { defaultCourseFor, getCourse } from "@/lib/config/courses"
import { moduleMeta } from "@/lib/config/modules"
import { getRep } from "@/lib/config/reps"
import { formatDayMonth } from "@/lib/format"
import type { BrandId } from "@/lib/types"
import { buildScript, chatModules, type Channel, type Choice, type Message, type Scene, type Sender } from "@/lib/whatsapp/script"

/** The tap-through the demo is built around; everything else is a branch off it. */
const happyPath = [
  "intro",
  "resume",
  "identity",
  "identity-confirmed",
  "money",
  "money-loan",
  "school-record",
  "school-record-upload",
  "school-record-read",
  "credit",
  "credit-upload",
  "credit-read",
  "statement",
  "statement-q1",
  "statement-q2",
  "statement-q3",
  "statement-done",
  "sign",
  "signed",
  "thanks",
]

type Ctx = ReturnType<typeof buildContext>

function buildContext(brandId: BrandId, channel: Channel) {
  const brand = getBrand(brandId)
  // Mirror the /whatsapp page: identity and transcript are still outstanding so the thread can cover them.
  const fixture = returningFixture(brandId)
  const { identity: _id, "school-record": _sr, ...modules } = fixture.modules
  const app = { ...fixture, modules }
  const course = getCourse(app.courseId) ?? defaultCourseFor(brandId)
  const rep = getRep(app.rep)!
  const campus = course.campuses.find((c) => c.id === app.campusId)?.name ?? course.campuses[0].name
  const firstName = app.firstName ?? "there"
  const fullName = [app.firstName, app.lastName].filter(Boolean).join(" ")
  const all = moduleList(app)
  const remaining = all.filter((m) => !chatModules.includes(m) && !isComplete(app, m)).map((m) => moduleMeta[m].title)
  const done = all.filter((m) => isComplete(app, m)).map((m) => moduleMeta[m].title)
  const todo = all.filter((m) => !isComplete(app, m)).map((m) => moduleMeta[m].title)
  const holdUntil = app.holdUntil ? formatDayMonth(app.holdUntil) : `${course.holdDays} days from now`
  const base = `/apply/welcome-back?brand=${brandId}&via=${channel}`
  const script = buildScript({
    firstName,
    brand,
    course,
    rep,
    campus,
    holdUntil,
    webviewHref: base,
    doneHref: `${base}&to=done`,
    remaining,
  })
  return { brand, course, rep, campus, firstName, fullName, holdUntil, done, todo, script, channel, signHref: `${base}&to=sign` }
}

function speaker(ctx: Ctx, from: Sender) {
  const sms = ctx.channel === "sms"
  if (from === "me") return `**${ctx.firstName}:**`
  if (from === "rep") return sms ? `**${ctx.brand.shortName} (${ctx.rep.name}):**` : `**${ctx.rep.name} (${ctx.rep.role}):**`
  return sms ? `**${ctx.brand.shortName}:**` : `**${ctx.brand.shortName} Assistant:**`
}

function renderMessage(ctx: Ctx, m: Message): string {
  const sms = ctx.channel === "sms"
  switch (m.kind) {
    case "text":
      return `${speaker(ctx, m.from)} ${m.text.replace(/\n/g, "  \n")}`
    case "system":
      return sms ? `${speaker(ctx, "assistant")} ${m.text}.` : `_— ${m.text} —_`
    case "progress": {
      const done = ctx.done.length ? `Done: ${ctx.done.join(", ")}.` : ""
      const todo = ctx.todo.length ? `Still to do: ${ctx.todo.join(", ")}.` : ""
      return sms
        ? `${speaker(ctx, "assistant")} ${done} ${todo}`.trim()
        : `_[Progress card] ${done} ${todo}_`.trim()
    }
    case "attachment":
      return `${speaker(ctx, "me")} _[sends ${m.image ? "photo" : "file"}: ${m.name} · ${m.meta}]_`
    case "doc":
      return sms
        ? `${speaker(ctx, "assistant")} ${m.title} — ${m.lines.join(" · ")}.`
        : `_[Document card] ${m.title} — ${m.lines.join(" · ")}_`
    case "signed":
      return `${speaker(ctx, "me")} _[signs the agreement as ${m.name}]_`
    case "link":
      return sms
        ? `${speaker(ctx, "assistant")} ${m.title}: ${m.body} ${m.href}`
        : `_[Link card] **${m.title}** — ${m.body} → ${m.cta} (${m.href})_`
    case "remind":
      return `_[${m.label}]_`
  }
}

function renderChoices(ctx: Ctx, choices: Choice[]): string[] {
  if (ctx.channel === "sms") {
    return [
      `${speaker(ctx, "assistant")} Reply with a number:  `,
      ...choices.map((c, i) => `${i + 1} — ${c.label} → \`${c.next}\`  `),
    ]
  }
  return [`_Reply buttons:_`, ...choices.map((c) => `- ${c.label} → \`${c.next}\``)]
}

function renderSheet(ctx: Ctx, sheet: NonNullable<Scene["sheet"]>): string[] {
  const sms = ctx.channel === "sms"
  if (sheet === "sign") {
    return sms
      ? [
          renderMessage(ctx, { kind: "link", title: "Sign in your browser", body: "About a minute, already signed in — no code to type.", href: ctx.signHref, cta: "Open" }),
          ...renderChoices(ctx, [{ label: "Done, I've signed it", next: "signed" }]),
        ]
      : ["_Signature sheet opens: summary of the agreement and a finger-signature pad. Signing → `signed`; dismissing offers “Open the agreement again”._"]
  }
  if (sheet === "transcript") {
    return [
      `_Attach sheet opens (Camera / Photos / Document). Sending a photo → \`school-record-read\`; dismissing offers “Do it now” / “I'll send it later”.${sms ? " Over SMS the photo travels as MMS." : ""}_`,
    ]
  }
  return [
    `_Attach sheet opens (Camera / Photos / Document). Sending a CV → \`credit-read\`; dismissing offers “Do it now” / “I'll send it later”.${sms ? " Over SMS the file travels as MMS." : ""}_`,
  ]
}

function renderScene(ctx: Ctx, scene: Scene, heading: string): string[] {
  const lines: string[] = [`### ${heading}`, ""]
  for (const m of scene.messages) lines.push(renderMessage(ctx, m), "")
  if (scene.sheet) lines.push(...renderSheet(ctx, scene.sheet), "")
  else if (scene.auto) lines.push(`_Continues automatically → \`${scene.auto}\`_`, "")
  else if (scene.choices) lines.push(...renderChoices(ctx, scene.choices), "")
  else lines.push("_End of thread._", "")
  if (scene.capture) lines.push(`_Or the student types their own answer → \`${scene.capture}\`._`, "")
  if (scene.complete) {
    lines.push(`_Application updated: ${moduleMeta[scene.complete.module].title} → ${scene.complete.status}._`, "")
  }
  if (scene.defer) lines.push(`_Deferred: ${moduleMeta[scene.defer].title} is skipped for the rest of this thread._`, "")
  return lines
}

export function buildTranscript(brandId: BrandId, channel: Channel): string {
  const ctx = buildContext(brandId, channel)
  const sms = channel === "sms"
  const { brand, course, rep, campus, script } = ctx

  const out: string[] = [
    `# ${brand.name} — ${sms ? "SMS" : "WhatsApp"} enrolment thread`,
    "",
    `Prototype dialogue for a returning student. Generated from the live script, so it matches what the preview plays.`,
    "",
    `- Student: ${ctx.fullName}`,
    `- Course: ${course.title} (${campus})`,
    `- Advisor in the thread: ${rep.name}, ${rep.role}`,
    `- Place held until: ${ctx.holdUntil}`,
    `- Already done before this thread: ${ctx.done.join(", ")}`,
    `- Outstanding when the thread opens: ${ctx.todo.join(", ")}`,
    "",
    sms
      ? `**SMS rules applied:** one sender number, so messages are prefixed \`${brand.shortName}:\` or \`${brand.shortName} (${rep.name}):\`; no typing indicator or read receipts; cards and buttons flatten to plain text with numbered replies; photos arrive as MMS; signing hands off to a browser link.`
      : `**WhatsApp rules applied:** named senders in one group thread (assistant + advisor + student); progress, document and link cards; tap-to-reply buttons; attachments and a signature pad in the chat.`,
    "",
    `\`resume\` is not a scene — it jumps to the next outstanding module in order (${chatModules.map((m) => moduleMeta[m].title).join(" → ")}) or to \`done\` when nothing is left.`,
    "",
    "---",
    "",
    "## 1. Happy path (read top to bottom)",
    "",
    `The student taps “Let's finish it now”, confirms their name and date of birth, picks ${brand.country === "AU" ? "FEE-HELP" : "a StudyLink loan"}, uploads their transcript and CV, answers three short questions, and signs.`,
    "",
  ]

  let step = 1
  let previous: Scene | undefined
  for (const id of happyPath) {
    if (id === "resume") continue
    const scene = script[id]
    if (!scene) continue
    // In the happy path every `resume` lands on the very next scene, so a resume reply counts as choosing it.
    const options = previous?.choices ?? []
    const chosen = options.find((c) => c.next === id) ?? options.find((c) => c.next === "resume")
    if (chosen) out.push(`${speaker(ctx, "me")} ${sms ? String(options.indexOf(chosen) + 1) : chosen.label}`, "")
    previous = scene
    if (id === "school-record-read") out.push(renderMessage(ctx, { kind: "attachment", from: "me", name: "IMG_2044.jpg", meta: "Photo · 2.4 MB", image: true }), "")
    if (id === "credit-read") out.push(renderMessage(ctx, { kind: "attachment", from: "me", name: "Sarah_Bilkey_CV.pdf", meta: "PDF · 184 KB" }), "")
    if (id === "signed") {
      out.push(sms ? `${speaker(ctx, "me")} 1` : renderMessage(ctx, { kind: "signed", from: "me", name: ctx.fullName }), "")
    }
    out.push(...renderScene(ctx, scene, `${step++}. \`${id}\``))
  }

  out.push("---", "", "## 2. Every scene and branch", "", "Scenes are grouped by the story beat they belong to. Arrows show which scene each reply leads to.", "")

  const beatNames = [
    "Beat 0 — Thanks, and where you're up to",
    "Beat 1 — Your advisor joins the same chat",
    "Beat 2 — Questions, hand-off to a human, and coming back later",
    "Beat 3 — Documents and details in the chat",
    "Beat 4 — Sign, and you're enrolled",
  ]
  const scenes = Object.values(script)
  for (let b = 0; b < beatNames.length; b++) {
    const group = scenes.filter((s) => s.beat === b)
    if (!group.length) continue
    out.push(`## ${beatNames[b]}`, "")
    for (const scene of group) out.push(...renderScene(ctx, scene, `\`${scene.id}\``))
  }

  out.push(
    "---",
    "",
    "## 3. Typed messages",
    "",
    "Anything the student types instead of tapping is routed by keyword:",
    "",
    "- placement / practicum / hours / agency → `q-placement`",
    "- transcript / results / grades / NCEA / USI → `school-record`",
    "- essay / statement / personal statement / why counselling → `statement`",
    "- name / date of birth / ID → `identity`",
    "- fee / cost / price / pay / loan / money / afford → `q-fees`",
    "- later / tomorrow / tonight / busy / next week / remind → `later`",
    `- human / person / advisor / call / talk / ${rep.name} → \`human\``,
    "- sign / finish / continue / next / yes / ready → `resume`",
    sms ? "- a single digit while numbered replies are showing → that reply" : "",
    "- anything else → `fallback` (the assistant says it would rather not guess and offers the advisor)",
    "",
  )

  return out.filter((l) => l !== undefined).join("\n")
}
