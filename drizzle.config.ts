import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
} else if (existsSync(".env")) {
  loadEnvFile(".env");
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
