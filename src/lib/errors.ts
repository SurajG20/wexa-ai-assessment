import { Neo4jError } from "neo4j-driver";
import { ConfigError } from "./config";

/** Domain error thrown by services when a lookup finds nothing. */
export class NotFoundError extends Error {
  constructor(entity: string, key: string) {
    super(`${entity} "${key}" was not found`);
    this.name = "NotFoundError";
  }
}

export type ErrorClassification =
  | { kind: "config"; message: string }
  | { kind: "unavailable"; message: string }
  | { kind: "auth"; message: string }
  | { kind: "not-found"; message: string }
  | { kind: "unknown"; message: string };

/**
 * Map any thrown value to a small set of classes the API layer can turn into
 * meaningful HTTP responses and the UI can render as actionable messages.
 */
export function classifyError(error: unknown): ErrorClassification {
  if (error instanceof ConfigError) {
    return { kind: "config", message: error.message };
  }
  if (error instanceof Neo4jError) {
    const code = error.code ?? "";
    if (code.includes("Auth") || /unauthorized|forbidden/i.test(error.message)) {
      return { kind: "auth", message: "Database credentials were rejected. Check COGNODB_USER / COGNODB_PASSWORD." };
    }
    if (
      code.includes("ServiceUnavailable") ||
      code.includes("SessionExpired") ||
      code.includes("TransientError") ||
      code.includes("DatabaseUnavailable")
    ) {
      return { kind: "unavailable", message: "Could not reach the CognoDB instance. It may be paused or the network may be blocking outbound Bolt connections." };
    }
    if (code.endsWith("ClientError")) {
      return { kind: "unknown", message: `Query failed (${code}): ${error.message}` };
    }
    return { kind: "unknown", message: error.message };
  }
  if (error instanceof NotFoundError) {
    return { kind: "not-found", message: error.message };
  }
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return { kind: "unavailable", message: "Network error while contacting the database." };
  }
  return { kind: "unknown", message: error instanceof Error ? error.message : String(error) };
}
