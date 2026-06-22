import { createFromSource } from "fumadocs-core/search/server";
import { devSource } from "@/lib/source";

export const { GET } = createFromSource(devSource);
