import type { Express } from "express";
import { db } from "./db";
import { requireAuth } from "./auth";
import { requireCapability, writeAuthorityAudit } from "./access-control";
import { accounts, journalEntries, journalLines, postJournalEntrySchema } from "@shared/accounting-schema";
import {
  ensureDefaultAccounts,
  getAccountingTotals,
  getRecentJournalEntries,
  postBalancedJournal,
} from "./accounting-service";

export function registerAccountingRoutes(app: Express) {
  app.post("/api/accounting/bootstrap", requireAuth, requireCapability("admin"), async (req, res) => {
    const createdOrExisting = await ensureDefaultAccounts();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "admin",
      action: "bootstrap_chart_of_accounts",
      targetType: "accounts",
      metadata: { accountCount: createdOrExisting.length },
    });
    res.json(createdOrExisting);
  });

  app.get("/api/accounting/accounts", requireAuth, async (_req, res) => {
    const rows = await db.select().from(accounts).orderBy(accounts.code);
    res.json(rows);
  });

  app.get("/api/accounting/summary", requireAuth, async (_req, res) => {
    const totals = await getAccountingTotals();
    res.json(totals);
  });

  app.get("/api/accounting/journal", requireAuth, requireCapability("finance.record"), async (_req, res) => {
    const entries = await getRecentJournalEntries(100);
    res.json(entries.map((entry) => ({
      ...entry,
      occurredAt: entry.occurredAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    })));
  });

  app.get("/api/accounting/journal/:id", requireAuth, requireCapability("finance.record"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid journal entry id" });

    const [entry] = await db.select().from(journalEntries).where((await import("drizzle-orm")).eq(journalEntries.id, id)).limit(1);
    if (!entry) return res.status(404).json({ message: "Journal entry not found" });
    const lines = await db.select().from(journalLines).where((await import("drizzle-orm")).eq(journalLines.journalEntryId, id));
    res.json({ entry, lines });
  });

  app.post("/api/accounting/journal", requireAuth, requireCapability("finance.record"), async (req, res) => {
    const input = postJournalEntrySchema.parse(req.body as unknown);
    const entryId = await postBalancedJournal(input, req.member!.id);
    await writeAuthorityAudit({
      actor: req.member,
      authority: "finance.record",
      action: "post_balanced_journal_entry",
      targetType: "journal_entry",
      targetId: entryId,
      metadata: {
        debitCents: input.lines.reduce((sum, line) => sum + line.debitCents, 0),
        lineCount: input.lines.length,
      },
    });
    res.status(201).json({ id: entryId });
  });
}
