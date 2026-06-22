import { defineDocs, defineConfig } from "fumadocs-mdx/config";

// Two independent documentation modules: no shared sidebar or search.
export const creators = defineDocs({ dir: "content/creators" });
export const dev = defineDocs({ dir: "content/dev" });

export default defineConfig();
