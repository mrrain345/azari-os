import {
  DRY_RUN,
  ModuleSection,
  emph,
  error,
  iniOptions,
  section,
} from "../lib.ts"
import { z } from "zod"
import * as path from "@std/path"
import * as fs from "@std/fs"
import * as yaml from "@std/yaml"
import * as ini from "@std/ini"
import * as toml from "@std/toml"

export type FileFormat = z.infer<typeof FileFormatSchema>
export const FileFormatSchema = z
  .enum(["plain", "json", "yaml", "ini", "toml"])
  .default("plain")
  .describe("File format")

export type File = z.infer<typeof FileSchema>
export const FileSchema = z.strictObject({
  format: FileFormatSchema,
  path: z.string().optional().describe("Path to the source file"),
  content: z.any().optional().describe("File content"),
})

const FilesSchema = z
  .record(z.string().describe("Path to the file"), FileSchema)
  .describe("Files to create")

export default ModuleSection("files", {
  schema: FilesSchema,
  state: new Map<string, string>(),

  load(module, state, _path) {
    const files = module.files
    if (!files) return

    for (const [filePath, file] of Object.entries(files)) {
      section("Create file", filePath)

      if (state.has(filePath)) {
        error(`File '${emph(filePath)}' is already defined.`)
      }

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

      if (file.path) {
        const sourcePath = path.resolve(_path, file.path)
        const content = Deno.readTextFileSync(sourcePath)
        state.set(filePath, content)
      } else if (file.content) {
        const content = parseFile(file.format, file.content)
        state.set(filePath, content)
      }
    }
  },

  async execute(state) {
    for (const [filePath, content] of state.entries()) {
      section("Create file", filePath)
      console.log(content)
      if (DRY_RUN) continue

      const newline = content[content.length - 1] === "\n" ? "" : "\n"
      await fs.ensureDir(path.dirname(filePath))
      await Deno.writeTextFile(filePath, content + newline)
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
