import { RootProvider } from "fumadocs-ui/provider";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { devSource } from "@/lib/source";
import { devOptions } from "../layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider search={{ options: { api: "/api/search/dev" } }} theme={{ enabled: false }}>
      <DocsLayout tree={devSource.pageTree} {...devOptions}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
