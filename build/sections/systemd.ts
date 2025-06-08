import { z } from "zod"
import { iniOptions } from "../lib.ts"
import * as ini from "@std/ini"
import { toPascalCase } from "@std/text"
import { builder, Section } from "../builder.ts"

type ServiceConfig = z.infer<typeof ServiceConfigSchema>
const ServiceConfigSchema = z
  .record(
    z.string().describe("Section"),
    z.record(z.string().describe("Key"), z.any().describe("Value")),
  )
  .describe("Systemd service configuration")

type SystemdService = z.infer<typeof SystemdServiceSchema>
const SystemdServiceSchema = z
  .strictObject({
    type: z.enum(["system", "user"]).default("system").describe("Service type"),
    service: ServiceConfigSchema.optional(),
    enabled: z
      .boolean()
      .default(false)
      .describe("Whether the service should be enabled"),
  })
  .describe("Systemd service unit")

const SystemdSchema = z
  .strictObject({
    services: z
      .record(z.string().describe("Service name"), SystemdServiceSchema)
      .describe("Systemd services"),
  })
  .partial()
  .describe("Systemd configuration")

export default Section("systemd", {
  schema: SystemdSchema,

  load(systemd) {
    for (const [name, service] of Object.entries(systemd.services ?? {})) {
      if (service.service) {
        const content = getServiceContent(service.service)
        const _path = getServicePath(name, service)
        builder.file(_path, content)
      }

      if (service.enabled) {
        const flag = service.type === "user" ? "--global" : ""
        builder.run(`systemctl ${flag} enable ${name}.service`)
      }
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

function getServicePath(name: string, service: SystemdService): string {
  return service.type === "user"
    ? `/usr/lib/systemd/user/${name}.service`
    : `/usr/lib/systemd/system/${name}.service`
}

function getServiceContent(config: ServiceConfig): string {
  return ini.stringify(convertCasing(config), iniOptions)
}
