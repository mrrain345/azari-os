import { z } from "zod"

import _import from "./sections/import.ts"
import symlinks from "./sections/symlinks.ts"
import rpmRepo from "./sections/rpm-repo.ts"
import copr from "./sections/copr.ts"
import packages from "./sections/packages.ts"
import users from "./sections/users.ts"
import files from "./sections/files.ts"
import systemd from "./sections/systemd.ts"

/**
 * Order in which sections should be executed.
 */
export const SectionOrder = [
  "import",
  "symlinks",
  "rpm-repo",
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
  symlinks,
  "rpm-repo": rpmRepo,
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
