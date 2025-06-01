import "./sections.ts"
import { red } from "@std/fmt/colors"
import { executeSections, loadModule } from "./sections/import.ts"
import { getArgs } from "./lib.ts"
import * as path from "@std/path"

async function main() {
  const { modPath } = getArgs()
  loadModule(path.resolve(modPath))
  console.log("")
  await executeSections()
}

function handleError(err: unknown): never {
  if (err instanceof Error) {
    console.error(red(err.stack ?? err.message))
  } else {
    console.error(red("Unknown error:"), String(err))
  }
  Deno.exit(1)
}

main().catch(handleError)
