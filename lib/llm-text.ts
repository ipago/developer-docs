/**
 * Turns a page's raw MDX into plain markdown an LLM reads well: the YAML front matter becomes a
 * heading, and import lines (which mean nothing outside the site) are dropped. Components such
 * as <Callout> are left in place: they are readable as text and removing them risks losing the
 * content inside.
 */
export function mdxToLlmMarkdown(raw: string, fallbackTitle: string): string {
  let body = raw;
  let title = fallbackTitle;
  let description = "";
  const front = /^---\n([\s\S]*?)\n---\n?/.exec(body);
  if (front) {
    body = body.slice(front[0].length);
    const t = /^title:\s*(.+)$/m.exec(front[1]!);
    const d = /^description:\s*(.+)$/m.exec(front[1]!);
    if (t) title = t[1]!.trim().replace(/^["']|["']$/g, "");
    if (d) description = d[1]!.trim().replace(/^["']|["']$/g, "");
  }
  body = body.replace(/^import .*$/gm, "").trim();
  return [`# ${title}`, description ? `\n${description}` : "", "", body].join("\n");
}
