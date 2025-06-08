import { green, yellow, bold, red } from "@std/fmt/colors"

const VERBOSE = false

export const iniOptions = {
  replacer(key: string, value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(String).join(`\n${key}=`)
    } else {
      return String(value)
    }
  },
}

export function section(label: string, text: string) {
  if (!VERBOSE) return
  console.warn(green(label), text)
}

export function error(err: string, code?: number): never {
  console.error(red(bold("Error: ") + err))
  Deno.exit(code ?? 1)
}

export function emph(text: string): string {
  return yellow(bold(text))
}
