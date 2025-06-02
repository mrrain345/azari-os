import { z } from "zod"
import { DRY_RUN, emph, error, ModuleSection, run, section } from "../lib.ts"
import * as fs from "@std/fs"

export default ModuleSection("symlinks", {
  schema: z.record(
    z.string().describe("Source path"),
    z.string().describe("Target path"),
  ),
  state: new Map<string, string>(),

  load(module, state) {
    if (!module.symlinks) return

    for (const [src, target] of Object.entries(module.symlinks ?? {})) {
      if (state.has(src)) {
        error(`Symlink "${emph(src)}" already exists in state. `)
      }

      section("Create symlink", `${src} -> ${target}`)
      state.set(src, target)
    }
  },

  async execute(state) {
    for (const [src, target] of state.entries()) {
      section("Symlink", `${src} -> ${target}`)
      if (!DRY_RUN && (await fs.exists(src))) {
        section("Remove existing file:", src)
        await Deno.remove(src)
      }

      await run(`ln -s ${target} ${src}`)
    }
  },
})
