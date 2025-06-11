import { z } from "zod"
import { builder, Section } from "../builder.ts"

let enabled = false

export default Section("copr", {
  schema: z.array(z.string()).describe("Copr repositories to enable"),

  load(copr) {
    if (!enabled) {
      enabled = true
      builder.run("dnf install -y 'dnf5-command(copr)'", "initial")
    }

    for (const repo of copr) {
      builder.run(`dnf copr enable -y ${repo}`, "initial")
    }
  },
})
