import { z } from "zod"
import { builder, Section } from "../builder.ts"

export default Section("packages", {
  schema: z.array(z.string()).describe("RPM packages to install"),

  load(packages) {
    builder.run(`dnf install -y ${packages.join(" ")}`)
  },
})
