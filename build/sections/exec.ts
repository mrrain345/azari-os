import { z } from "zod"
import { builder, Section, phases } from "../builder.ts"

const ExecPhaseSchema = z
  .strictObject({
    phase: z
      .enum(phases)
      .default("standard")
      .describe("Phase of the installation"),
    command: z
      .string()
      .or(z.array(z.string()))
      .describe("Command(s) to execute"),
  })
  .describe("Commands to execute at various phases of the installation")

const ExecSimpleSchema = z
  .string()
  .or(z.array(z.string()))
  .describe("Commands to execute at the standard phase")

export default Section("exec", {
  schema: z.union([
    ExecPhaseSchema,
    z.array(ExecPhaseSchema),
    ExecSimpleSchema,
  ]),

  load(exec) {
    const execs = Array.isArray(exec) ? exec : [exec]
    for (const ex of execs) {
      if (typeof ex === "string") builder.run(ex)
      else {
        const cmds = Array.isArray(ex.command) ? ex.command : [ex.command]
        for (const cmd of cmds) {
          builder.run(cmd, ex.phase)
        }
      }
    }
  },
})
