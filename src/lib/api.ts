import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { classifyError, NotFoundError } from "@/lib/errors";

/**
 * Wraps an API route handler with uniform error mapping:
 * graph-down → 503, bad config/credentials → 500, missing entity → 404.
 */
export function apiHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 });
      }
      const { kind, message } = classifyError(error);
      if (error instanceof NotFoundError || kind === "not-found") {
        return NextResponse.json({ error: message, kind }, { status: 404 });
      }
      const status = kind === "unavailable" ? 503 : kind === "config" || kind === "auth" ? 500 : 500;
      console.error(`[api] ${kind}: ${message}`);
      return NextResponse.json({ error: message, kind }, { status });
    }
  };
}

export function jsonOk<T>(data: T): Response {
  return NextResponse.json(data);
}
