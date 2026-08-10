import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { neon } from "@neondatabase/serverless";
import { CREATE_FINAL_CORE } from "./schema-statements";

if (existsSync(".env.local")) {
  delete process.env.NEON_DATABASE_URL;
  delete process.env.DATABASE_URL;
  loadEnvFile(".env.local");
} else if (existsSync(".env")) {
  loadEnvFile(".env");
}

const candidates = [
  ["NEON_DATABASE_URL", process.env.NEON_DATABASE_URL],
  ["DATABASE_URL", process.env.DATABASE_URL],
] as const;

const selected = candidates.find(([, value]) => {
  if (!value) return false;
  return value.trim().replace(/^postgres:\/\//i, "postgresql://").startsWith("postgresql://");
});

if (!selected) throw new Error("NEON_DATABASE_URL or DATABASE_URL must contain a valid PostgreSQL URL");

const [selectedName, rawConnectionString] = selected;
const connectionString = rawConnectionString!.trim().replace(/^postgres:\/\//i, "postgresql://");
const sql = neon(connectionString);

function asSqlTemplate(statement: string): TemplateStringsArray {
  const strings = [statement] as unknown as TemplateStringsArray;
  Object.defineProperty(strings, "raw", { value: [statement], enumerable: false });
  return strings;
}

console.log(`Using ${selectedName} from local environment.`);
for (const statement of CREATE_FINAL_CORE) await sql(asSqlTemplate(statement));
console.log(`Final Charter core schema applied successfully over Neon HTTPS (${CREATE_FINAL_CORE.length} statements).`);
