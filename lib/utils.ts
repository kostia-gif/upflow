import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shared width/chrome classes for the "phone frame" screens (course page, apply flow,
 * international page). Toggled by the prototype's "Full desktop view" control so reviewers
 * can see the flow at a comfortable desktop width instead of a centered phone mockup.
 */
export function frameClass(desktopView: boolean) {
  return desktopView
    ? "max-w-3xl sm:rounded-2xl sm:border sm:border-border sm:shadow-sm"
    : "max-w-[480px] sm:rounded-3xl sm:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.25)]"
}
