import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

const localEnvFile = existsSync(".env.local")
  ? ".env.local"
  : existsSync(".env")
    ? ".env"
    : undefined;

if (localEnvFile) {
  // Drizzle CLI is a local development/admin command. When a local env file
  // exists, make it authoritative so stale shell variables cannot override it.
  delete process.env.NEON_DATABASE_URL;
  delete process.env.DATABASE_URL;
  loadEnvFile(localEnvFile);
}

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("NEON_DATABASE_URL or DATABASE_URL must be set in .env.local, .env, or the process environment");
}

export default defineConfig({
  out: "./migrations",
  schema: ["./shared/schema.ts", "./shared/operating-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
