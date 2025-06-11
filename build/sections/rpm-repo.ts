import { z } from "zod"
import * as ini from "@std/ini"
import { builder, Section } from "../builder.ts"

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

export default Section("rpm-repo", {
  schema: z.record(z.string().describe("Repository id"), RepoConfigSchema),

  load(repos) {
    for (const [id, repo] of Object.entries(repos)) {
      const repoPath = `/etc/yum.repos.d/${id}.repo`
      builder.run(`rpm --import ${repo.gpgkey}`, "initial")
      const content = ini.stringify({ [id]: repo })
      builder.file(repoPath, content.replace(/\$/g, "\\$"), {}, "initial")
    }
  },
})
