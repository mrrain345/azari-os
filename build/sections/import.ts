import { z } from "zod"
import { builder, Section } from "../builder.ts"

export default Section("import", {
  schema: z.array(z.string()).describe("Modules to import"),

  load(imports) {
    for (const path of imports) {
      builder.loadModule(path)
    }
  },
})
