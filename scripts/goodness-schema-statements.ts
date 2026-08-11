export const DROP_GOODNESS_TABLES: readonly string[] = [
  "DROP TABLE IF EXISTS goodness_reviews CASCADE",
  "DROP TABLE IF EXISTS goodness_criteria CASCADE",
];

export const CREATE_GOODNESS_TABLES: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS goodness_criteria (
    id serial PRIMARY KEY,
    key text NOT NULL UNIQUE,
    name text NOT NULL,
    description text NOT NULL,
    question text NOT NULL,
    non_waivable boolean NOT NULL DEFAULT true,
    active boolean NOT NULL DEFAULT true,
    created_by_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS goodness_reviews (
    id serial PRIMARY KEY,
    work_order_id integer NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    criterion_id integer NOT NULL REFERENCES goodness_criteria(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'pending',
    reviewer_member_id integer REFERENCES members(id) ON DELETE SET NULL,
    evidence text,
    notes text,
    reviewed_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  "CREATE INDEX IF NOT EXISTS goodness_reviews_work_order_id_idx ON goodness_reviews(work_order_id)",
  "CREATE INDEX IF NOT EXISTS goodness_reviews_criterion_id_idx ON goodness_reviews(criterion_id)",
];
