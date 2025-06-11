import { z } from "zod"
import { builder, Section } from "../builder.ts"

export default Section("raw", {
  schema: z.string().describe("Execute a raw build instruction"),

  load(raw) {
    const [instr, ...args] = raw.split(" ")
    builder.instruction(instr, args.join(" "))
  },
})
