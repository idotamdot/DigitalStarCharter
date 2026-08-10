import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { neon } from "@neondatabase/serverless";
import { CREATE_FINAL_CORE, DROP_DEVELOPMENT_TABLES } from "./schema-statements";

if (process.env.NODE_ENV === "production") {
  throw new Error("Development schema reset is disabled in production");
}

if (existsSync(".env.local")) {
  delete process.env.NEON_DATABASE_URL;
  delete process.env.DATABASE_URL;
  loadEnvFile(".env.local");
} else if (existsSync(".env")) {
  loadEnvFile(".env");
}

const rawConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!rawConnectionString) throw new Error("NEON_DATABASE_URL or DATABASE_URL is required");

const connectionString = rawConnectionString.trim().replace(/^postgres:\/\//i, "postgresql://");
if (!connectionString.startsWith("postgresql://")) throw new Error("Development reset requires a PostgreSQL connection URL");

const sql = neon(connectionString);

function asSqlTemplate(statement: string): TemplateStringsArray {
  const strings = [statement] as unknown as TemplateStringsArray;
  Object.defineProperty(strings, "raw", { value: [statement], enumerable: false });
  return strings;
}

console.log("Resetting DigitalStarCharter development tables...");
for (const statement of DROP_DEVELOPMENT_TABLES) await sql(asSqlTemplate(statement));
for (const statement of CREATE_FINAL_CORE) await sql(asSqlTemplate(statement));
console.log(`Development schema reset complete (${DROP_DEVELOPMENT_TABLES.length} drops, ${CREATE_FINAL_CORE.length} creates/indexes).`);
