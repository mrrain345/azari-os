import { emph, error, Module, ModuleSection, section } from "../lib.ts"
import * as path from "@std/path"
import * as yaml from "@std/yaml"
import { z } from "zod"
import { ModuleSchema, SectionOrder, Sections } from "../sections.ts"
import { yellow } from "@std/fmt/colors"

const modules = new Map<string, Module>()

export default ModuleSection("import", {
  schema: z.array(z.string()).describe("Modules to import"),
  state: modules,

  load(module, state, modPath) {
    if (!module.import) return
    const dir = path.dirname(modPath)

    for (const importPath of module.import) {
      const impPath = path.resolve(
        dir,
        importPath,
        path.extname(importPath) === "" ? "module.yaml" : "",
      )

      if (state.has(impPath)) {
        warnExists(impPath)
        continue
      }

      section("Import", impPath)
      loadModule(impPath)
    }
  },
})

export function loadModule(modPath: string) {
  if (modules.has(modPath)) {
    error(`Module '${emph(modPath)}' is already loaded.`)
  }

  const content = Deno.readTextFileSync(modPath)
  const module = parseModule(content, modPath)
  modules.set(modPath, module)
  loadSections(module, modPath)
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

function warnExists(path: string) {
  console.warn(
    yellow("Warning: "),
    `Module '${emph(path)}' already exists. Skipping.`,
  )
}

function loadSections(module: Module, modPath: string): void {
  const keys = Object.keys(module) as (keyof typeof Sections)[]
  const unknownKeys = keys.filter((key) => !Object.keys(Sections).includes(key))

  if (unknownKeys.length > 0) {
    error(`Unknown fields in module: ${emph(unknownKeys.join(", "))}`)
  }

  for (const name of SectionOrder) {
    const _section = Sections[name]
    const state = _section.state
    // @ts-ignore: TypeScript cannot infer the type of `state` correctly
    _section.load?.(module, state, modPath)
  }
}

export async function executeSections() {
  for (const name of SectionOrder) {
    const _section = Sections[name]
    const state = _section.state
    // @ts-ignore: TypeScript cannot infer the type of `state` correctly
    await _section.execute?.(state)
  }
}
