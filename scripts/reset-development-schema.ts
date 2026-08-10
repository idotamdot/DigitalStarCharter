import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { neon } from "@neondatabase/serverless";

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
if (!rawConnectionString) {
  throw new Error("NEON_DATABASE_URL or DATABASE_URL is required");
}

const connectionString = rawConnectionString.trim().replace(/^postgres:\/\//i, "postgresql://");
if (!connectionString.startsWith("postgresql://")) {
  throw new Error("Development reset requires a PostgreSQL connection URL");
}

const sql = neon(connectionString);

function asSqlTemplate(statement: string): TemplateStringsArray {
  const strings = [statement] as unknown as TemplateStringsArray;
  Object.defineProperty(strings, "raw", { value: [statement], enumerable: false });
  return strings;
}

const dropStatements = [
  "DROP TABLE IF EXISTS authority_audit_log CASCADE",
  "DROP TABLE IF EXISTS ai_decisions CASCADE",
  "DROP TABLE IF EXISTS growth_plans CASCADE",
  "DROP TABLE IF EXISTS member_distributions CASCADE",
  "DROP TABLE IF EXISTS distribution_periods CASCADE",
  "DROP TABLE IF EXISTS charter_ledger_entries CASCADE",
  "DROP TABLE IF EXISTS work_orders CASCADE",
  "DROP TABLE IF EXISTS role_assignments CASCADE",
  "DROP TABLE IF EXISTS charter_roles CASCADE",
  "DROP TABLE IF EXISTS learning_progress CASCADE",
  "DROP TABLE IF EXISTS learning_enrollments CASCADE",
  "DROP TABLE IF EXISTS user_learning_progress CASCADE",
  "DROP TABLE IF EXISTS user_learning_enrollments CASCADE",
  "DROP TABLE IF EXISTS learning_path_steps CASCADE",
  "DROP TABLE IF EXISTS learning_paths CASCADE",
  "DROP TABLE IF EXISTS resources CASCADE",
  "DROP TABLE IF EXISTS member_profiles CASCADE",
  "DROP TABLE IF EXISTS members CASCADE",
  "DROP TABLE IF EXISTS appointments CASCADE",
  "DROP TABLE IF EXISTS service_offerings CASCADE",
  "DROP TABLE IF EXISTS service_provider_availability CASCADE",
  "DROP TABLE IF EXISTS forum_replies CASCADE",
  "DROP TABLE IF EXISTS forum_topics CASCADE",
  "DROP TABLE IF EXISTS votes CASCADE",
  "DROP TABLE IF EXISTS areas CASCADE",
  "DROP TABLE IF EXISTS constellations CASCADE",
  "DROP TABLE IF EXISTS subscriptions CASCADE",
  "DROP TABLE IF EXISTS social_media_plans CASCADE",
  "DROP TABLE IF EXISTS branding_info CASCADE",
  "DROP TABLE IF EXISTS business_profiles CASCADE",
  "DROP TABLE IF EXISTS users CASCADE",
];

const createStatements = [
  `CREATE TABLE members (
    id serial PRIMARY KEY,
    auth_subject text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    display_name text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE member_profiles (
    member_id integer PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    skills jsonb NOT NULL DEFAULT '{"primary":[],"developing":[]}'::jsonb,
    preferences jsonb NOT NULL DEFAULT '{"preferredWork":[],"avoidWork":[],"communication":[]}'::jsonb,
    constraints jsonb NOT NULL DEFAULT '{}'::jsonb,
    learning_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
    availability_notes text,
    role_fit_notes text,
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE resources (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    content_type text NOT NULL,
    url text NOT NULL,
    thumbnail_url text,
    access_level text NOT NULL DEFAULT 'member',
    created_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE learning_paths (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    skill_level text NOT NULL,
    estimated_hours integer NOT NULL,
    thumbnail_url text,
    tags jsonb NOT NULL DEFAULT '[]'::jsonb,
    author_member_id integer NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    required_tier text NOT NULL DEFAULT 'member',
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE learning_path_steps (
    id serial PRIMARY KEY,
    path_id integer NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    resource_id integer REFERENCES resources(id) ON DELETE SET NULL,
    step_order integer NOT NULL,
    title text NOT NULL,
    description text,
    estimated_minutes integer NOT NULL,
    is_required boolean NOT NULL DEFAULT true
  )`,
  `CREATE TABLE learning_enrollments (
    id serial PRIMARY KEY,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    path_id integer NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    enrolled_at timestamp NOT NULL DEFAULT now(),
    completed_at timestamp,
    is_active boolean NOT NULL DEFAULT true,
    progress_percent integer NOT NULL DEFAULT 0,
    last_accessed_at timestamp NOT NULL DEFAULT now(),
    UNIQUE(member_id, path_id)
  )`,
  `CREATE TABLE learning_progress (
    id serial PRIMARY KEY,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    path_id integer NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    step_id integer NOT NULL REFERENCES learning_path_steps(id) ON DELETE CASCADE,
    started_at timestamp NOT NULL DEFAULT now(),
    completed_at timestamp,
    notes text,
    resource_rating integer,
    UNIQUE(member_id, step_id)
  )`,
  `CREATE TABLE charter_roles (
    id serial PRIMARY KEY,
    name text NOT NULL,
    domain text NOT NULL,
    description text NOT NULL,
    revenue_responsibility text,
    human_authority boolean NOT NULL DEFAULT true,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE role_assignments (
    id serial PRIMARY KEY,
    role_id integer NOT NULL REFERENCES charter_roles(id) ON DELETE CASCADE,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'active',
    compensation_cents_monthly integer NOT NULL DEFAULT 0,
    assigned_at timestamp NOT NULL DEFAULT now(),
    notes text
  )`,
  `CREATE TABLE work_orders (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    revenue_type text NOT NULL DEFAULT 'direct',
    expected_revenue_cents integer NOT NULL DEFAULT 0,
    actual_revenue_cents integer NOT NULL DEFAULT 0,
    assigned_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    assigned_role_id integer REFERENCES charter_roles(id) ON DELETE SET NULL,
    created_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'planned',
    due_at timestamp,
    completed_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE charter_ledger_entries (
    id serial PRIMARY KEY,
    occurred_at timestamp NOT NULL DEFAULT now(),
    type text NOT NULL,
    category text NOT NULL,
    amount_cents integer NOT NULL,
    description text NOT NULL,
    work_order_id integer REFERENCES work_orders(id) ON DELETE SET NULL,
    recorded_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    source text NOT NULL DEFAULT 'manual',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb
  )`,
  `CREATE TABLE distribution_periods (
    id serial PRIMARY KEY,
    name text NOT NULL,
    period_start timestamp NOT NULL,
    period_end timestamp NOT NULL,
    revenue_cents integer NOT NULL DEFAULT 0,
    operating_costs_cents integer NOT NULL DEFAULT 0,
    reserve_contribution_cents integer NOT NULL DEFAULT 0,
    distributable_cents integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    approved_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    approved_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE member_distributions (
    id serial PRIMARY KEY,
    period_id integer NOT NULL REFERENCES distribution_periods(id) ON DELETE CASCADE,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount_cents integer NOT NULL,
    basis text NOT NULL DEFAULT 'equal_share',
    status text NOT NULL DEFAULT 'proposed',
    paid_at timestamp
  )`,
  `CREATE TABLE growth_plans (
    id serial PRIMARY KEY,
    proposed_role_name text NOT NULL,
    monthly_compensation_cents integer NOT NULL,
    current_cash_cents integer NOT NULL DEFAULT 0,
    recurring_monthly_revenue_cents integer NOT NULL DEFAULT 0,
    recurring_monthly_costs_cents integer NOT NULL DEFAULT 0,
    required_reserve_months numeric NOT NULL DEFAULT 6,
    safe_to_add boolean NOT NULL DEFAULT false,
    analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamp NOT NULL DEFAULT now(),
    approved_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    approved_at timestamp
  )`,
  `CREATE TABLE ai_decisions (
    id serial PRIMARY KEY,
    domain text NOT NULL,
    action_type text NOT NULL,
    title text NOT NULL,
    recommendation text NOT NULL,
    rationale text NOT NULL,
    confidence numeric NOT NULL DEFAULT 0,
    expected_impact jsonb NOT NULL DEFAULT '{}'::jsonb,
    risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
    consequence_level text NOT NULL DEFAULT 'low',
    status text NOT NULL DEFAULT 'drafted',
    proposed_by text NOT NULL DEFAULT 'ai-management',
    reviewed_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    reviewed_at timestamp,
    review_notes text,
    executed_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    executed_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE authority_audit_log (
    id serial PRIMARY KEY,
    actor_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    actor_email text,
    authority text NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text,
    outcome text NOT NULL DEFAULT 'completed',
    reason text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  "CREATE INDEX role_assignments_member_id_idx ON role_assignments(member_id)",
  "CREATE INDEX work_orders_assigned_member_id_idx ON work_orders(assigned_member_id)",
  "CREATE INDEX ledger_entries_occurred_at_idx ON charter_ledger_entries(occurred_at)",
  "CREATE INDEX learning_enrollments_member_id_idx ON learning_enrollments(member_id)",
  "CREATE INDEX learning_progress_member_id_idx ON learning_progress(member_id)",
  "CREATE INDEX ai_decisions_status_idx ON ai_decisions(status)",
  "CREATE INDEX authority_audit_created_at_idx ON authority_audit_log(created_at)",
];

console.log("Resetting DigitalStarCharter development tables...");
for (const statement of dropStatements) {
  await sql(asSqlTemplate(statement));
}
for (const statement of createStatements) {
  await sql(asSqlTemplate(statement));
}

console.log(`Development schema reset complete (${dropStatements.length} drops, ${createStatements.length} creates/indexes).`);
