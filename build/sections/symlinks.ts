import { z } from "zod"
import { builder, Section } from "../builder.ts"

export default Section("symlinks", {
  schema: z.record(
    z.string().describe("Source path"),
    z
      .string()
      .describe("Target path")
      .or(
        z.strictObject({
          target: z.string().describe("Target path"),
          "remove-existing": z
            .boolean()
            .default(false)
            .describe("Remove existing files on source path"),
        }),
      ),
  ),

  load(symlinks) {
    for (const [src, target] of Object.entries(symlinks)) {
      if (typeof target === "string") {
        builder.run(`ln -s ${target} ${src}`)
      } else {
        if (target["remove-existing"]) {
          builder.run(`rm -rf ${src}`)
        }

        builder.run(`ln -s ${target.target} ${src}`)
      }
    }
  },
})
