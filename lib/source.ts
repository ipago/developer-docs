import { creators, dev } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";

// Each module is a separate source → separate page tree (sidebar) and search.
export const creatorsSource = loader({
  baseUrl: "/creators",
  source: createMDXSource(creators.docs, creators.meta),
});

export const devSource = loader({
  baseUrl: "/dev",
  source: createMDXSource(dev.docs, dev.meta),
});
