import { creatorsSource, devSource } from "@/lib/source";
import { readRawMarkdown, type DocModule } from "@/lib/raw";
import { mdxToLlmMarkdown } from "@/lib/llm-text";
import { DOCS_URL } from "@/lib/site";

// The whole documentation in one plain-text file, so a developer can hand one URL to Claude,
// Cursor or ChatGPT and the model has every page. The developer docs come first because that is
// what an AI coding assistant is usually asked about. Statically generated at build time.
export const dynamic = "force-static";

export function GET() {
  const parts: string[] = [
    "# iPago Documentation (full text)",
    "",
    "> iPago Sp. z o.o. is a reseller for game monetization: it buys licences from suppliers and sells them to players in its own name. Hosted webstores, an embedded checkout, a developer API, a Game API for game servers, and weekly purchase invoices. This file contains every documentation page except the generated API reference; for exact request and response shapes, read the OpenAPI spec at https://docs.ipago.io/openapi.json.",
    "",
  ];

  const modules: { module: DocModule; title: string; source: typeof devSource }[] = [
    { module: "dev", title: "Developers", source: devSource },
    { module: "creators", title: "Creators", source: creatorsSource },
  ];

  for (const { module, title, source } of modules) {
    parts.push(`# Part: ${title}`, "");
    for (const page of source.getPages()) {
      // The API reference is generated from openapi.json and would double the file; the spec
      // itself is linked at the top, and is the better source for exact shapes anyway.
      if (module === "dev" && page.slugs[0] === "reference") continue;
      const raw = readRawMarkdown(module, page.file.path);
      parts.push("---", "", `Source: ${DOCS_URL}${page.url}`, "", mdxToLlmMarkdown(raw, page.data.title), "");
    }
  }

  return new Response(parts.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
