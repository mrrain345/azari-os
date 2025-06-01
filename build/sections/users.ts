import { z } from "zod"
import { ModuleSection, run } from "../lib.ts"

export type User = z.infer<typeof UserSchema>
const UserSchema = z.strictObject({
  uid: z.number().optional().describe("User ID"),
  gid: z.number().optional().describe("Group ID"),
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

export default ModuleSection("users", {
  schema: UsersSchema,
  state: new Map<string, User>(),

  load(module, state) {
    const users = module.users
    if (!users) return

    for (const [username, user] of Object.entries(users)) {
      if (state.has(username)) {
        throw new Error(`User '${username}' is already defined.`)
      }
      state.set(username, user)
    }
  },

  async execute(state) {
    for (const [username, user] of state.entries()) {
      const { uid, gid, home, shell, fullname, groups } = user

      if (gid) run(`groupadd --gid ${gid} ${username}`)

      for (const group of groups || []) {
        await run(`groupadd --system --force ${group}`)
      }

      const cmd = [
        "useradd",
        "--no-create-home",
        uid && `-u ${uid}`,
        gid && `-g ${gid}`,
        home && `-d ${home}`,
        shell && `-s ${shell}`,
        fullname && `-c "${fullname}"`,
        groups && `-G ${groups.join(",")}`,
        username,
      ]

      await run(cmd.filter(Boolean).join(" "))
      // No password, force password change on first login
      await run(`passwd -de ${username}`)
    }
  },
})
