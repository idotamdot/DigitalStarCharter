export const DROP_ROLE_FIT_TABLES: readonly string[] = [
  "DROP TABLE IF EXISTS role_profiles CASCADE",
];

export const CREATE_ROLE_FIT_TABLES: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS role_profiles (
    role_id integer PRIMARY KEY REFERENCES charter_roles(id) ON DELETE CASCADE,
    required_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
    helpful_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
    work_characteristics jsonb NOT NULL DEFAULT '[]'::jsonb,
    learning_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
    notes text,
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
];
