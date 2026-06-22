import { createFromSource } from "fumadocs-core/search/server";
import { creatorsSource } from "@/lib/source";

export const { GET } = createFromSource(creatorsSource);
