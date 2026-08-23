import { getCatalog } from "@/lib/services";
import { apiHandler } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/products — catalogue with per-BOM risk counters. */
export const GET = apiHandler(async () => Response.json(await getCatalog()));
