import { z } from "zod"
import { builder, Section } from "../builder.ts"

export default Section("symlinks", {
  schema: z.record(
    z.string().describe("Source path"),
    z.string().describe("Target path"),
  ),

  load(symlinks) {
    for (const [src, target] of Object.entries(symlinks)) {
      builder.run(`ln -s ${target} ${src}`)
    }
  },
})
