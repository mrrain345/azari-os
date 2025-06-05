import { z } from "zod"
import { error, ModuleSection, run, section } from "../lib.ts"

const phases = ["early", "pre-install", "post-install", "late"] as const

const ExecSchema = z.strictObject({
  phase: z.enum(phases).describe("Phase of the installation"),
  command: z.string().or(z.array(z.string())).describe("Command(s) to execute"),
})

export default ModuleSection("exec", {
  schema: ExecSchema.or(z.array(ExecSchema)).describe(
    "Commands to execute at various phases of the installation",
  ),

  state: {
    phase: 0,
    early: [] as string[],
    "pre-install": [] as string[],
    "post-install": [] as string[],
    late: [] as string[],
    loaded: new Set<string>(),
  },

  load(module, state, modPath) {
    const exec = module.exec
    if (!exec) return

    if (state.loaded.has(modPath)) return
    state.loaded.add(modPath)

    const execs = Array.isArray(exec) ? exec : [exec]
    for (const ex of execs) {
      section("Execute commands", `${ex.phase} phase`)

      if (Array.isArray(ex.command)) {
        console.log(ex.command.join("\n"))
        state[ex.phase].push(...ex.command)
      } else {
        console.log(ex.command)
        state[ex.phase].push(ex.command)
      }
    }
  },

  async execute(state) {
    const phase = state.phase
    if (phase >= phases.length) {
      error("Invalid execution phase")
    }

    const cmds = state[phases[phase]]
    state.phase += 1
    if (cmds.length === 0) return

    section("Execute commands", `${phases[phase]} phase`)
    for (const cmd of cmds) {
      await run(cmd)
    }
  },
})
