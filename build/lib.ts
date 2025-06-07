import { green, yellow, bold, red } from "@std/fmt/colors"
import * as cli from "@std/cli"
import { z } from "zod"
import { SectionOrder, Sections } from "./sections.ts"

type SectionName = (typeof SectionOrder)[number]
export type Module = {
  [K in SectionName]?: z.infer<(typeof Sections)[K]["schema"]>
}

export type ModuleSectionOptions<N extends string, T, S extends z.ZodType> = {
  /** Schema for the section */
  schema: S
  /** Internal state of the section shared across all modules */
  state: T
  /** Load the module section */
  load?: (
    module: Module & { [key in N]: z.infer<S> },
    state: T,
    modPath: string,
  ) => void
  /** Execute the section for all modules */
  execute?: (state: T) => void | Promise<void>
}

export type ModuleSection<N extends string, T, S extends z.ZodType> = {
  /** Name of the section */
  name: N
} & ModuleSectionOptions<N, T, S>

export function ModuleSection<N extends string, T, S extends z.ZodType>(
  name: N,
  part: ModuleSectionOptions<N, T, S>,
): ModuleSection<N, T, S> {
  return { name, ...part }
}

export function getArgs() {
  const args = cli.parseArgs(Deno.args, { boolean: ["dry"] })

  return {
    dryRun: args.dry,
    modPath: String(args._[0] ?? "../module.yaml"),
  }
}

export const DRY_RUN = getArgs().dryRun

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
  console.log(green(label), text)
}

export function error(err: string, code?: number): never {
  console.error(red(bold("Error: ") + err))
  Deno.exit(code ?? 1)
}

export function emph(text: string): string {
  return yellow(bold(text))
}

export async function run(cmd: string) {
  section("Run", cmd)
  if (DRY_RUN) return

  const command = new Deno.Command("/bin/sh", { args: ["-c", cmd] })
  const child = command.spawn()
  const status = await child.status

  if (!status.success) {
    const name = cmd.split(" ")[0]
    error(
      `Command '${emph(name)}' failed with exit code ${status.code}`,
      status.code,
    )
  }
}
