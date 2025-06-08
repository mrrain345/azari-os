import { emph, error, iniOptions } from "../lib.ts"
import { z } from "zod"
import * as yaml from "@std/yaml"
import * as ini from "@std/ini"
import * as toml from "@std/toml"
import { builder, Section } from "../builder.ts"

export type FileFormat = z.infer<typeof FileFormatSchema>
export const FileFormatSchema = z
  .enum(["plain", "json", "yaml", "ini", "toml"])
  .default("plain")
  .describe("File format")

export type File = z.infer<typeof FileSchema>
export const FileSchema = z.strictObject({
  format: FileFormatSchema,
  path: z
    .string()
    .optional()
    .describe("Path to the source file, relative to the root directory"),
  content: z.any().optional().describe("File content"),
  "ensure-dir": z
    .boolean()
    .default(false)
    .describe("Ensure the directory exists before creating the file"),
  chmod: z.number().optional().describe("File mode"),
  chown: z
    .strictObject({
      owner: z.string().or(z.number()).describe("Owner of the file"),
      group: z.string().or(z.number()).describe("Group of the file"),
    })
    .optional(),
})

const FilesSchema = z
  .record(z.string().describe("Path to the file"), FileSchema)
  .describe("Files to create")

export default Section("files", {
  schema: FilesSchema,
  // state: new Map<string, { content: string; mode: number }>(),

  load(files) {
    for (const [filePath, file] of Object.entries(files)) {
      if (file.path && file.content) {
        error(
          `File cannot have both '${emph("path")}' and '${emph(
            "content",
          )}' defined.`,
        )
      }

      if (!file.path && !file.content) {
        error(
          `File must have either '${emph("path")}' or '${emph(
            "content",
          )}' defined.`,
        )
      }

      const chmod = file.chmod !== undefined ? String(file.chmod) : undefined
      const chown = file.chown && `${file.chown.owner}:${file.chown.group}`

      if (file.path) {
        builder.copy(file.path, filePath, { chmod, chown })
      } else if (file.content) {
        const content = parseFile(file.format, file.content)
        builder.file(filePath, content, {
          chmod,
          chown,
          ensureDir: file["ensure-dir"],
        })
      }
    }
  },
})

function parseFile(format: FileFormat, content: unknown): string {
  switch (format) {
    case "plain":
      return String(content)
    case "json":
      return JSON.stringify(content, null, 2)
    case "yaml":
      return yaml.stringify(content)
    case "ini":
      return ini.stringify(content, iniOptions)
    case "toml":
      return toml.stringify(content as Record<string, unknown>)
    default:
      error(`Unsupported file format: ${emph(format)}`)
  }
}
