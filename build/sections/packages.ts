import { z } from "zod"
import { ModuleSection, section, run } from "../lib.ts"

export default ModuleSection("packages", {
  schema: z.array(z.string()).describe("RPM packages to install"),
  state: [] as string[],

  load(module, state) {
    const pkgs = module.packages
    if (!pkgs) return
    section("Install packages:", pkgs.join(" "))
    state.push(...pkgs)
  },

  async execute(state) {
    if (state.length === 0) return
    await run(`dnf install -y ${state.join(" ")}`)
  },
})
