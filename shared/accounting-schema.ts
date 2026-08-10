import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { members } from "./identity-schema";

export const accountTypeSchema = z.enum(["asset", "liability", "equity", "revenue", "expense"]);
export type AccountType = z.infer<typeof accountTypeSchema>;

export const accountNormalBalanceSchema = z.enum(["debit", "credit"]);
export type AccountNormalBalance = z.infer<typeof accountNormalBalanceSchema>;

export const journalEntryStatusSchema = z.enum(["draft", "posted", "voided"]);
export type JournalEntryStatus = z.infer<typeof journalEntryStatusSchema>;

export interface AccountingMetadata {
  source?: string;
  externalReference?: string;
  workOrderId?: number;
  distributionPeriodId?: number;
  note?: string;
}

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").$type<AccountType>().notNull(),
  normalBalance: text("normal_balance").$type<AccountNormalBalance>().notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  description: text("description").notNull(),
  status: text("status").$type<JournalEntryStatus>().default("posted").notNull(),
  recordedByMemberId: integer("recorded_by_member_id").references(() => members.id, { onDelete: "set null" }),
  approvedByMemberId: integer("approved_by_member_id").references(() => members.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  reversalOfEntryId: integer("reversal_of_entry_id"),
  metadata: jsonb("metadata").$type<AccountingMetadata>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalLines = pgTable("journal_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id, { onDelete: "cascade" }).notNull(),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "restrict" }).notNull(),
  debitCents: integer("debit_cents").default(0).notNull(),
  creditCents: integer("credit_cents").default(0).notNull(),
  memo: text("memo"),
});

export const insertAccountSchema = createInsertSchema(accounts, {
  type: accountTypeSchema,
  normalBalance: accountNormalBalanceSchema,
}).omit({ id: true, createdAt: true });

export const insertJournalEntrySchema = createInsertSchema(journalEntries, {
  status: journalEntryStatusSchema,
}).omit({ id: true, createdAt: true });

export const journalLineInputSchema = z.object({
  accountId: z.number().int().positive(),
  debitCents: z.number().int().nonnegative().default(0),
  creditCents: z.number().int().nonnegative().default(0),
  memo: z.string().trim().max(500).nullable().optional(),
}).superRefine((line, ctx) => {
  const hasDebit = line.debitCents > 0;
  const hasCredit = line.creditCents > 0;
  if (hasDebit === hasCredit) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Each journal line must contain exactly one positive debit or credit",
    });
  }
});

export const postJournalEntrySchema = z.object({
  occurredAt: z.coerce.date().optional(),
  description: z.string().trim().min(1).max(1000),
  metadata: z.object({
    source: z.string().trim().max(100).optional(),
    externalReference: z.string().trim().max(200).optional(),
    workOrderId: z.number().int().positive().optional(),
    distributionPeriodId: z.number().int().positive().optional(),
    note: z.string().trim().max(1000).optional(),
  }).optional(),
  lines: z.array(journalLineInputSchema).min(2),
}).superRefine((entry, ctx) => {
  const debitTotal = entry.lines.reduce((total, line) => total + line.debitCents, 0);
  const creditTotal = entry.lines.reduce((total, line) => total + line.creditCents, 0);
  if (debitTotal <= 0 || debitTotal !== creditTotal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Journal entry debits and credits must be positive and exactly balanced",
      path: ["lines"],
    });
  }
});

export type Account = typeof accounts.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type JournalLine = typeof journalLines.$inferSelect;
export type PostJournalEntryInput = z.infer<typeof postJournalEntrySchema>;
