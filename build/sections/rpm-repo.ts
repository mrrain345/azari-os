import { z } from "zod"
import { DRY_RUN, emph, error, ModuleSection, run, section } from "../lib.ts"
import * as fs from "@std/fs"
import * as path from "@std/path"
import * as ini from "@std/ini"

type RepoConfig = z.infer<typeof RepoConfigSchema>
const RepoConfigSchema = z
  .strictObject({
    name: z.string().describe("A human readable descriptive name"),
    baseurl: z.string().describe("Base URL for the repository"),
    gpgkey: z.string().nullable().describe("GPG key URL for the repository"),
    enabled: z
      .boolean()
      .default(true)
      .describe("Whether the repository is enabled"),
    gpgcheck: z
      .boolean()
      .default(true)
      .describe("Whether to check GPG signatures"),
  })
  .describe("RPM Repository configuration")

export default ModuleSection("rpm-repo", {
  schema: z.record(z.string().describe("Repository id"), RepoConfigSchema),
  state: new Map<string, RepoConfig>(),

  load(module, state) {
    if (!module["rpm-repo"]) return
    const repos = module["rpm-repo"]

    for (const [id, repo] of Object.entries(repos)) {
      if (state.has(id)) {
        error(`Repository '${emph(id)}' already defined.`)
      }

      if (repo.gpgkey === null && repo.gpgcheck) {
        error(
          `Repository '${emph(id)}' has 'gpgcheck' enabled but no 'gpgkey' provided.`,
        )
      }

      state.set(id, repo)
    }
  },

  async execute(state) {
    for (const [id, repo] of state.entries()) {
      const repoPath = `/etc/yum.repos.d/${id}.repo`

      if (await fs.exists(repoPath)) {
        error(`Repository file '${emph(repoPath)}' already exists.`)
      }

      await run(`rpm --import ${repo.gpgkey}`)

      const content = ini.stringify({ [id]: repo })
      section("Create file", repoPath)
      console.log(content)

      if (!DRY_RUN) {
        await fs.ensureDir(path.dirname(repoPath))
        await Deno.writeTextFile(repoPath, content)
      }
    }

    // Refresh the repository metadata
    // suppress exit code 100, which means no updates available
    // but don't suppress other errors
    await run("dnf check-update || [ $? -eq 100 ]")
  },
})
