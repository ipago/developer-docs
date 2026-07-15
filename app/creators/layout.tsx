import { RootProvider } from "fumadocs-ui/provider";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { creatorsSource } from "@/lib/source";
import { creatorsOptions } from "../layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider search={{ options: { api: "/api/search/creators" } }} theme={{ enabled: false }}>
      <DocsLayout tree={creatorsSource.pageTree} {...creatorsOptions}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
