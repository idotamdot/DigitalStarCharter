import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

const localEnvFile = existsSync(".env.local")
  ? ".env.local"
  : existsSync(".env")
    ? ".env"
    : undefined;

if (localEnvFile) {
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
  schema: [
    "./shared/identity-schema.ts",
    "./shared/resource-schema.ts",
    "./shared/learning-schema.ts",
    "./shared/accounting-schema.ts",
    "./shared/operating-schema.ts",
    "./shared/quality-schema.ts",
    "./shared/ai-management-schema.ts",
    "./shared/role-fit-schema.ts",
    "./shared/goodness-schema.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
