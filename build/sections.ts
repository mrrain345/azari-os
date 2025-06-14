import { z } from "zod"

import _import from "./sections/import.ts"
import files from "./sections/files.ts"
import symlinks from "./sections/symlinks.ts"
import users from "./sections/users.ts"
import rpmRepo from "./sections/rpm-repo.ts"
import copr from "./sections/copr.ts"
import packages from "./sections/packages.ts"
import systemd from "./sections/systemd.ts"
import raw from "./sections/raw.ts"
import exec from "./sections/exec.ts"

/**
 * Order in which sections should be executed.
 */
export const SectionOrder = [
  "import",
  "files",
  "symlinks",
  "users",
  "rpm-repo",
  "copr",
  "packages",
  "systemd",
  "raw",
  "exec",
] as const

/**
 * Module sections.
 */
export const Sections = {
  import: _import,
  files,
  symlinks,
  users,
  "rpm-repo": rpmRepo,
  copr,
  packages,
  systemd,
  raw,
  exec,
}

export const ModuleSchema = z
  .strictObject(
    Object.fromEntries(
      Object.entries(Sections).map(([key, section]) => [key, section.schema]),
    ),
  )
  .partial()
