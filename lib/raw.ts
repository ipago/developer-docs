import fs from "node:fs";
import path from "node:path";

export type DocModule = "dev" | "creators";

/**
 * Read a page's raw MDX source at BUILD time (both docs pages and the /md route are statically
 * generated, so this never runs against the filesystem at request time in production). `filePath`
 * is Fumadocs' `page.file.path`, relative to the module's content directory, e.g.
 * "checkout/configuration.mdx".
 */
export function readRawMarkdown(module: DocModule, filePath: string): string {
  const abs = path.join(process.cwd(), "content", module, filePath);
  return fs.readFileSync(abs, "utf8");
}
