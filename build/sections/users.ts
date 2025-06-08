import { z } from "zod"
import { builder, Section } from "../builder.ts"

export type User = z.infer<typeof UserSchema>
const UserSchema = z.strictObject({
  uid: z.number().optional().describe("User ID"),
  home: z.string().optional().describe("Home directory"),
  shell: z.string().optional().describe("Shell"),
  fullname: z.string().optional().describe("Full name"),
  groups: z
    .array(z.string())
    .optional()
    .describe("Extra groups the user belongs to"),
})

const UsersSchema = z
  .record(z.string().describe("Username"), UserSchema)
  .describe("Users to create")

export default Section("users", {
  schema: UsersSchema,

  load(users) {
    for (const [username, user] of Object.entries(users)) {
      const { uid, home, shell, fullname, groups } = user

      for (const group of groups ?? []) {
        builder.run(`groupadd --system --force ${group}`)
      }

      const cmd = [
        "useradd",
        uid && `-u ${uid}`,
        home && `-d ${home}`,
        shell && `-s ${shell}`,
        fullname && `-c "${fullname}"`,
        groups && `-G ${groups.join(",")}`,
        username,
      ]

      builder.run(cmd.filter(Boolean).join(" "))
      builder.run(`passwd -d ${username}`)
    }
  },
})
