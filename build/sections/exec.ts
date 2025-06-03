import { z } from "zod"
import { error, ModuleSection, run, section } from "../lib.ts"

// export const early = makeSection(
//   "early",
//   "Commands to execute before any other section",
// )

// export const preInstall = makeSection(
//   "pre-install",
//   "Commands to execute before packages installation",
// )

// export const postInstall = makeSection(
//   "post-install",
//   "Commands to execute after packages installation",
// )

// export const late = makeSection(
//   "late",
//   "Commands to execute after all other sections",
// )

const phases = ["early", "pre-install", "post-install", "late"] as const

export default ModuleSection("exec", {
  schema: z
    .strictObject({
      phase: z.enum(phases).describe("Phase of the installation"),
      command: z
        .string()
        .or(z.array(z.string()))
        .describe("Command(s) to execute"),
    })
    .describe("Commands to execute at various phases of the installation"),

  state: {
    phase: 0,
    early: [] as string[],
    "pre-install": [] as string[],
    "post-install": [] as string[],
    late: [] as string[],
  },

  load(module, state) {
    const exec = module.exec
    if (!exec) return
    section("Execute commands", `${exec.phase} phase`)

    if (Array.isArray(exec.command)) {
      console.log(exec.command.join("\n"))
      state[exec.phase].push(...exec.command)
    } else {
      console.log(exec.command)
      state[exec.phase].push(exec.command)
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
