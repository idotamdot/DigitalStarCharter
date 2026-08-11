import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { neon } from "@neondatabase/serverless";
import { CREATE_FINAL_CORE, DROP_DEVELOPMENT_TABLES } from "./schema-statements";
import { CREATE_ROLE_FIT_TABLES, DROP_ROLE_FIT_TABLES } from "./role-fit-schema-statements";
import { CREATE_GOODNESS_TABLES, DROP_GOODNESS_TABLES } from "./goodness-schema-statements";

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

const dropStatements = [...DROP_GOODNESS_TABLES, ...DROP_ROLE_FIT_TABLES, ...DROP_DEVELOPMENT_TABLES];
const createStatements = [...CREATE_FINAL_CORE, ...CREATE_ROLE_FIT_TABLES, ...CREATE_GOODNESS_TABLES];

console.log("Resetting DigitalStarCharter development tables...");
for (const statement of dropStatements) await sql(asSqlTemplate(statement));
for (const statement of createStatements) await sql(asSqlTemplate(statement));
console.log(`Development schema reset complete (${dropStatements.length} drops, ${createStatements.length} creates/indexes).`);
