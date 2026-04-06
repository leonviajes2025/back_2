import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "..");
const docsPath = resolve(workspaceRoot, "data", "api-docs.json");
const postmanPath = resolve(workspaceRoot, "postman", "back_2.postman_collection.json");
const readmePath = resolve(workspaceRoot, "README.md");
const readmeStartMarker = "<!-- api-docs:start -->";
const readmeEndMarker = "<!-- api-docs:end -->";
const isCheckMode = process.argv.includes("--check");

const docs = JSON.parse(readFileSync(docsPath, "utf8"));

function buildRequest(endpoint) {
  const request = {
    method: endpoint.method,
    url: `{{baseUrl}}${endpoint.postmanPath ?? endpoint.path}`,
  };

  if (endpoint.exampleBody || endpoint.postmanBody) {
    request.header = [
      {
        key: "Content-Type",
        value: "application/json",
      },
    ];
    request.body = {
      mode: "raw",
      raw: endpoint.postmanBody ?? endpoint.exampleBody,
    };
  }

  return request;
}

function buildEvent(endpoint) {
  if (!endpoint.postmanTestScript || endpoint.postmanTestScript.length === 0) {
    return undefined;
  }

  return [
    {
      listen: "test",
      script: {
        type: "text/javascript",
        exec: endpoint.postmanTestScript,
      },
    },
  ];
}

function formatField(field) {
  const requiredLabel = field.required ? "obligatorio" : "opcional";

  return `- ${field.name} (${field.type}, ${requiredLabel}): ${field.description}`;
}

function formatEndpointSection(endpoint) {
  const lines = [
    `- ${endpoint.method} ${endpoint.path}`,
    `  - Funcion: ${endpoint.description}`,
    `  - Request: ${endpoint.request}`,
    `  - Responses: ${endpoint.responses.join(", ")}`,
  ];

  if (endpoint.routeParams?.length) {
    lines.push("  - Params:");
    lines.push(...endpoint.routeParams.map((param) => `    ${formatField(param)}`));
  }

  if (endpoint.bodyFields?.length) {
    lines.push("  - Body:");
    lines.push(...endpoint.bodyFields.map((field) => `    ${formatField(field)}`));
  }

  if (endpoint.exampleBody) {
    lines.push("  - Ejemplo JSON:");
    lines.push("```json");
    lines.push(endpoint.exampleBody);
    lines.push("```");
  }

  if (endpoint.notes) {
    lines.push(`  - Notas: ${endpoint.notes}`);
  }

  return lines.join("\n");
}

function buildReadmeGeneratedSection() {
  const lines = [
    "## Endpoints",
    "",
    ...docs.groups.flatMap((group) => [
      `### ${group.postmanName ?? group.name}`,
      "",
      group.summary,
      "",
      ...group.endpoints.flatMap((endpoint) => [formatEndpointSection(endpoint), ""]),
    ]),
    "## Postman",
    "",
    "Se incluye una coleccion lista para importar en [postman/back_2.postman_collection.json](postman/back_2.postman_collection.json).",
    "",
    "## Sincronizacion de endpoints",
    "",
    "La fuente de verdad para la documentacion del front, el README y la coleccion de Postman es [data/api-docs.json](data/api-docs.json).",
    "",
    "Cuando agregues, elimines o cambies un endpoint, actualiza ese archivo:",
    "",
    "- La home consume esa metadata directamente.",
    "- La coleccion de Postman se regenera con npm run sync:api-docs.",
    "- El README tambien se regenera desde esa misma fuente.",
    "- npm run check:api-docs falla si hay diferencias pendientes.",
    "",
    "Con esto, el front, el README y Postman quedan alineados desde una sola definicion.",
  ];

  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

function buildReadme(readmeSource) {
  const start = readmeSource.indexOf(readmeStartMarker);
  const end = readmeSource.indexOf(readmeEndMarker);

  if (start === -1 || end === -1 || end < start) {
    throw new Error("README markers not found for api docs sync");
  }

  const before = readmeSource.slice(0, start + readmeStartMarker.length);
  const after = readmeSource.slice(end);
  const generated = buildReadmeGeneratedSection();

  return `${before}\n\n${generated}\n\n${after}`;
}

const collection = {
  info: docs.postman.info,
  variable: docs.postman.variables,
  item: docs.groups.map((group) => ({
    name: group.postmanName ?? group.name,
    item: group.endpoints.map((endpoint) => {
      const item = {
        name: `${endpoint.method} ${endpoint.operation}`,
        request: buildRequest(endpoint),
      };
      const event = buildEvent(endpoint);

      if (event) {
        item.event = event;
      }

      return item;
    }),
  })),
};

const serialized = `${JSON.stringify(collection, null, 2)}\n`;
const currentPostman = existsSync(postmanPath) ? readFileSync(postmanPath, "utf8") : "";
const currentReadme = readFileSync(readmePath, "utf8");
const nextReadme = buildReadme(currentReadme);

let hasChanges = false;

if (currentPostman !== serialized) {
  hasChanges = true;
  if (!isCheckMode) {
    writeFileSync(postmanPath, serialized, "utf8");
    console.log("Postman collection updated from data/api-docs.json");
  }
}

if (currentReadme !== nextReadme) {
  hasChanges = true;
  if (!isCheckMode) {
    writeFileSync(readmePath, nextReadme, "utf8");
    console.log("README updated from data/api-docs.json");
  }
}

if (!hasChanges && !isCheckMode) {
  console.log("API docs artifacts already in sync");
}

if (isCheckMode) {
  if (hasChanges) {
    console.error("API docs artifacts are out of sync. Run npm run sync:api-docs.");
    process.exit(1);
  }

  console.log("API docs artifacts are in sync");
}