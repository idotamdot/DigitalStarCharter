import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as identitySchema from "@shared/identity-schema";
import * as resourceSchema from "@shared/resource-schema";
import * as learningSchema from "@shared/learning-schema";
import * as accountingSchema from "@shared/accounting-schema";
import * as operatingSchema from "@shared/operating-schema";
import * as qualitySchema from "@shared/quality-schema";
import * as aiManagementSchema from "@shared/ai-management-schema";
import * as roleFitSchema from "@shared/role-fit-schema";
import * as goodnessSchema from "@shared/goodness-schema";

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
  schema: {
    ...identitySchema,
    ...resourceSchema,
    ...learningSchema,
    ...accountingSchema,
    ...operatingSchema,
    ...qualitySchema,
    ...aiManagementSchema,
    ...roleFitSchema,
    ...goodnessSchema,
  },
});
