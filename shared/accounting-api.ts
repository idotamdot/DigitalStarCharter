import type { AccountingMetadata, AccountNormalBalance, AccountType, JournalEntryStatus } from "./accounting-schema";

export interface AccountApi {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: AccountNormalBalance;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface AccountingSummaryApi {
  revenueCents: number;
  expenseCents: number;
  operatingCashCents: number;
  reserveCashCents: number;
}

export interface JournalSummaryApi {
  id: number;
  occurredAt: string;
  description: string;
  status: JournalEntryStatus;
  recordedByMemberId: number | null;
  approvedByMemberId: number | null;
  metadata: AccountingMetadata;
  createdAt: string;
  debitCents: number;
  creditCents: number;
}

export interface JournalLineApi {
  id: number;
  journalEntryId: number;
  accountId: number;
  debitCents: number;
  creditCents: number;
  memo: string | null;
}
