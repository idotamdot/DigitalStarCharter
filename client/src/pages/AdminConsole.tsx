import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, BrainCircuit, ScrollText, ShieldCheck, TrendingUp, Users, WalletCards } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useAuthority } from "@/hooks/use-authority";
import type { AccountApi } from "@shared/accounting-api";
import type { OperatingDomain } from "@shared/operating-schema";
import type { AuthorityAuditApi, OperatingSummaryApi } from "@shared/operating-api";

interface RoleDraft { name: string; domain: OperatingDomain; description: string; revenueResponsibility: string; }
interface AssignmentDraft { memberId: string; roleId: string; compensation: string; notes: string; }
interface JournalDraft { debitAccountId: string; creditAccountId: string; amount: string; description: string; externalReference: string; }
interface DistributionDraft { name: string; periodStart: string; periodEnd: string; reserveRate: string; }
interface GrowthDraft { proposedRoleName: string; monthlyCompensation: string; recurringMonthlyRevenue: string; recurringMonthlyCosts: string; reserveMonths: string; }

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const dollarsToCents = (value: string) => Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : 0;

export default function AdminConsole() {
  const queryClient = useQueryClient();
  const authority = useAuthority();
  const summary = useQuery<OperatingSummaryApi>({ queryKey: ["/api/operating/summary"], enabled: authority.isAdmin });
  const accounts = useQuery<AccountApi[]>({ queryKey: ["/api/accounting/accounts"], enabled: authority.isAdmin });
  const audit = useQuery<AuthorityAuditApi[]>({ queryKey: ["/api/operating/audit"], enabled: authority.isAdmin });

  const [role, setRole] = useState<RoleDraft>({ name: "", domain: "work", description: "", revenueResponsibility: "" });
  const [assignment, setAssignment] = useState<AssignmentDraft>({ memberId: "", roleId: "", compensation: "", notes: "" });
  const [journal, setJournal] = useState<JournalDraft>({ debitAccountId: "", creditAccountId: "", amount: "", description: "", externalReference: "" });
  const [distribution, setDistribution] = useState<DistributionDraft>({ name: "", periodStart: "", periodEnd: "", reserveRate: "0.20" });
  const [growth, setGrowth] = useState<GrowthDraft>({ proposedRoleName: "", monthlyCompensation: "", recurringMonthlyRevenue: "", recurringMonthlyCosts: "", reserveMonths: "6" });
  const [growthReason, setGrowthReason] = useState<Record<number, string>>({});

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/operating/summary"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/accounts"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/summary"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/journal"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/operating/audit"] }),
    ]);
  };

  const bootstrap = useMutation({ mutationFn: () => apiRequest("POST", "/api/operating/bootstrap", {}), onSuccess: refresh });
  const createRole = useMutation({ mutationFn: () => apiRequest("POST", "/api/operating/roles", { name: role.name, domain: role.domain, description: role.description, revenueResponsibility: role.revenueResponsibility || null, humanAuthority: true, active: true }), onSuccess: async () => { setRole({ name: "", domain: "work", description: "", revenueResponsibility: "" }); await refresh(); } });
  const assignRole = useMutation({ mutationFn: () => apiRequest("POST", "/api/operating/assignments", { memberId: Number(assignment.memberId), roleId: Number(assignment.roleId), compensationCentsMonthly: dollarsToCents(assignment.compensation), status: "active", notes: assignment.notes || null }), onSuccess: async () => { setAssignment({ memberId: "", roleId: "", compensation: "", notes: "" }); await refresh(); } });
  const postJournal = useMutation({ mutationFn: () => { const amountCents = dollarsToCents(journal.amount); return apiRequest("POST", "/api/accounting/journal", { description: journal.description, metadata: { source: "admin-manual", externalReference: journal.externalReference || undefined }, lines: [{ accountId: Number(journal.debitAccountId), debitCents: amountCents, creditCents: 0 }, { accountId: Number(journal.creditAccountId), debitCents: 0, creditCents: amountCents }] }); }, onSuccess: async () => { setJournal({ debitAccountId: "", creditAccountId: "", amount: "", description: "", externalReference: "" }); await refresh(); } });
  const calculateDistribution = useMutation({ mutationFn: () => apiRequest("POST", "/api/operating/distributions/calculate", { name: distribution.name || undefined, periodStart: distribution.periodStart, periodEnd: distribution.periodEnd, reserveRate: Number(distribution.reserveRate) }), onSuccess: refresh });
  const reviewDistribution = useMutation({ mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) => apiRequest("POST", `/api/operating/distributions/${id}/review`, { status }), onSuccess: refresh });
  const evaluateGrowth = useMutation({ mutationFn: () => apiRequest("POST", "/api/operating/growth/evaluate", { proposedRoleName: growth.proposedRoleName, monthlyCompensationCents: dollarsToCents(growth.monthlyCompensation), recurringMonthlyRevenueCents: dollarsToCents(growth.recurringMonthlyRevenue), recurringMonthlyCostsCents: dollarsToCents(growth.recurringMonthlyCosts), requiredReserveMonths: growth.reserveMonths, status: "draft" }), onSuccess: async () => { setGrowth({ proposedRoleName: "", monthlyCompensation: "", recurringMonthlyRevenue: "", recurringMonthlyCosts: "", reserveMonths: "6" }); await refresh(); } });
  const reviewGrowth = useMutation({ mutationFn: ({ id, status, overrideUnsafe, reason }: { id: number; status: "approved" | "rejected"; overrideUnsafe: boolean; reason?: string }) => apiRequest("POST", `/api/operating/growth/${id}/review`, { status, overrideUnsafe, reason }), onSuccess: refresh });
  const reviewDecision = useMutation({ mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) => apiRequest("POST", `/api/operating/ai-decisions/${id}/review`, { status }), onSuccess: refresh });

  const pendingDistributions = useMemo(() => summary.data?.distributions.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const pendingGrowth = useMemo(() => summary.data?.growth.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const pendingAi = useMemo(() => summary.data?.decisions.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const approvedAi = useMemo(() => summary.data?.decisions.filter((item) => item.status === "approved" || item.status === "modified") ?? [], [summary.data]);

  if (authority.isLoading) return <PageMessage text="Checking administrator authority…" />;
  if (!authority.isAdmin) return <PageMessage text="This control plane is restricted to the configured human administrator." />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Human authority layer</p>
            <h1 className="mt-2 flex items-center gap-3 text-4xl font-bold"><ShieldCheck className="h-9 w-9 text-emerald-300" /> Administrator Control Plane</h1>
            <p className="mt-3 max-w-3xl text-slate-300">Neon Auth establishes identity. Server capabilities define authority. This page handles organization-wide consequences and permanent approvals.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="outline"><Link href="/management"><BrainCircuit className="mr-2 h-4 w-4" /> Management intelligence</Link></Button>
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm"><div className="font-semibold text-emerald-100">Verified administrator</div><div className="text-emerald-100/70">{authority.data?.email}</div></div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4"><Metric label="Earned revenue" value={money(summary.data?.totals.revenueCents ?? 0)} /><Metric label="Recognized expense" value={money(summary.data?.totals.expenseCents ?? 0)} /><Metric label="Operating cash" value={money(summary.data?.totals.operatingCashCents ?? 0)} /><Metric label="Reserve cash" value={money(summary.data?.totals.reserveCashCents ?? 0)} /></section>

        <Card className="mb-6 border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> People & authority</CardTitle><CardDescription>Initialize the standard system, create roles, and appoint members.</CardDescription></CardHeader><CardContent className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3"><Button onClick={() => bootstrap.mutate()} disabled={bootstrap.isPending}>Initialize standard system</Button><p className="text-sm text-slate-400">Creates the standard roles, chart of accounts, and quality standards when missing.</p></div>
          <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); createRole.mutate(); }}><h3 className="font-semibold">Create role</h3><Input value={role.name} onChange={(event) => setRole({ ...role, name: event.target.value })} placeholder="Role name" required /><select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={role.domain} onChange={(event) => setRole({ ...role, domain: event.target.value as OperatingDomain })}><option value="people">People</option><option value="work">Work</option><option value="finance">Finance</option><option value="quality">Quality</option><option value="growth">Growth</option><option value="governance">Governance</option></select><Textarea value={role.description} onChange={(event) => setRole({ ...role, description: event.target.value })} placeholder="Responsibility" required /><Textarea value={role.revenueResponsibility} onChange={(event) => setRole({ ...role, revenueResponsibility: event.target.value })} placeholder="Revenue or resilience responsibility" /><Button type="submit" disabled={createRole.isPending}>Create role</Button></form>
          <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); assignRole.mutate(); }}><h3 className="font-semibold">Assign member</h3><select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={assignment.memberId} onChange={(event) => setAssignment({ ...assignment, memberId: event.target.value })} required><option value="">Choose member</option>{summary.data?.people.map((person) => <option key={person.id} value={person.id}>{person.displayName}{person.email ? ` · ${person.email}` : ""}</option>)}</select><select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={assignment.roleId} onChange={(event) => setAssignment({ ...assignment, roleId: event.target.value })} required><option value="">Choose role</option>{summary.data?.roles.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Input type="number" min="0" step="0.01" value={assignment.compensation} onChange={(event) => setAssignment({ ...assignment, compensation: event.target.value })} placeholder="Monthly compensation (USD)" /><Textarea value={assignment.notes} onChange={(event) => setAssignment({ ...assignment, notes: event.target.value })} placeholder="Assignment notes" /><Button type="submit" disabled={assignRole.isPending}>Assign role</Button></form>
        </CardContent></Card>

        <Card className="mb-6 border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5" /> Balanced accounting</CardTitle><CardDescription>Every financial record posts equal debits and credits. Work-order reported revenue never replaces the journal.</CardDescription></CardHeader><CardContent className="grid gap-8 lg:grid-cols-2">
          <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); postJournal.mutate(); }}><h3 className="font-semibold">Post journal entry</h3><Input value={journal.description} onChange={(event) => setJournal({ ...journal, description: event.target.value })} placeholder="What happened" required /><div className="grid gap-3 md:grid-cols-2"><select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={journal.debitAccountId} onChange={(event) => setJournal({ ...journal, debitAccountId: event.target.value })} required><option value="">Debit account</option>{accounts.data?.filter((account) => account.active).map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}</select><select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={journal.creditAccountId} onChange={(event) => setJournal({ ...journal, creditAccountId: event.target.value })} required><option value="">Credit account</option>{accounts.data?.filter((account) => account.active).map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}</select></div><Input type="number" min="0.01" step="0.01" value={journal.amount} onChange={(event) => setJournal({ ...journal, amount: event.target.value })} placeholder="Amount (USD)" required /><Input value={journal.externalReference} onChange={(event) => setJournal({ ...journal, externalReference: event.target.value })} placeholder="Receipt / invoice / external reference (optional)" /><Button type="submit" disabled={postJournal.isPending || journal.debitAccountId === journal.creditAccountId}>Post balanced entry</Button></form>
          <div className="space-y-3"><h3 className="font-semibold">Chart of accounts</h3>{accounts.data?.map((account) => <div key={account.id} className="flex items-start justify-between gap-4 rounded-md border border-slate-800 p-3"><div><strong>{account.code} · {account.name}</strong><p className="text-xs text-slate-400">{account.description}</p></div><Badge variant="outline" className="capitalize">{account.type}</Badge></div>)}{accounts.data?.length === 0 && <p className="text-sm text-slate-400">Initialize the standard system to create the chart of accounts.</p>}</div>
        </CardContent></Card>

        <Card className="mb-6 border-slate-700 bg-slate-900"><CardHeader><CardTitle>Shared prosperity</CardTitle><CardDescription>Distribution calculations use posted revenue and expense journals for the selected period.</CardDescription></CardHeader><CardContent className="grid gap-8 lg:grid-cols-2"><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); calculateDistribution.mutate(); }}><Input value={distribution.name} onChange={(event) => setDistribution({ ...distribution, name: event.target.value })} placeholder="Distribution name (optional)" /><div className="grid grid-cols-2 gap-3"><div><Label>Start</Label><Input type="date" value={distribution.periodStart} onChange={(event) => setDistribution({ ...distribution, periodStart: event.target.value })} required /></div><div><Label>End</Label><Input type="date" value={distribution.periodEnd} onChange={(event) => setDistribution({ ...distribution, periodEnd: event.target.value })} required /></div></div><div><Label>Reserve rate</Label><Input type="number" min="0" max="1" step="0.01" value={distribution.reserveRate} onChange={(event) => setDistribution({ ...distribution, reserveRate: event.target.value })} /></div><Button type="submit" disabled={calculateDistribution.isPending}>Calculate for human review</Button></form><div className="space-y-3">{pendingDistributions.map((item) => <ReviewRow key={item.id} title={item.name} detail={`${money(item.distributableCents)} distributable · ${money(item.reserveContributionCents)} reserve`} onReject={() => reviewDistribution.mutate({ id: item.id, status: "rejected" })} onApprove={() => reviewDistribution.mutate({ id: item.id, status: "approved" })} />)}{pendingDistributions.length === 0 && <p className="text-sm text-slate-400">No distributions await review.</p>}</div></CardContent></Card>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Sustainable growth</CardTitle><CardDescription>Evaluate a permanent role against recurring economics and posted cash.</CardDescription></CardHeader><CardContent className="space-y-5"><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); evaluateGrowth.mutate(); }}><Input value={growth.proposedRoleName} onChange={(event) => setGrowth({ ...growth, proposedRoleName: event.target.value })} placeholder="Proposed permanent role" required /><Input type="number" min="0" step="0.01" value={growth.monthlyCompensation} onChange={(event) => setGrowth({ ...growth, monthlyCompensation: event.target.value })} placeholder="Monthly compensation" required /><Input type="number" min="0" step="0.01" value={growth.recurringMonthlyRevenue} onChange={(event) => setGrowth({ ...growth, recurringMonthlyRevenue: event.target.value })} placeholder="Recurring monthly revenue" required /><Input type="number" min="0" step="0.01" value={growth.recurringMonthlyCosts} onChange={(event) => setGrowth({ ...growth, recurringMonthlyCosts: event.target.value })} placeholder="Existing recurring monthly costs" required /><Input type="number" min="1" step="1" value={growth.reserveMonths} onChange={(event) => setGrowth({ ...growth, reserveMonths: event.target.value })} placeholder="Reserve months" required /><Button type="submit" disabled={evaluateGrowth.isPending}>Evaluate growth gate</Button></form>{pendingGrowth.map((plan) => <div key={plan.id} className="rounded-lg border border-slate-700 p-4"><div className="flex justify-between gap-3"><strong>{plan.proposedRoleName}</strong><Badge variant={plan.safeToAdd ? "default" : "outline"}>{plan.safeToAdd ? "Gate passed" : "Gate failed"}</Badge></div><p className="mt-2 text-sm text-slate-400">Monthly compensation {money(plan.monthlyCompensationCents)}</p>{!plan.safeToAdd && <Textarea className="mt-3" value={growthReason[plan.id] ?? ""} onChange={(event) => setGrowthReason({ ...growthReason, [plan.id]: event.target.value })} placeholder="Required reason if overriding the failed gate" />}<div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => reviewGrowth.mutate({ id: plan.id, status: "rejected", overrideUnsafe: false })}>Reject</Button><Button onClick={() => reviewGrowth.mutate({ id: plan.id, status: "approved", overrideUnsafe: !plan.safeToAdd, reason: growthReason[plan.id] })} disabled={!plan.safeToAdd && !(growthReason[plan.id]?.trim())}>Approve{!plan.safeToAdd ? " with override" : ""}</Button></div></div>)}</CardContent></Card>

          <Card className="border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI review</CardTitle><CardDescription>Approval records human judgment. Advisory proposals do not become executed actions merely by changing status.</CardDescription></CardHeader><CardContent className="space-y-4">{pendingAi.map((decision) => <ReviewRow key={decision.id} title={decision.title} detail={`${decision.domain} · ${decision.consequenceLevel} · ${decision.recommendation}`} onReject={() => reviewDecision.mutate({ id: decision.id, status: "rejected" })} onApprove={() => reviewDecision.mutate({ id: decision.id, status: "approved" })} />)}{approvedAi.map((decision) => <div key={decision.id} className="rounded-lg border border-emerald-800/50 p-4"><strong>{decision.title}</strong><p className="mt-1 text-sm text-slate-400">Approved as a recommendation. Carry it out only through the appropriate human-controlled domain workflow.</p></div>)}{pendingAi.length === 0 && approvedAi.length === 0 && <p className="text-sm text-slate-400">No AI decisions require administrator action.</p>}</CardContent></Card>
        </div>

        <Card className="border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" /> Authority audit</CardTitle><CardDescription>Permanent record of consequential authority use.</CardDescription></CardHeader><CardContent className="space-y-2">{audit.data?.slice(0, 60).map((entry) => <div key={entry.id} className="grid gap-1 rounded-md border border-slate-800 p-3 text-sm md:grid-cols-[180px_1fr_auto]"><span className="text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span><span>{entry.action} · {entry.targetType}{entry.targetId ? ` #${entry.targetId}` : ""}</span><Badge variant="outline">{entry.authority}</Badge>{entry.reason && <p className="md:col-start-2 text-xs text-slate-400">Reason: {entry.reason}</p>}</div>)}</CardContent></Card>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <Card className="border-slate-700 bg-slate-900"><CardContent className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></CardContent></Card>; }
function ReviewRow({ title, detail, onReject, onApprove }: { title: string; detail: string; onReject: () => void; onApprove: () => void }) { return <div className="rounded-lg border border-slate-700 p-4"><strong>{title}</strong><p className="mt-1 text-sm text-slate-400">{detail}</p><div className="mt-3 flex gap-2"><Button variant="outline" onClick={onReject}>Reject</Button><Button onClick={onApprove}>Approve</Button></div></div>; }
function PageMessage({ text }: { text: string }) { return <div className="min-h-screen bg-slate-950 text-slate-100"><Navbar /><main className="mx-auto max-w-3xl px-6 pt-32"><Card className="border-slate-700 bg-slate-900"><CardContent className="p-8">{text}</CardContent></Card></main></div>; }
