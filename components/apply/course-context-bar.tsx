"use client"

import Image from "next/image"
import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useApplication } from "@/lib/application/context"
import { coursesGroupedBySchool } from "@/lib/config/courses"
import { getBrand } from "@/lib/config/brands"
import { cn } from "@/lib/utils"
import { NativeSelect, PrimaryButton } from "./primitives"

export function CourseContextBar() {
  const { app, brand, course, dispatch } = useApplication()
  const [open, setOpen] = useState(false)
  const campus = course.campuses.find((c) => c.id === app.campusId)
  const intake = course.intakes.find((i) => i.id === app.intakeId)
  const places = campus?.placesLeft

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Image src={brand.logo} alt={brand.shortName} width={96} height={32} className="h-7 w-auto shrink-0" priority />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{course.shortTitle}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[campus?.name, intake?.label].filter(Boolean).join(" · ") || brand.name}
          </p>
        </div>
        {typeof places === "number" && (
          <span
            className={cn(
              "hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline",
              places === 0 && "bg-destructive/10 text-destructive",
              places > 0 && places < 5 && "bg-warning-soft text-warning",
              places >= 5 && "bg-muted text-muted-foreground",
            )}
          >
            {places === 0 ? "Waitlist" : `${places} left`}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-9 shrink-0 rounded-full px-3 text-sm font-medium text-brand hover:bg-brand-soft"
        >
          Change
        </button>
      </header>
      <ChangeCourseSheet open={open} onOpenChange={setOpen} />
    </>
  )
}

export function ChangeCourseSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { app, course, dispatch } = useApplication()
  const [courseId, setCourseId] = useState(course.id)
  const [campusId, setCampusId] = useState(app.campusId ?? "")
  const [intakeId, setIntakeId] = useState(app.intakeId ?? "")
  const groups = coursesGroupedBySchool()
  const selected = groups.flatMap((g) => g.courses).find((c) => c.id === courseId) ?? course

  function save() {
    const nextBrand = selected.brand
    if (nextBrand !== app.brand) dispatch({ type: "SET_DEV", dev: { brand: nextBrand } })
    dispatch({
      type: "SET_FIELDS",
      fields: {
        brand: nextBrand,
        courseId: selected.id,
        campusId: campusId || (selected.campuses.length === 1 ? selected.campuses[0].id : undefined),
        intakeId: intakeId || undefined,
      },
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-[480px] rounded-t-3xl px-5 pb-safe pt-6 sm:rounded-b-3xl sm:bottom-6">
        <SheetHeader className="p-0">
          <SheetTitle className="font-heading text-2xl">Change course, campus or start date</SheetTitle>
          <SheetDescription>Your answers so far stay with you.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Course
            <NativeSelect
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value)
                setCampusId("")
                setIntakeId("")
              }}
            >
              {groups.map((g) => (
                <optgroup key={g.school} label={getBrand(g.brand).shortName}>
                  {g.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </NativeSelect>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Campus
            <NativeSelect value={campusId} onChange={(e) => setCampusId(e.target.value)}>
              <option value="">Choose a campus</option>
              {selected.campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.placesLeft === 0 ? " — waitlist" : c.placesLeft < 5 ? ` — ${c.placesLeft} places left` : ""}
                </option>
              ))}
            </NativeSelect>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Start date
            <NativeSelect value={intakeId} onChange={(e) => setIntakeId(e.target.value)}>
              <option value="">Choose a start date</option>
              {selected.intakes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </NativeSelect>
          </label>
          <PrimaryButton onClick={save} arrow={false}>
            Save
          </PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
