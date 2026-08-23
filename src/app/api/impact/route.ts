import { simulateImpact } from "@/lib/services";
import { apiHandler } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({ facility: z.string().min(1) });

/** GET /api/impact?facility=<id> — blast-radius simulation for one facility. */
export const GET = apiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const { facility } = querySchema.parse(Object.fromEntries(searchParams));
  return Response.json(await simulateImpact(facility));
});
