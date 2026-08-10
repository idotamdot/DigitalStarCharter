import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "./db";
import {
  accounts,
  journalEntries,
  journalLines,
  postJournalEntrySchema,
  type Account,
  type AccountingMetadata,
  type AccountType,
  type PostJournalEntryInput,
} from "@shared/accounting-schema";

export interface AccountSeed {
  code: string;
  name: string;
  type: AccountType;
  normalBalance: "debit" | "credit";
  description: string;
}

export const DEFAULT_ACCOUNTS: readonly AccountSeed[] = [
  { code: "1000", name: "Operating Cash", type: "asset", normalBalance: "debit", description: "Cash available for ordinary operations." },
  { code: "1100", name: "Reserve Cash", type: "asset", normalBalance: "debit", description: "Cash intentionally segregated for resilience and downside protection." },
  { code: "2000", name: "Accounts Payable", type: "liability", normalBalance: "credit", description: "Amounts owed to vendors and other counterparties." },
  { code: "2100", name: "Member Distributions Payable", type: "liability", normalBalance: "credit", description: "Approved member distributions not yet paid." },
  { code: "3000", name: "Member Capital", type: "equity", normalBalance: "credit", description: "Long-term capital contributed to the cooperative system." },
  { code: "3200", name: "Retained Surplus", type: "equity", normalBalance: "credit", description: "Surplus retained to strengthen and expand the system." },
  { code: "4000", name: "Earned Revenue", type: "revenue", normalBalance: "credit", description: "Revenue earned from products, services and aligned partnerships." },
  { code: "5000", name: "Operating Expense", type: "expense", normalBalance: "debit", description: "Ordinary non-compensation operating costs." },
  { code: "5100", name: "Member Compensation", type: "expense", normalBalance: "debit", description: "Compensation paid or accrued for member labor." },
];

export interface AccountingTotals {
  revenueCents: number;
  expenseCents: number;
  operatingCashCents: number;
  reserveCashCents: number;
}

export interface JournalSummary {
  id: number;
  occurredAt: Date;
  description: string;
  status: "draft" | "posted" | "voided";
  recordedByMemberId: number | null;
  approvedByMemberId: number | null;
  metadata: AccountingMetadata;
  createdAt: Date;
  debitCents: number;
  creditCents: number;
}

export async function ensureDefaultAccounts(): Promise<Account[]> {
  const existing = await db.select().from(accounts).orderBy(accounts.code);
  const existingCodes = new Set(existing.map((account) => account.code));
  const missing = DEFAULT_ACCOUNTS.filter((account) => !existingCodes.has(account.code));

  if (missing.length > 0) {
    await db.insert(accounts).values(missing.map((account) => ({ ...account, active: true })));
  }

  return db.select().from(accounts).orderBy(accounts.code);
}

export async function postBalancedJournal(
  rawInput: PostJournalEntryInput,
  recordedByMemberId: number,
): Promise<number> {
  const input = postJournalEntrySchema.parse(rawInput);
  const accountIds = [...new Set(input.lines.map((line) => line.accountId))];
  const activeAccounts = await db.select({ id: accounts.id, active: accounts.active }).from(accounts);
  const allowed = new Set(activeAccounts.filter((account) => account.active).map((account) => account.id));

  for (const accountId of accountIds) {
    if (!allowed.has(accountId)) {
      throw new Error(`Account ${accountId} does not exist or is inactive`);
    }
  }

  return db.transaction(async (tx) => {
    const [entry] = await tx.insert(journalEntries).values({
      occurredAt: input.occurredAt ?? new Date(),
      description: input.description,
      status: "posted",
      recordedByMemberId,
      approvedByMemberId: recordedByMemberId,
      approvedAt: new Date(),
      metadata: input.metadata ?? {},
    }).returning({ id: journalEntries.id });

    await tx.insert(journalLines).values(input.lines.map((line) => ({
      journalEntryId: entry.id,
      accountId: line.accountId,
      debitCents: line.debitCents,
      creditCents: line.creditCents,
      memo: line.memo ?? null,
    })));

    return entry.id;
  });
}

export async function getAccountingTotals(start?: Date, end?: Date): Promise<AccountingTotals> {
  const conditions = [eq(journalEntries.status, "posted")];
  if (start) conditions.push(gte(journalEntries.occurredAt, start));
  if (end) conditions.push(lte(journalEntries.occurredAt, end));

  const rows = await db.select({
    accountCode: accounts.code,
    accountType: accounts.type,
    debitCents: journalLines.debitCents,
    creditCents: journalLines.creditCents,
  })
    .from(journalLines)
    .innerJoin(journalEntries, eq(journalLines.journalEntryId, journalEntries.id))
    .innerJoin(accounts, eq(journalLines.accountId, accounts.id))
    .where(and(...conditions));

  let revenueCents = 0;
  let expenseCents = 0;
  let operatingCashCents = 0;
  let reserveCashCents = 0;

  for (const row of rows) {
    if (row.accountType === "revenue") revenueCents += row.creditCents - row.debitCents;
    if (row.accountType === "expense") expenseCents += row.debitCents - row.creditCents;
    if (row.accountCode === "1000") operatingCashCents += row.debitCents - row.creditCents;
    if (row.accountCode === "1100") reserveCashCents += row.debitCents - row.creditCents;
  }

  return { revenueCents, expenseCents, operatingCashCents, reserveCashCents };
}

export async function getRecentJournalEntries(limit = 50): Promise<JournalSummary[]> {
  const entries = await db.select().from(journalEntries).orderBy(desc(journalEntries.occurredAt)).limit(limit);
  if (entries.length === 0) return [];

  const entryIds = entries.map((entry) => entry.id);
  const lines = await db.select().from(journalLines).where(inArray(journalLines.journalEntryId, entryIds));
  const totalsByEntry = new Map<number, { debitCents: number; creditCents: number }>();

  for (const line of lines) {
    const current = totalsByEntry.get(line.journalEntryId) ?? { debitCents: 0, creditCents: 0 };
    current.debitCents += line.debitCents;
    current.creditCents += line.creditCents;
    totalsByEntry.set(line.journalEntryId, current);
  }

  return entries.map((entry) => ({
    id: entry.id,
    occurredAt: entry.occurredAt,
    description: entry.description,
    status: entry.status,
    recordedByMemberId: entry.recordedByMemberId,
    approvedByMemberId: entry.approvedByMemberId,
    metadata: entry.metadata,
    createdAt: entry.createdAt,
    ...(totalsByEntry.get(entry.id) ?? { debitCents: 0, creditCents: 0 }),
  }));
}
