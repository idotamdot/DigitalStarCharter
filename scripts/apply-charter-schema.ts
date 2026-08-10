import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { neon } from "@neondatabase/serverless";

if (existsSync(".env.local")) {
  delete process.env.NEON_DATABASE_URL;
  delete process.env.DATABASE_URL;
  loadEnvFile(".env.local");
} else if (existsSync(".env")) {
  loadEnvFile(".env");
}

const rawConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error("NEON_DATABASE_URL or DATABASE_URL must be set in .env.local, .env, or the process environment");
}

const connectionString = rawConnectionString.trim().replace(/^postgres:\/\//i, "postgresql://");
if (!connectionString.startsWith("postgresql://")) {
  throw new Error("Neon database URL must begin with postgresql:// or postgres://");
}

const sql = neon(connectionString);

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username text NOT NULL UNIQUE,
    password text NOT NULL,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL,
    business_type text,
    created_at timestamp DEFAULT now(),
    star_name text,
    region text,
    sub_region text,
    role text,
    star_position jsonb,
    star_color text,
    star_size numeric,
    joined_date date DEFAULT now(),
    is_guiding_star boolean DEFAULT false,
    is_area_leader boolean DEFAULT false,
    is_voter boolean DEFAULT false,
    voter_until timestamp,
    invited_by integer,
    approved_by jsonb,
    character_evaluation text,
    accessibility_settings jsonb DEFAULT '{}'::jsonb NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS charter_roles (
    id serial PRIMARY KEY,
    name text NOT NULL,
    domain text NOT NULL,
    description text NOT NULL,
    revenue_responsibility text,
    human_authority boolean DEFAULT true NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS role_assignments (
    id serial PRIMARY KEY,
    role_id integer NOT NULL REFERENCES charter_roles(id) ON DELETE CASCADE,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status text DEFAULT 'active' NOT NULL,
    compensation_cents_monthly integer DEFAULT 0 NOT NULL,
    assigned_at timestamp DEFAULT now() NOT NULL,
    notes text
  )`,
  `CREATE TABLE IF NOT EXISTS work_orders (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    revenue_type text DEFAULT 'direct' NOT NULL,
    expected_revenue_cents integer DEFAULT 0 NOT NULL,
    actual_revenue_cents integer DEFAULT 0 NOT NULL,
    assigned_user_id integer REFERENCES users(id),
    assigned_role_id integer REFERENCES charter_roles(id),
    created_by_user_id integer REFERENCES users(id),
    status text DEFAULT 'planned' NOT NULL,
    due_at timestamp,
    completed_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS charter_ledger_entries (
    id serial PRIMARY KEY,
    occurred_at timestamp DEFAULT now() NOT NULL,
    type text NOT NULL,
    category text NOT NULL,
    amount_cents integer NOT NULL,
    description text NOT NULL,
    work_order_id integer REFERENCES work_orders(id),
    recorded_by_user_id integer REFERENCES users(id),
    source text DEFAULT 'manual' NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS distribution_periods (
    id serial PRIMARY KEY,
    name text NOT NULL,
    period_start timestamp NOT NULL,
    period_end timestamp NOT NULL,
    revenue_cents integer DEFAULT 0 NOT NULL,
    operating_costs_cents integer DEFAULT 0 NOT NULL,
    reserve_contribution_cents integer DEFAULT 0 NOT NULL,
    distributable_cents integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    approved_by_user_id integer REFERENCES users(id),
    approved_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS member_distributions (
    id serial PRIMARY KEY,
    period_id integer NOT NULL REFERENCES distribution_periods(id) ON DELETE CASCADE,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents integer NOT NULL,
    basis text DEFAULT 'equal_share' NOT NULL,
    status text DEFAULT 'proposed' NOT NULL,
    paid_at timestamp
  )`,
  `CREATE TABLE IF NOT EXISTS growth_plans (
    id serial PRIMARY KEY,
    proposed_role_name text NOT NULL,
    monthly_compensation_cents integer NOT NULL,
    current_cash_cents integer DEFAULT 0 NOT NULL,
    recurring_monthly_revenue_cents integer DEFAULT 0 NOT NULL,
    recurring_monthly_costs_cents integer DEFAULT 0 NOT NULL,
    required_reserve_months numeric DEFAULT 6 NOT NULL,
    safe_to_add boolean DEFAULT false NOT NULL,
    analysis jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    approved_by_user_id integer REFERENCES users(id),
    approved_at timestamp
  )`,
  `CREATE TABLE IF NOT EXISTS ai_decisions (
    id serial PRIMARY KEY,
    domain text NOT NULL,
    action_type text NOT NULL,
    title text NOT NULL,
    recommendation text NOT NULL,
    rationale text NOT NULL,
    confidence numeric DEFAULT 0 NOT NULL,
    expected_impact jsonb DEFAULT '{}'::jsonb NOT NULL,
    risk_flags jsonb DEFAULT '[]'::jsonb NOT NULL,
    consequence_level text DEFAULT 'low' NOT NULL,
    status text DEFAULT 'drafted' NOT NULL,
    proposed_by text DEFAULT 'ai-management' NOT NULL,
    reviewed_by_user_id integer REFERENCES users(id),
    reviewed_at timestamp,
    review_notes text,
    executed_by_user_id integer REFERENCES users(id),
    executed_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS authority_audit_log (
    id serial PRIMARY KEY,
    actor_user_id integer REFERENCES users(id),
    actor_email text,
    authority text NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text,
    outcome text DEFAULT 'completed' NOT NULL,
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS created_by_user_id integer REFERENCES users(id)`,
  `ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS executed_by_user_id integer REFERENCES users(id)`,
  `CREATE INDEX IF NOT EXISTS role_assignments_user_id_idx ON role_assignments(user_id)`,
  `CREATE INDEX IF NOT EXISTS work_orders_assigned_user_id_idx ON work_orders(assigned_user_id)`,
  `CREATE INDEX IF NOT EXISTS ledger_entries_occurred_at_idx ON charter_ledger_entries(occurred_at)`,
  `CREATE INDEX IF NOT EXISTS ai_decisions_status_idx ON ai_decisions(status)`,
  `CREATE INDEX IF NOT EXISTS authority_audit_created_at_idx ON authority_audit_log(created_at)`,
];

for (const statement of statements) {
  await sql.query(statement, []);
}

console.log(`Charter schema applied successfully over Neon HTTPS (${statements.length} statements).`);
