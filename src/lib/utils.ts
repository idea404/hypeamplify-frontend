import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize server-provided ISO timestamps into a Date in UTC.
// Many backends serialize without a timezone suffix (e.g. "YYYY-MM-DDTHH:mm:ss.SSSSSS")
// which JavaScript interprets as LOCAL time. We treat such strings as UTC by appending 'Z'.
// Also clamp fractional seconds to 3 digits for JS Date compatibility.
export function normalizeServerDate(input: string | Date): Date {
  if (input instanceof Date) return input
  if (typeof input !== 'string') return new Date(input as any)

  let iso = input.trim()
  // Reduce microseconds to milliseconds (max 3 digits)
  iso = iso.replace(/\.(\d{3})\d+$/, '.$1')

  // If no timezone specified (neither 'Z' nor ±HH:MM), assume UTC
  const hasTimeZone = /Z$|[+-]\d{2}:?\d{2}$/.test(iso)
  if (!hasTimeZone) {
    iso = iso + 'Z'
  }

  return new Date(iso)
}
