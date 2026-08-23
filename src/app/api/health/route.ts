import { checkConnection, closeDriver } from "@/lib/db";
import { classifyError } from "@/lib/errors";

export const dynamic = "force-dynamic";

/** GET /api/health — reports whether the CognoDB instance is reachable. */
export async function GET() {
  try {
    const { agent, latencyMs } = await checkConnection();
    return Response.json({ status: "ok", server: agent, latencyMs });
  } catch (error) {
    // Close a half-open driver so the next request starts fresh.
    await closeDriver();
    const { kind, message } = classifyError(error);
    return Response.json(
      { status: "unreachable", kind, message },
      { status: kind === "auth" || kind === "config" ? 500 : 503 },
    );
  }
}
