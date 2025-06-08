import { z } from "zod"
import { emph, error, section } from "./lib.ts"
import { ModuleSchema, SectionOrder, Sections } from "./sections.ts"
import * as yaml from "@std/yaml"
import * as path from "@std/path"
import { yellow } from "@std/fmt/colors"

type SectionName = (typeof SectionOrder)[number]
export type Module = {
  [K in SectionName]?: z.infer<(typeof Sections)[K]["schema"]>
}

export type ModuleSectionOptions<T, S extends z.ZodType> = {
  /** Schema for the section */
  schema: S
  /** Load the module section */
  load: (cfg: z.infer<S>, module: Module) => void
}

export type ModuleSection<T, S extends z.ZodType> = {
  /** Name of the section */
  name: string
} & ModuleSectionOptions<T, S>

export function Section<T, S extends z.ZodType>(
  name: string,
  part: ModuleSectionOptions<T, S>,
): ModuleSection<T, S> {
  return { name, ...part }
}

export type Phase = (typeof phases)[number]
export const phases = ["initial", "standard", "finalize"] as const

const context = {
  base: null as string | null,
  dirname: "",
  modules: new Set<string>(),
  current: -1,
  stages: [] as Array<Record<Phase, string[]>>,
}

function setBase(base: string, dirname: string) {
  if (context.base) error("Base image is already set")
  section("BASE", base)
  context.base = base
  context.dirname = dirname
}

function startStage(path: string) {
  if (context.modules.has(path)) {
    error(`Stage "${emph(path)}" already exists`)
  }

  context.current = context.stages.length
  context.stages.push({
    initial: [],
    standard: [],
    finalize: [],
  })

  loadModule(path)
}

function instruction(instr: string, args: string, phase?: Phase) {
  if (context.current < 0) error("No stage is currently active")
  const stage = context.stages[context.current]
  if (phase) section(`${phase.toUpperCase()} ${instr}`, args)
  else section(instr, args)

  switch (phase ?? "standard") {
    case "initial":
      stage.initial.push(`${instr} ${args}`)
      break
    case "standard":
      stage.standard.push(`${instr} ${args}`)
      break
    case "finalize":
      stage.finalize.push(`${instr} ${args}`)
      break
  }
}

function run(cmd: string, phase?: Phase) {
  instruction("RUN", `${cmd.trimEnd()} && ostree container commit`, phase)
}

function copy(
  src: string,
  dest: string,
  options?: { chmod?: string; chown?: string },
  phase?: Phase,
) {
  const params = [
    options?.chown && `--chown=${options.chown}`,
    options?.chmod && `--chmod=${options.chmod}`,
    src,
    dest,
  ]

  const args = params.filter(Boolean).join(" ")
  instruction("COPY", args, phase)
}

function file(
  _path: string,
  content: string,
  options?: { chmod?: string; chown?: string; ensureDir?: boolean },
  phase?: Phase,
) {
  if (options?.ensureDir) {
    run(`mkdir -p ${path.dirname(_path)}`, phase)
  }
  // Don't use `run` here, as it would not work with `ostree container commit`
  instruction(
    "RUN",
    `cat <<~~EOF~~ > ${_path}\n${content.trimEnd()}\n~~EOF~~`,
    phase,
  )
  if (options?.chown) run(`chown ${options.chown} ${_path}`)
  if (options?.chmod) run(`chmod ${options.chmod} ${_path}`)
}

function loadModule(impPath: string) {
  const modPath = path.resolve(
    context.dirname,
    impPath,
    path.extname(impPath) === "" ? "module.yaml" : "",
  )

  section("MODULE", emph(modPath))

  if (context.modules.has(modPath)) {
    console.warn(
      yellow("Warning: "),
      `Module '${emph(modPath)}' already exists. Skipping.`,
    )
    return
  }

  const content = Deno.readTextFileSync(modPath)
  const module = parseModule(content, modPath)

  context.modules.add(modPath)
  const dirname = context.dirname
  context.dirname = path.dirname(modPath)
  loadSections(module)
  context.dirname = dirname
}

function parseModule(content: string, modPath: string): Module {
  try {
    return ModuleSchema.parse(yaml.parse(content))
  } catch (err) {
    if (!(err instanceof z.ZodError)) throw err

    const issues = [] as string[]
    for (const issue of err.issues) {
      const key = issue.path.join(".")
      issues.push(`  ${emph(key)}: ${issue.message} (${issue.code})`)
      if ("note" in issue) issues.push(`    Note: ${issue.note}`)
    }

    error(
      `Validation error in module '${emph(modPath)}':\n` + issues.join("\n"),
    )
  }
}

function loadSections(module: Module): void {
  const keys = Object.keys(module) as (keyof typeof Sections)[]
  const unknownKeys = keys.filter((key) => !Object.keys(Sections).includes(key))

  if (unknownKeys.length > 0) {
    error(`Unknown fields in module: ${emph(unknownKeys.join(", "))}`)
  }

  for (const name of SectionOrder) {
    const _section = Sections[name]
    const cfg = module[name]
    if (cfg === undefined) continue
    // @ts-ignore: TypeScript cannot infer the type of `cfg` correctly
    _section.load?.(cfg, module)
  }
}

function execute(version: string) {
  if (!context.base) error("Base image is not set.")
  console.log("FROM", context.base)

  for (const stage of context.stages) {
    for (const phase of phases) {
      for (const instr of stage[phase]) {
        console.log(instr)
      }
    }
  }

  console.log(`COPY . /usr/lib/azari/current`)

  console.log("RUN ostree container commit")
  console.log("RUN bootc container lint")

  console.log(`LABEL org.opencontainers.image.version ${version}`)
  console.log("LABEL containers.bootc 1")
  console.log("STOPSIGNAL SIGRTMIN+3")
  console.log('CMD ["/sbin/init"]')
}

export const builder = {
  get dirpath() {
    return context.dirname
  },
  setBase,
  startStage,
  loadModule,
  instruction,
  run,
  copy,
  file,
  execute,
}
