import type { APIContext } from "astro";
import { buildRssFeed } from "@/lib/rss";

export const GET = (context: APIContext) => buildRssFeed("ja", context);
