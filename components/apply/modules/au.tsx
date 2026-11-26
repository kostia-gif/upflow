"use client"

import { HeartHandshake, ScanLine, ShieldCheck, type LucideIcon } from "lucide-react"
import { useCallback, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { MockCamera } from "@/components/apply/mock-camera"
import { OptionCards } from "@/components/apply/option-cards"
import { NativeSelect, PrimaryButton, SecondaryButton, TextLink } from "@/components/apply/primitives"
import { Segmented } from "@/components/apply/segmented"
import { TextField } from "@/components/apply/text-field"
import { WhyWeAsk } from "@/components/apply/why-we-ask"
import { useApplication } from "@/lib/application/context"
import { cn } from "@/lib/utils"
import type { ModuleProps } from "./types"

const COUNTRIES = [
  "Australia",
  "New Zealand",
  "United Kingdom",
  "India",
  "China",
  "Philippines",
  "Vietnam",
  "South Africa",
  "Other",
]

const YES_NO = ["Yes", "No"]

function InfoBox({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted p-3 text-sm leading-relaxed">
      <Icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
      <p>{children}</p>
    </div>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  optional,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  optional?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>}
      </label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </NativeSelect>
    </div>
  )
}

type UsiPath = "have" | "lost" | "create" | "later"

const USI_PATHS: { id: UsiPath; title: string; description: string }[] = [
  { id: "have", title: "I have my USI", description: "Type it in and you're done." },
  { id: "lost", title: "I have one but can't find it", description: "We'll show you where to look it up." },
  { id: "create", title: "Create one for me", description: "A photo of one ID, and we do the rest." },
  { id: "later", title: "Do this later", description: "Carry on now and add it before you finish." },
]

const ID_TYPES = [
  "Driver's licence",
  "Medicare card",
  "Australian passport",
  "Birth certificate",
  "Citizenship certificate",
  "ImmiCard",
  "Visa with overseas passport",
]

const isUsi = (v: string) => /^[A-Z0-9]{10}$/.test(v)

function UsiField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <TextField
      label="Your USI"
      value={value}
      onChange={(v) => onChange(v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
      maxLength={10}
      autoCapitalize="characters"
      autoComplete="off"
      spellCheck={false}
      placeholder="10 letters and numbers"
      className="uppercase tracking-[0.2em] placeholder:normal-case placeholder:tracking-normal"
      validate={(v) => (isUsi(v) ? null : "A USI is 10 letters and numbers")}
    />
  )
}

export function UsiModule({ onComplete }: ModuleProps) {
  const { app } = useApplication()
  const [path, setPath] = useState<UsiPath>()
  const [usi, setUsi] = useState("")
  const [idType, setIdType] = useState<string>()
  const [read, setRead] = useState(false)
  const [town, setTown] = useState("")
  const [country, setCountry] = useState("")
  const onPhoto = useCallback(() => setRead(true), [])
  const fullName = [app.firstName, app.lastName].filter(Boolean).join(" ")
  const dob = app.moduleData.identity?.dob

  return (
    <div className="flex flex-col gap-6">
      <OptionCards
        label="Do you have a USI?"
        value={path}
        onChange={(id) => setPath(id as UsiPath)}
        options={USI_PATHS}
      />

      {path === "have" && (
        <div className="flex flex-col gap-5">
          <UsiField value={usi} onChange={setUsi} />
          <PrimaryButton disabled={!isUsi(usi)} onClick={() => onComplete("done", { method: "have", usi })}>
            Next
          </PrimaryButton>
        </div>
      )}

      {path === "lost" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 rounded-2xl bg-muted p-4 text-sm leading-relaxed">
            <p>
              You can look it up on the government&apos;s USI website with the email or mobile you used when you
              got it. It takes about a minute.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                toast("This would open the USI website. It's mocked in this prototype.")
              }}
              className="w-fit font-medium text-brand underline underline-offset-4"
            >
              Find my USI
            </a>
          </div>
          <UsiField value={usi} onChange={setUsi} />
          <PrimaryButton disabled={!isUsi(usi)} onClick={() => onComplete("done", { method: "found", usi })}>
            Next
          </PrimaryButton>
          <SecondaryButton onClick={() => onComplete("later", { method: "lost" })}>I&apos;ll add it later</SecondaryButton>
        </div>
      )}

      {path === "create" && !idType && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Pick one ID you have on you</h2>
          <OptionCards
            label="Pick one ID you have on you"
            value={idType}
            onChange={setIdType}
            options={ID_TYPES.map((t) => ({ id: t, title: t }))}
          />
        </div>
      )}

      {path === "create" && idType && !read && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p>
              Using your <span className="font-semibold">{idType.toLowerCase()}</span>
            </p>
            <TextLink onClick={() => setIdType(undefined)} className="min-h-0">
              Change
            </TextLink>
          </div>
          <MockCamera label="Photo of your ID" hint="Lay it flat with all four corners in the frame." onResult={onPhoto} />
        </div>
      )}

      {path === "create" && idType && read && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-2xl bg-success-soft p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <ScanLine className="size-4" aria-hidden /> Here&apos;s what we read
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Document</dt>
              <dd className="font-medium">{idType}</dd>
              {fullName && (
                <>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{fullName}</dd>
                </>
              )}
              {dob && (
                <>
                  <dt className="text-muted-foreground">Date of birth</dt>
                  <dd className="font-medium">{dob}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Number</dt>
              <dd className="font-medium">Ending 4821</dd>
            </dl>
            <TextLink onClick={() => setRead(false)} className="min-h-0 w-fit">
              That&apos;s not right, retake
            </TextLink>
          </div>
          <TextField
            label="Town or city of birth"
            value={town}
            onChange={setTown}
            autoComplete="off"
            validate={(v) => (v.trim() ? null : "We need this one")}
          />
          <SelectField id="usi-country" label="Country of birth" value={country} onChange={setCountry} options={COUNTRIES} />
          <PrimaryButton
            disabled={!town.trim() || !country}
            onClick={() =>
              onComplete(
                "checking",
                { method: "create", idType, townOfBirth: town.trim(), countryOfBirth: country },
                "We'll create your USI and text it to you.",
              )
            }
          >
            Create my USI
          </PrimaryButton>
        </div>
      )}

      {path === "later" && (
        <PrimaryButton onClick={() => onComplete("later", { method: "later" })}>Skip for now</PrimaryButton>
      )}

      <WhyWeAsk>
        We can&apos;t issue your qualification without it. If you don&apos;t have one we can set it up for you, with
        your permission.
      </WhyWeAsk>
    </div>
  )
}

const DISABILITY_TYPES = [
  "Hearing",
  "Physical",
  "Intellectual",
  "Learning",
  "Mental health",
  "Acquired brain impairment",
  "Vision",
  "Medical condition",
  "Other",
  "Prefer not to say",
]

export function SupportNeedsModule({ onComplete }: ModuleProps) {
  const { rep } = useApplication()
  const [literacy, setLiteracy] = useState<string>()
  const [disability, setDisability] = useState<string>()
  const [disabilityType, setDisabilityType] = useState("")
  const [plan, setPlan] = useState<string>()
  const complete = !!literacy && !!disability && !!plan
  const anyYes = [literacy, disability, plan].includes("Yes")

  return (
    <div className="flex flex-col gap-6">
      <InfoBox icon={HeartHandshake}>This is so we can help, and it never counts against you.</InfoBox>
      <Segmented
        label="Would help with reading, writing or numbers be useful?"
        options={YES_NO}
        value={literacy}
        onChange={setLiteracy}
      />
      <Segmented
        label="Do you live with a disability, impairment or long-term condition?"
        options={YES_NO}
        value={disability}
        onChange={setDisability}
      />
      {disability === "Yes" && (
        <SelectField
          id="disability-type"
          label="Which best describes it?"
          value={disabilityType}
          onChange={setDisabilityType}
          options={DISABILITY_TYPES}
          optional
        />
      )}
      <Segmented label="Would you like a learning support plan?" options={YES_NO} value={plan} onChange={setPlan} />
      {anyYes && (
        <p role="status" className="rounded-2xl bg-brand-soft p-3 text-sm leading-relaxed">
          {rep ? rep.name : "Your advisor"} will be in touch before you start to set this up.
        </p>
      )}
      <PrimaryButton
        disabled={!complete}
        onClick={() =>
          onComplete("done", {
            literacy: literacy ?? "",
            disability: disability ?? "",
            disabilityType: disability === "Yes" ? disabilityType : "",
            supportPlan: plan ?? "",
          })
        }
      >
        Next
      </PrimaryButton>
    </div>
  )
}

const STATS_GROUPS = ["About you", "Work", "Education"]

const CITIZENSHIP = [
  "Australian citizen",
  "New Zealand citizen",
  "Permanent resident",
  "Permanent humanitarian visa",
  "Temporary visa",
  "Other",
]

const EMPLOYMENT = [
  "Full-time employee",
  "Part-time employee",
  "Self-employed not employing others",
  "Self-employed employing others",
  "Unemployed seeking work",
  "Not employed and not seeking work",
]

const STUDY_REASONS = [
  "To get a job",
  "To get a better job or promotion",
  "To start my own business",
  "To try a different career",
  "Extra skills for my current job",
  "It's a requirement of my job",
  "To get into another course",
  "Skills for community or volunteer work",
  "Personal interest",
  "Other",
]

const SCHOOL_LEVELS = ["Year 12", "Year 11", "Year 10", "Year 9", "Year 8 or below", "Never attended"]

const NO_QUALIFICATION = "None of these"

const QUALIFICATIONS = [
  "Bachelor or higher",
  "Advanced Diploma or Associate Degree",
  "Diploma",
  "Certificate IV",
  "Certificate III",
  "Certificate II",
  "Certificate I",
  NO_QUALIFICATION,
]

const isYear = (v: string) => /^(19|20)\d{2}$/.test(v)

export function AuStatsModule({ onComplete }: ModuleProps) {
  const { app, dispatch } = useApplication()
  const [group, setGroup] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(() => ({
    countryOfBirth: app.moduleData.usi?.countryOfBirth ?? "",
    citizenship: app.citizenship && CITIZENSHIP.includes(app.citizenship) ? app.citizenship : "",
  }))
  const [quals, setQuals] = useState<string[]>([])
  const a = (k: string) => answers[k] ?? ""
  const set = (k: string) => (v: string) => setAnswers((x) => ({ ...x, [k]: v }))

  const groupReady = [
    !!a("countryOfBirth") &&
      !!a("citizenship") &&
      !!a("indigenous") &&
      !!a("otherLanguage") &&
      (a("otherLanguage") === "No" || !!a("language").trim()) &&
      !!a("englishLevel"),
    !!a("employment") && !!a("studyReason"),
    !!a("atSchool") &&
      !!a("schoolLevel") &&
      (a("schoolLevel") === "Never attended" || isYear(a("schoolYear"))) &&
      quals.length > 0,
  ][group]

  function go(next: number) {
    setGroup(next)
    window.scrollTo({ top: 0 })
  }

  function toggleQual(q: string) {
    setQuals((current) => {
      if (q === NO_QUALIFICATION) return current.includes(q) ? [] : [q]
      const rest = current.filter((x) => x !== NO_QUALIFICATION)
      return rest.includes(q) ? rest.filter((x) => x !== q) : [...rest, q]
    })
  }

  function finish() {
    dispatch({ type: "SET_FIELDS", fields: { citizenship: a("citizenship") } })
    onComplete("done", {
      ...answers,
      language: a("otherLanguage") === "Yes" ? a("language").trim() : "",
      schoolYear: a("schoolLevel") === "Never attended" ? "" : a("schoolYear"),
      qualifications: quals.join(", "),
    })
  }

  const isLastGroup = group === STATS_GROUPS.length - 1

  return (
    <div className="flex flex-col gap-6">
      <InfoBox icon={ShieldCheck}>
        The Australian Government asks every provider for these. They are reported with your USI for national
        statistics, and they never affect your enrolment.
      </InfoBox>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold">{STATS_GROUPS[group]}</h2>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {group + 1} of {STATS_GROUPS.length}
        </span>
      </div>

      {group === 0 && (
        <>
          <SelectField
            id="stats-country"
            label="Country of birth"
            value={a("countryOfBirth")}
            onChange={set("countryOfBirth")}
            options={COUNTRIES}
          />
          <SelectField
            id="stats-citizenship"
            label="Citizenship status"
            value={a("citizenship")}
            onChange={set("citizenship")}
            options={CITIZENSHIP}
          />
          <Segmented
            label="Are you of Aboriginal or Torres Strait Islander origin?"
            options={["No", "Aboriginal", "Torres Strait Islander", "Both"]}
            value={answers.indigenous}
            onChange={set("indigenous")}
          />
          <Segmented
            label="Do you speak a language other than English at home?"
            options={YES_NO}
            value={answers.otherLanguage}
            onChange={set("otherLanguage")}
          />
          {a("otherLanguage") === "Yes" && (
            <TextField label="Which language?" value={a("language")} onChange={set("language")} autoComplete="off" />
          )}
          <Segmented
            label="How well do you speak English?"
            options={["Very well", "Well", "Not well", "Not at all"]}
            value={answers.englishLevel}
            onChange={set("englishLevel")}
          />
        </>
      )}

      {group === 1 && (
        <>
          <SelectField
            id="stats-employment"
            label="Employment status"
            value={a("employment")}
            onChange={set("employment")}
            options={EMPLOYMENT}
          />
          <TextField
            label="Occupation"
            value={a("occupation")}
            onChange={set("occupation")}
            autoComplete="organization-title"
            helper="Leave this blank if you're not working."
          />
          <SelectField
            id="stats-reason"
            label="Main reason for studying"
            value={a("studyReason")}
            onChange={set("studyReason")}
            options={STUDY_REASONS}
          />
        </>
      )}

      {group === 2 && (
        <>
          <Segmented label="Are you still at school?" options={YES_NO} value={answers.atSchool} onChange={set("atSchool")} />
          <SelectField
            id="stats-school-level"
            label="Highest school level you completed"
            value={a("schoolLevel")}
            onChange={set("schoolLevel")}
            options={SCHOOL_LEVELS}
          />
          {a("schoolLevel") !== "Never attended" && (
            <TextField
              label="Year you completed it"
              value={a("schoolYear")}
              onChange={(v) => set("schoolYear")(v.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 2012"
              autoComplete="off"
              validate={(v) => (isYear(v) ? null : "Enter a four-digit year")}
            />
          )}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Qualifications you&apos;ve already finished</legend>
            <p className="text-sm text-muted-foreground">Pick all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {QUALIFICATIONS.map((q) => {
                const active = quals.includes(q)
                return (
                  <button
                    key={q}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleQual(q)}
                    className={cn(
                      "min-h-11 rounded-full border-2 px-4 text-sm font-medium transition-colors",
                      active
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border text-foreground/80 hover:border-foreground/30",
                    )}
                  >
                    {q}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </>
      )}

      <PrimaryButton disabled={!groupReady} onClick={() => (isLastGroup ? finish() : go(group + 1))}>
        Next
      </PrimaryButton>
      {group > 0 && (
        <div className="flex justify-center">
          <TextLink onClick={() => go(group - 1)}>Back</TextLink>
        </div>
      )}
    </div>
  )
}
