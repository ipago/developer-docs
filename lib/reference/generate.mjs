#!/usr/bin/env node
// Generates the API reference from the API's own OpenAPI document.
//
//   input   apps/api/openapi.json            (committed; regenerate with `cd apps/api && pnpm -s openapi:gen`)
//   output  apps/docs/content/dev/reference/*.mdx + meta.json   (the reference pages)
//           apps/docs/lib/reference/openapi.public.json          (the public subset, served at /openapi.json)
//
// It runs before every `next build` and `next dev` (see apps/docs/package.json), so the deployed
// reference always matches the spec in the same commit. The outputs are committed as well, so the
// docs still build when the spec is not present (a warning is printed and the committed pages
// are used as they are).
//
// Which operations are documented is decided in ./catalog.mjs, not here.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { API_HOST, DENY_RULES, GROUPS } from "./catalog.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, "../..");
const specPath = path.resolve(docsRoot, "../api/openapi.json");
const outDir = path.join(docsRoot, "content/dev/reference");
const publicSpecPath = path.join(here, "openapi.public.json");

const METHODS = ["get", "post", "put", "patch", "delete"];
const MAX_SAFE = 9007199254740991;

const STATUS_TEXT = {
  400: "The request is invalid: a missing or malformed parameter, or a rule the request breaks.",
  401: "The credential is missing, invalid or revoked.",
  403: "The credential is valid but not allowed to do this, for example a missing scope.",
  404: "The resource does not exist, or is not visible to this credential.",
  409: "The request conflicts with the resource's current state.",
  429: "Too many requests. Back off and retry.",
  500: "Something went wrong on 2Pay's side.",
  503: "A dependency is temporarily unavailable. Retry later.",
};

const AUTH = {
  api_key: {
    label: "API key",
    header: "Authorization",
    headerValue: "Bearer sk_live_... or sk_test_...",
    scheme: "ApiKey",
  },
  server_token: {
    label: "Server token",
    header: "X-2Pay-Server-Token",
    headerValue: "the game server's token",
    scheme: "ServerToken",
  },
  basket_token: {
    label: "Basket token",
    header: "X-Basket-Token",
    headerValue: "the token returned when the basket was created",
    scheme: "BasketToken",
  },
  public: { label: "None (public)", scheme: null },
};

// ---------------------------------------------------------------------------------------------
// Formatting helpers

/** An inline code span that is safe inside an MDX table cell. */
function code(value) {
  const s = String(value).replace(/\|/g, "\\|");
  return s.includes("`") ? "`` " + s + " ``" : "`" + s + "`";
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function typeLabel(s) {
  if (!s || typeof s !== "object") return "any";
  const variants = s.anyOf ?? s.oneOf;
  if (variants) return variants.map(typeLabel).join(" or ");
  let t;
  if (s.type === "array") {
    t = `array of ${typeLabel(s.items)}`;
  } else if (s.type === "object" || s.properties) {
    const ap = s.additionalProperties;
    t = !s.properties && ap && typeof ap === "object" ? `map of ${typeLabel(ap)}` : "object";
  } else {
    t = s.type ?? "any";
  }
  return s.nullable ? `${t} or null` : t;
}

function notes(s) {
  if (!s || typeof s !== "object") return "";
  const out = [];
  if (s.enum) {
    out.push(s.enum.length === 1 ? `Always ${code(s.enum[0])}.` : `One of ${s.enum.map(code).join(", ")}.`);
  }
  if (s.format) out.push(`Format ${code(s.format)}.`);
  // zod's int() emits +-MAX_SAFE_INTEGER bounds that say nothing to a reader; hide them.
  const hasMin = typeof s.minimum === "number" && s.minimum > -MAX_SAFE;
  const hasMax = typeof s.maximum === "number" && s.maximum < MAX_SAFE;
  if (hasMin && s.exclusiveMinimum === true) out.push(`Greater than ${s.minimum}.`);
  else if (hasMin && hasMax) out.push(`From ${s.minimum} to ${s.maximum}.`);
  else if (hasMin) out.push(`At least ${s.minimum}.`);
  else if (hasMax) out.push(`At most ${s.maximum}.`);
  if (typeof s.minLength === "number" && s.minLength === s.maxLength) out.push(`Exactly ${s.minLength} characters.`);
  else {
    if (typeof s.minLength === "number" && s.minLength > 0) out.push(`Min length ${s.minLength}.`);
    if (typeof s.maxLength === "number") out.push(`Max length ${s.maxLength}.`);
  }
  if (typeof s.minItems === "number") out.push(`At least ${s.minItems} item${s.minItems === 1 ? "" : "s"}.`);
  if (typeof s.maxItems === "number") out.push(`At most ${s.maxItems} items.`);
  if (s.pattern) out.push(`Pattern ${code(s.pattern)}.`);
  if (s.default !== undefined) out.push(`Default ${code(JSON.stringify(s.default))}.`);
  if (s.description) out.push(String(s.description).replace(/[{}<>|]/g, (c) => "\\" + c));
  return out.join(" ");
}

/** Flatten an object schema into rows: `items[].product`, `customer.email`, ... */
function fieldRows(schema, prefix = "", depth = 0, rows = []) {
  if (!schema || depth > 8) return rows;
  const variants = schema.anyOf ?? schema.oneOf;
  if (variants) {
    for (const v of variants) fieldRows(v, prefix, depth, rows);
    return rows;
  }
  if (schema.type === "array" && prefix) return fieldRows(schema.items, `${prefix}[]`, depth + 1, rows);
  const props = schema.properties;
  if (!props) return rows;
  const required = new Set(schema.required ?? []);
  for (const [key, child] of Object.entries(props)) {
    const name = prefix ? `${prefix}.${key}` : key;
    rows.push({ name, type: typeLabel(child), required: required.has(key), notes: notes(child) });
    fieldRows(child, name, depth + 1, rows);
  }
  return rows;
}

function table(headers, rows) {
  if (!rows.length) return "";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");
}

function fieldTable(rows) {
  return table(
    ["Field", "Type", "Required", "Notes"],
    rows.map((r) => [code(r.name), code(r.type), r.required ? "Yes" : "No", r.notes || " "]),
  );
}

function jsonSchemaOf(content) {
  if (!content) return null;
  const json = content["application/json"];
  return json ? json.schema : (Object.values(content)[0]?.schema ?? null);
}

// ---------------------------------------------------------------------------------------------
// Spec classification

function listOperations(spec) {
  const ops = [];
  for (const [p, item] of Object.entries(spec.paths ?? {})) {
    for (const m of METHODS) if (item[m]) ops.push({ key: `${m.toUpperCase()} ${p}`, path: p, method: m, operation: item[m] });
  }
  return ops;
}

function classify(spec) {
  const byKey = new Map(listOperations(spec).map((o) => [o.key, o]));
  const allowed = new Set(GROUPS.flatMap((g) => g.ops.map((o) => o.op)));
  const missing = [...allowed].filter((k) => !byKey.has(k));
  const unclassified = [...byKey.values()]
    .filter((o) => !allowed.has(o.key) && !DENY_RULES.some((r) => r.pattern.test(o.path)))
    .map((o) => o.key);
  return { byKey, missing, unclassified };
}

// ---------------------------------------------------------------------------------------------
// Page rendering

function headerRows(entry) {
  const rows = [];
  const auth = AUTH[entry.auth];
  if (auth.header) rows.push([code(auth.header), code("string"), "Yes", `${auth.label}: ${auth.headerValue}.`]);
  if (entry.idempotent) {
    rows.push([
      code("Idempotency-Key"),
      code("string"),
      "No",
      "A unique key per logical request. Retrying with the same key replays the first response instead of acting twice.",
    ]);
  }
  return rows;
}

function authLine(entry) {
  switch (entry.auth) {
    case "api_key":
      return `**Auth:** API key as a bearer token, scope ${code(entry.scope)}. See [authentication](/dev/reference#authentication).`;
    case "server_token":
      return "**Auth:** game server token in the `X-2Pay-Server-Token` header. See [authentication](/dev/reference#authentication).";
    case "basket_token":
      return "**Auth:** basket token in the `X-Basket-Token` header. See [authentication](/dev/reference#authentication).";
    default:
      return "**Auth:** none. This is a public endpoint.";
  }
}

function renderOperation(group, entry, op) {
  const { method, path: p, operation } = op;
  const host = group.host ?? API_HOST;
  const parts = [`## ${entry.summary}`, "", "```http", `${method.toUpperCase()} ${host}${p}`, "```", ""];
  if (entry.note) parts.push(entry.note, "");
  parts.push(authLine(entry), "");
  if (operation.operationId) parts.push(`**Operation ID:** ${code(operation.operationId)}`, "");

  const params = operation.parameters ?? [];
  for (const [where, label] of [["path", "Path parameters"], ["query", "Query parameters"]]) {
    const rows = params
      .filter((x) => x.in === where)
      .map((x) => [code(x.name), code(typeLabel(x.schema)), x.required ? "Yes" : "No", notes(x.schema) || " "]);
    if (rows.length) parts.push(`**${label}**`, "", table(["Name", "Type", "Required", "Notes"], rows), "");
  }

  const headers = headerRows(entry);
  if (headers.length) parts.push("**Headers**", "", table(["Name", "Type", "Required", "Notes"], headers), "");

  const body = operation.requestBody;
  if (body) {
    const schema = jsonSchemaOf(body.content);
    const rows = fieldRows(schema);
    const ct = Object.keys(body.content ?? {})[0] ?? "application/json";
    parts.push(`**Request body** ${code(ct)}${body.required ? "" : ", optional"}`, "");
    parts.push(rows.length ? fieldTable(rows) : `A ${code(typeLabel(schema))}.`, "");
  }

  const responses = Object.entries(operation.responses ?? {});
  for (const [status, res] of responses.filter(([s]) => s.startsWith("2"))) {
    const schema = jsonSchemaOf(res.content);
    parts.push(`**Response** ${code(status)}`, "");
    if (!schema) parts.push("No body.", "");
    else {
      const rows = fieldRows(schema);
      parts.push(rows.length ? fieldTable(rows) : `A ${code(typeLabel(schema))}.`, "");
    }
  }

  const errors = responses.filter(([s]) => !s.startsWith("2"));
  if (errors.length) {
    parts.push(
      "**Errors**",
      "",
      "Every error uses the [error object](/dev/reference#errors).",
      "",
      table(
        ["Status", "Meaning"],
        errors.map(([s]) => [code(s), STATUS_TEXT[s] ?? "See the error object's `code`."]),
      ),
      "",
    );
  }
  return parts.join("\n");
}

const GENERATED_NOTE =
  "{/* GENERATED by apps/docs/lib/reference/generate.mjs from apps/api/openapi.json. Do not edit by hand. */}";

function frontmatter(title, description) {
  return ["---", `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`, "---", ""].join("\n");
}

function renderGroupPage(group, byKey) {
  const host = group.host ?? API_HOST;
  const parts = [frontmatter(group.title, group.description), GENERATED_NOTE, ""];
  parts.push(`Base URL: ${code(host)}`, "");
  if (group.host && group.host !== API_HOST) {
    parts.push(`The same routes also answer on ${code(API_HOST)}, but plugins should use ${code(host)}.`, "");
  }
  parts.push(
    table(
      ["Method", "Path", "Operation"],
      group.ops
        .filter((e) => byKey.has(e.op))
        .map((e) => {
          const [m, p] = e.op.split(" ");
          return [code(m), code(p), `[${e.summary}](#${slugify(e.summary)})`];
        }),
    ),
    "",
  );
  for (const entry of group.ops) {
    const op = byKey.get(entry.op);
    if (op) parts.push(renderOperation(group, entry, op));
  }
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function renderIndex(byKey) {
  const parts = [
    frontmatter(
      "API reference",
      "Every public 2Pay API operation, generated from the API's OpenAPI document.",
    ),
    GENERATED_NOTE,
    "",
    "This reference is generated from the OpenAPI document the 2Pay API publishes, on every docs build, so it lists exactly what the API accepts and returns. It covers the three public surfaces: the **Developer API** (API keys), the **Storefront API** (baskets and public store data) and the **Game API** (the delivery queue for game server plugins).",
    "",
    "## OpenAPI document",
    "",
    '<a href="/openapi.json" download="2pay-openapi.json">Download openapi.json</a> to generate a client or import the API into a tool such as Postman or Insomnia. It contains the operations documented here, with tags and security schemes.',
    "",
    `The API also serves its own document live at [${API_HOST}/openapi.json](${API_HOST}/openapi.json). That one describes every route the server runs, including internal routes for the 2Pay dashboard that are not part of the public API.`,
    "",
    "## Base URLs",
    "",
    table(
      ["Surface", "Base URL"],
      [
        ["Developer API", code(API_HOST)],
        ["Storefront API", code(API_HOST)],
        ["Game API", code("https://game.2pay.gg")],
      ],
    ),
    "",
    "## Authentication",
    "",
    table(
      ["Credential", "Sent as", "Used by"],
      [
        ["API key", "`Authorization: Bearer sk_live_...` (or `sk_test_...` in test mode)", "Developer API. Each operation names the scope the key needs."],
        ["Server token", "`X-2Pay-Server-Token: ...`", "Game API. One token per game server, created in the dashboard."],
        ["Basket token", "`X-Basket-Token: ...`", "Basket operations. Returned once, when the basket is created."],
        ["None", " ", "Public storefront reads and basket creation."],
      ],
    ),
    "",
    "A test-mode API key (`sk_test_...`) only sees test-mode data, and test-mode payments run on separate test payment credentials, so no real money moves.",
    "",
    "## Errors",
    "",
    "Every error response has the same shape:",
    "",
    "```json",
    JSON.stringify(
      {
        error: {
          type: "invalid_request_error",
          code: "resource_missing",
          message: "No such order: ord_123",
          param: "order",
          request_id: "req_6f1c...",
        },
      },
      null,
      2,
    ),
    "```",
    "",
    table(
      ["Field", "Type", "Required", "Notes"],
      [
        [code("error.type"), code("string"), "Yes", "Broad category of the error."],
        [code("error.code"), code("string"), "Yes", "Stable, machine-readable reason. Branch on this."],
        [code("error.message"), code("string"), "Yes", "Human-readable explanation. May change."],
        [code("error.param"), code("string"), "No", "The parameter the error is about, when there is one."],
        [code("error.request_id"), code("string"), "Yes", "Quote it when you contact support."],
      ],
    ),
    "",
    table(
      ["Status", "Meaning"],
      Object.entries(STATUS_TEXT).map(([s, t]) => [code(s), t]),
    ),
    "",
    "## Operations",
    "",
  ];

  for (const group of GROUPS) {
    const rows = group.ops
      .filter((e) => byKey.has(e.op))
      .map((e) => {
        const [m, p] = e.op.split(" ");
        return [code(m), code(p), `[${e.summary}](/dev/reference/${group.slug}#${slugify(e.summary)})`];
      });
    parts.push(`### ${group.title}`, "", `${group.description} [Open the page](/dev/reference/${group.slug}).`, "");
    parts.push(table(["Method", "Path", "Operation"], rows), "");
  }

  parts.push(
    "## How this page is built",
    "",
    "The API generates `apps/api/openapi.json` from its route schemas (`cd apps/api && pnpm -s openapi:gen`). The docs build reads that file and writes these pages, so a change to the API reaches the reference in the same commit. Which operations are public is listed in one place, `apps/docs/lib/reference/catalog.mjs`.",
    "",
  );
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function renderMeta() {
  const pages = ["index"];
  let section = null;
  for (const g of GROUPS) {
    if (g.section !== section) {
      pages.push(`---${g.section}---`);
      section = g.section;
    }
    pages.push(g.slug);
  }
  return JSON.stringify({ title: "API reference", pages }, null, 2) + "\n";
}

// ---------------------------------------------------------------------------------------------
// Public OpenAPI subset

function buildPublicSpec(spec, byKey) {
  const paths = {};
  for (const group of GROUPS) {
    for (const entry of group.ops) {
      const found = byKey.get(entry.op);
      if (!found) continue;
      const auth = AUTH[entry.auth];
      const parameters = [...(found.operation.parameters ?? [])];
      if (entry.idempotent) {
        parameters.push({
          in: "header",
          name: "Idempotency-Key",
          required: false,
          schema: { type: "string" },
          description: "Retrying with the same key replays the first response instead of acting twice.",
        });
      }
      const operation = {
        ...found.operation,
        summary: entry.summary,
        ...(entry.note ? { description: entry.note } : {}),
        tags: [group.title],
        security: auth.scheme ? [{ [auth.scheme]: entry.scope ? [entry.scope] : [] }] : [],
        ...(parameters.length ? { parameters } : {}),
        ...(group.host ? { servers: [{ url: group.host }] } : {}),
      };
      paths[found.path] = { ...(paths[found.path] ?? {}), [found.method]: operation };
    }
  }
  return {
    openapi: spec.openapi,
    info: {
      ...spec.info,
      description: "The public 2Pay API: the Developer API, the Storefront API and the Game API. Generated from the API's own OpenAPI document. Reference: https://docs.2pay.gg/dev/reference",
    },
    servers: spec.servers ?? [{ url: API_HOST }],
    tags: GROUPS.map((g) => ({ name: g.title, description: g.description })),
    components: {
      ...(spec.components ?? {}),
      securitySchemes: {
        ApiKey: { type: "http", scheme: "bearer", description: "An API key, sk_live_... or sk_test_..." },
        ServerToken: { type: "apiKey", in: "header", name: "X-2Pay-Server-Token", description: "A game server token." },
        BasketToken: { type: "apiKey", in: "header", name: "X-Basket-Token", description: "The token returned when the basket was created." },
      },
    },
    paths,
  };
}

// ---------------------------------------------------------------------------------------------

function writeIfChanged(file, content) {
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (prev === content) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}

function main() {
  if (!fs.existsSync(specPath)) {
    console.warn(`[reference] ${path.relative(process.cwd(), specPath)} not found; keeping the committed reference pages.`);
    return;
  }
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  const { byKey, missing, unclassified } = classify(spec);

  for (const k of missing) console.warn(`[reference] catalog lists ${k}, which is not in openapi.json; skipped.`);
  for (const k of unclassified) {
    console.warn(`[reference] ${k} is in openapi.json but in neither GROUPS nor DENY_RULES (lib/reference/catalog.mjs); not documented.`);
  }

  let changed = 0;
  changed += writeIfChanged(path.join(outDir, "index.mdx"), renderIndex(byKey));
  changed += writeIfChanged(path.join(outDir, "meta.json"), renderMeta());
  for (const g of GROUPS) changed += writeIfChanged(path.join(outDir, `${g.slug}.mdx`), renderGroupPage(g, byKey));
  changed += writeIfChanged(publicSpecPath, JSON.stringify(buildPublicSpec(spec, byKey), null, 2) + "\n");

  const documented = GROUPS.flatMap((g) => g.ops).filter((e) => byKey.has(e.op)).length;
  console.log(`[reference] ${documented} operations documented, ${changed} file(s) updated.`);
}

main();
