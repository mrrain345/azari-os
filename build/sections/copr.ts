import { z } from "zod"
import { run, ModuleSection, section } from "../lib.ts"

export default ModuleSection("copr", {
  schema: z.array(z.string()).describe("Copr repositories to enable"),
  state: [] as string[],

  load(module, state) {
    const copr = module.copr
    if (!copr) return
    section("Enable COPR repo", copr.join(" "))
    state.push(...copr)
  },

  async execute(state) {
    await run("dnf install -y 'dnf5-command(copr)'")

    for (const repo of state) {
      await run(`dnf copr enable -y ${repo}`)
    }
  },
})
