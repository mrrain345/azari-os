import { z } from "zod"

import _import from "./sections/import.ts"
import users from "./sections/users.ts"
import copr from "./sections/copr.ts"
import packages from "./sections/packages.ts"
import files from "./sections/files.ts"
import systemd from "./sections/systemd.ts"

/**
 * Order in which sections should be executed.
 */
export const SectionOrder = [
  "import",
  "copr",
  "packages",
  "users",
  "files",
  "systemd",
] as const

/**
 * Module sections.
 */
export const Sections = {
  import: _import,
  users,
  copr,
  packages,
  files,
  systemd,
}

export const ModuleSchema = z
  .strictObject(
    Object.fromEntries(
      Object.entries(Sections).map(([key, section]) => [key, section.schema]),
    ),
  )
  .partial()
