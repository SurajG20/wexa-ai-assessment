import { z } from "zod";

/**
 * Centralised environment configuration.
 *
 * Secrets never live in the repository: they are read from environment
 * variables (see .env.example) and validated once at first access.
 */
const envSchema = z.object({
  COGNODB_URI: z
    .string()
    .min(1)
    .refine(
      (uri) => uri.startsWith("bolt+s://") || uri.startsWith("bolt+ssc://") || uri.startsWith("bolt://") || uri.startsWith("neo4j"),
      "COGNODB_URI must be a Bolt URI, e.g. bolt+s://<instance-id>.databases.cognodb.cloud",
    ),
  COGNODB_USER: z.string().min(1).default("cognodb"),
  COGNODB_PASSWORD: z.string().min(1),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | null = null;

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** Parse (once) and return the application configuration. Throws ConfigError when misconfigured. */
export function getConfig(): AppConfig {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    COGNODB_URI: process.env.COGNODB_URI,
    COGNODB_USER: process.env.COGNODB_USER ?? undefined,
    COGNODB_PASSWORD: process.env.COGNODB_PASSWORD,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `\t- ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new ConfigError(
      `Missing or invalid database configuration.\nCopy .env.example to .env and fill it in:\n${issues}`,
    );
  }

  cached = parsed.data;
  return cached;
}
