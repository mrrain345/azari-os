import "./sections.ts"
import { red } from "@std/fmt/colors"
import * as path from "@std/path"
import * as yaml from "@std/yaml"
import { z } from "zod"
import { builder } from "./builder.ts"
import { error } from "./lib.ts"

type Manifest = z.infer<typeof ManifestSchema>
const ManifestSchema = z.strictObject({
  manifest: z.strictObject({
    base: z.string().describe("Base OCI image"),
    stages: z.array(z.string()).describe("Stages to build"),
  }),
})

function loadManifest(manifestPath: string): Manifest {
  const content = Deno.readTextFileSync(manifestPath)
  const parsed = yaml.parse(content)
  return ManifestSchema.parse(parsed)
}

function main() {
  if (Deno.args.length !== 2) {
    error("Required arguments: <manifest-file> <version>")
  }

  const [manifestFile, version] = Deno.args

  const manifestPath = path.resolve(manifestFile)
  const { manifest } = loadManifest(manifestPath)
  const dirname = path.dirname(manifestPath)
  builder.setBase(manifest.base, dirname)

  for (const stage of manifest.stages) {
    const modPath = path.resolve(dirname, stage)
    builder.startStage(modPath)
  }

  builder.execute(version)
}

function handleError(err: unknown): never {
  if (err instanceof Error) {
    console.error(red(err.stack ?? err.message))
  } else {
    console.error(red("Unknown error:"), String(err))
  }
  Deno.exit(1)
}

try {
  main()
} catch (err) {
  handleError(err)
}
