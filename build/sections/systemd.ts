import { z } from "zod"
import {
  DRY_RUN,
  emph,
  error,
  iniOptions,
  ModuleSection,
  run,
  section,
} from "../lib.ts"
import * as ini from "@std/ini"
import * as fs from "@std/fs"
import * as path from "@std/path"
import { toPascalCase } from "@std/text"

type ServiceConfig = z.infer<typeof ServiceConfigSchema>
const ServiceConfigSchema = z
  .record(
    z.string().describe("Section"),
    z.record(z.string().describe("Key"), z.any().describe("Value")),
  )
  .describe("Systemd service configuration")

const ServiceSchema = z
  .strictObject({
    type: z.enum(["system", "user"]).default("system").describe("Service type"),
    service: ServiceConfigSchema.optional(),
    enabled: z
      .boolean()
      .default(false)
      .describe("Whether the service should be enabled"),
  })
  .describe("Systemd service unit")

export type Service = z.infer<typeof SystemdServiceSchema>
const SystemdServiceSchema = ServiceSchema

const SystemdSchema = z
  .record(z.string().describe("Service name"), SystemdServiceSchema)
  .describe("Systemd services")

export default ModuleSection("systemd", {
  schema: SystemdSchema,
  state: new Map<string, Service>(),

  load(module, state) {
    const systemd = module.systemd
    if (!systemd) return

    for (const [name, service] of Object.entries(systemd)) {
      if (state.has(name)) {
        error(`Systemd service '${name}' is already defined.`)
      }

      section(`Create systemd ${service.type} service`, name)
      state.set(name, service)
    }
  },

  async execute(state) {
    for (const [name, service] of state.entries()) {
      await saveService(name, service)
      await enableService(name, service)
    }
  },
})

function convertCasing(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const newKey = toPascalCase(key)
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[newKey] = convertCasing(value as Record<string, unknown>)
    } else {
      result[newKey] = value
    }
  }
  return result
}

function getServicePath(name: string, service: Service): string {
  return service.type === "user"
    ? `/usr/lib/systemd/user/${name}.service`
    : `/usr/lib/systemd/system/${name}.service`
}

function getServiceContent(config: ServiceConfig): string {
  return ini.stringify(convertCasing(config), iniOptions)
}

async function saveService(name: string, service: Service) {
  if (!service.service) return
  const content = getServiceContent(service.service)
  const _path = getServicePath(name, service)

  section("Create systemd service", _path)
  console.log(content)
  if (DRY_RUN) return

  if (await fs.exists(_path)) {
    error(`Systemd service '${emph(name)}' already exists.`)
  }

  await fs.ensureDir(path.dirname(_path))
  await Deno.writeTextFile(_path, content, { createNew: true })
}

async function enableService(name: string, service: Service) {
  if (service.enabled) {
    const flag = service.type === "user" ? "--global" : ""
    await run(`systemctl ${flag} enable ${name}.service`)
  }
}
