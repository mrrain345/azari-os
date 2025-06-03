import { z } from "zod"

import _import from "./sections/import.ts"
import symlinks from "./sections/symlinks.ts"
import rpmRepo from "./sections/rpm-repo.ts"
import copr from "./sections/copr.ts"
import packages from "./sections/packages.ts"
import users from "./sections/users.ts"
import files from "./sections/files.ts"
import systemd from "./sections/systemd.ts"
import exec from "./sections/exec.ts"

/**
 * Order in which sections should be executed.
 */
export const SectionOrder = [
  "import",
  "exec", // early
  "symlinks",
  "users",
  "rpm-repo",
  "copr",
  "exec", // pre-install
  "packages",
  "exec", // post-install
  "files",
  "systemd",
  "exec", // late
] as const

/**
 * Module sections.
 */
export const Sections = {
  import: _import,
  exec,
  symlinks,
  users,
  "rpm-repo": rpmRepo,
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
