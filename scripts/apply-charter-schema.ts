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

const statements = [
  `CREATE TABLE IF NOT EXISTS members (
    id serial PRIMARY KEY,
    auth_subject text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    display_name text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS member_profiles (
    member_id integer PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    skills jsonb NOT NULL DEFAULT '{"primary":[],"developing":[]}'::jsonb,
    preferences jsonb NOT NULL DEFAULT '{"preferredWork":[],"avoidWork":[],"communication":[]}'::jsonb,
    constraints jsonb NOT NULL DEFAULT '{}'::jsonb,
    learning_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
    availability_notes text,
    role_fit_notes text,
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS resources (
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
  `CREATE TABLE IF NOT EXISTS learning_paths (
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
  `CREATE TABLE IF NOT EXISTS learning_path_steps (
    id serial PRIMARY KEY,
    path_id integer NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    resource_id integer REFERENCES resources(id) ON DELETE SET NULL,
    step_order integer NOT NULL,
    title text NOT NULL,
    description text,
    estimated_minutes integer NOT NULL,
    is_required boolean NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS learning_enrollments (
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
  `CREATE TABLE IF NOT EXISTS learning_progress (
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
  `CREATE TABLE IF NOT EXISTS accounts (
    id serial PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    type text NOT NULL,
    normal_balance text NOT NULL,
    description text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS journal_entries (
    id serial PRIMARY KEY,
    occurred_at timestamp NOT NULL DEFAULT now(),
    description text NOT NULL,
    status text NOT NULL DEFAULT 'posted',
    recorded_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    approved_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    approved_at timestamp,
    reversal_of_entry_id integer,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS journal_lines (
    id serial PRIMARY KEY,
    journal_entry_id integer NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id integer NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    debit_cents integer NOT NULL DEFAULT 0 CHECK (debit_cents >= 0),
    credit_cents integer NOT NULL DEFAULT 0 CHECK (credit_cents >= 0),
    memo text,
    CHECK ((debit_cents > 0 AND credit_cents = 0) OR (credit_cents > 0 AND debit_cents = 0))
  )`,
  `CREATE TABLE IF NOT EXISTS charter_roles (
    id serial PRIMARY KEY,
    name text NOT NULL,
    domain text NOT NULL,
    description text NOT NULL,
    revenue_responsibility text,
    human_authority boolean NOT NULL DEFAULT true,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS role_assignments (
    id serial PRIMARY KEY,
    role_id integer NOT NULL REFERENCES charter_roles(id) ON DELETE CASCADE,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'active',
    compensation_cents_monthly integer NOT NULL DEFAULT 0,
    assigned_at timestamp NOT NULL DEFAULT now(),
    notes text
  )`,
  `CREATE TABLE IF NOT EXISTS work_orders (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    revenue_type text NOT NULL DEFAULT 'direct',
    expected_revenue_cents integer NOT NULL DEFAULT 0,
    reported_revenue_cents integer NOT NULL DEFAULT 0,
    assigned_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    assigned_role_id integer REFERENCES charter_roles(id) ON DELETE SET NULL,
    created_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'planned',
    due_at timestamp,
    completed_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS distribution_periods (
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
  `CREATE TABLE IF NOT EXISTS member_distributions (
    id serial PRIMARY KEY,
    period_id integer NOT NULL REFERENCES distribution_periods(id) ON DELETE CASCADE,
    member_id integer NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount_cents integer NOT NULL,
    basis text NOT NULL DEFAULT 'equal_share',
    status text NOT NULL DEFAULT 'proposed',
    paid_at timestamp
  )`,
  `CREATE TABLE IF NOT EXISTS growth_plans (
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
  `CREATE TABLE IF NOT EXISTS ai_decisions (
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
  `CREATE TABLE IF NOT EXISTS authority_audit_log (
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
  "CREATE INDEX IF NOT EXISTS role_assignments_member_id_idx ON role_assignments(member_id)",
  "CREATE INDEX IF NOT EXISTS work_orders_assigned_member_id_idx ON work_orders(assigned_member_id)",
  "CREATE INDEX IF NOT EXISTS journal_entries_occurred_at_idx ON journal_entries(occurred_at)",
  "CREATE INDEX IF NOT EXISTS journal_lines_entry_id_idx ON journal_lines(journal_entry_id)",
  "CREATE INDEX IF NOT EXISTS journal_lines_account_id_idx ON journal_lines(account_id)",
  "CREATE INDEX IF NOT EXISTS learning_enrollments_member_id_idx ON learning_enrollments(member_id)",
  "CREATE INDEX IF NOT EXISTS learning_progress_member_id_idx ON learning_progress(member_id)",
  "CREATE INDEX IF NOT EXISTS ai_decisions_status_idx ON ai_decisions(status)",
  "CREATE INDEX IF NOT EXISTS authority_audit_created_at_idx ON authority_audit_log(created_at)",
];

console.log(`Using ${selectedName} from local environment.`);
for (const statement of statements) await sql(asSqlTemplate(statement));
console.log(`Final Charter core schema applied successfully over Neon HTTPS (${statements.length} statements).`);
