import { creatorsSource, devSource } from "@/lib/source";
import { readRawMarkdown, type DocModule } from "@/lib/raw";

// Serve the raw MDX source of every docs page at /md/<module>/<...slug>, statically generated so
// it works in a standalone production build without runtime filesystem access. Powers the
// "View as markdown" link and the "Copy for LLM" button.
export const dynamic = "force-static";

const modules: { module: DocModule; source: typeof devSource }[] = [
  { module: "dev", source: devSource },
  { module: "creators", source: creatorsSource },
];

export function generateStaticParams(): { path: string[] }[] {
  const params: { path: string[] }[] = [];
  for (const { module, source } of modules) {
    for (const page of source.getPages()) {
      params.push({ path: [module, ...page.slugs] });
    }
  }
  return params;
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const [module, ...slugs] = segments;
  const entry = modules.find((m) => m.module === module);
  if (!entry) return new Response("Not found", { status: 404 });

  const page = entry.source.getPage(slugs);
  if (!page) return new Response("Not found", { status: 404 });

  const raw = readRawMarkdown(entry.module, page.file.path);
  return new Response(raw, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
