import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as coreSchema from "@shared/schema";
import * as operatingSchema from "@shared/operating-schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision the DigitalStarCharter database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle({
  client: pool,
  schema: { ...coreSchema, ...operatingSchema },
});
