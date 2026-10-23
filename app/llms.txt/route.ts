import { creatorsSource, devSource } from "@/lib/source";

// Conventional llms.txt: a plain-text index of the whole documentation so an LLM can discover and
// fetch pages (each page's markdown is available at /md<url>). Statically generated.
export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    "# 2Pay Documentation",
    "",
    "> 2Pay is a Merchant of Record for game monetization: hosted webstores, an embedded checkout, a developer API, and global payouts. The raw markdown of any page below is available by prefixing its path with /md.",
    "",
    "Every page in one file: https://docs.2pay.gg/llms-full.txt",
    "OpenAPI spec: https://docs.2pay.gg/openapi.json",
    "",
  ];

  const sections: { title: string; source: typeof devSource }[] = [
    { title: "Developers", source: devSource },
    { title: "Creators", source: creatorsSource },
  ];

  for (const { title, source } of sections) {
    lines.push(`## ${title}`, "");
    for (const page of source.getPages()) {
      const desc = page.data.description ? `: ${page.data.description}` : "";
      lines.push(`- [${page.data.title}](${page.url})${desc}`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
