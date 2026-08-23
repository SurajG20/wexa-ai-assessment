import { getSinglePointsOfFailure } from "@/lib/services";
import { apiHandler } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/spof?limit=10 — ranked single points of failure. */
export const GET = apiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
  return Response.json(await getSinglePointsOfFailure(limit));
});
