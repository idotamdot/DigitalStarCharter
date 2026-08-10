import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, ScrollText, ShieldCheck, TrendingUp, Users, WalletCards } from "lucide-react";
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
import type { OperatingDomain, LedgerEntryType } from "@shared/operating-schema";
import type { AuthorityAuditApi, OperatingSummaryApi } from "@shared/operating-api";

interface RoleDraft {
  name: string;
  domain: OperatingDomain;
  description: string;
  revenueResponsibility: string;
}

interface AssignmentDraft {
  memberId: string;
  roleId: string;
  compensation: string;
  notes: string;
}

interface LedgerDraft {
  type: LedgerEntryType;
  category: string;
  amount: string;
  description: string;
}

interface DistributionDraft {
  name: string;
  periodStart: string;
  periodEnd: string;
  reserveRate: string;
}

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const dollarsToCents = (value: string) => Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : 0;

export default function AdminConsole() {
  const queryClient = useQueryClient();
  const authority = useAuthority();
  const summary = useQuery<OperatingSummaryApi>({ queryKey: ["/api/operating/summary"], enabled: authority.isAdmin });
  const audit = useQuery<AuthorityAuditApi[]>({ queryKey: ["/api/operating/audit"], enabled: authority.isAdmin });

  const [role, setRole] = useState<RoleDraft>({ name: "", domain: "work", description: "", revenueResponsibility: "" });
  const [assignment, setAssignment] = useState<AssignmentDraft>({ memberId: "", roleId: "", compensation: "", notes: "" });
  const [ledger, setLedger] = useState<LedgerDraft>({ type: "income", category: "client-revenue", amount: "", description: "" });
  const [distribution, setDistribution] = useState<DistributionDraft>({ name: "", periodStart: "", periodEnd: "", reserveRate: "0.20" });
  const [growthReason, setGrowthReason] = useState<Record<number, string>>({});

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/operating/summary"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/operating/audit"] }),
    ]);
  };

  const bootstrap = useMutation({ mutationFn: () => apiRequest("POST", "/api/operating/bootstrap", {}), onSuccess: refresh });
  const createRole = useMutation({
    mutationFn: () => apiRequest("POST", "/api/operating/roles", {
      name: role.name,
      domain: role.domain,
      description: role.description,
      revenueResponsibility: role.revenueResponsibility || null,
      humanAuthority: true,
      active: true,
    }),
    onSuccess: async () => { setRole({ name: "", domain: "work", description: "", revenueResponsibility: "" }); await refresh(); },
  });
  const assignRole = useMutation({
    mutationFn: () => apiRequest("POST", "/api/operating/assignments", {
      memberId: Number(assignment.memberId),
      roleId: Number(assignment.roleId),
      compensationCentsMonthly: dollarsToCents(assignment.compensation),
      status: "active",
      notes: assignment.notes || null,
    }),
    onSuccess: async () => { setAssignment({ memberId: "", roleId: "", compensation: "", notes: "" }); await refresh(); },
  });
  const recordLedger = useMutation({
    mutationFn: () => apiRequest("POST", "/api/operating/ledger", {
      type: ledger.type,
      category: ledger.category,
      amountCents: dollarsToCents(ledger.amount),
      description: ledger.description,
      source: "manual-admin",
      metadata: {},
    }),
    onSuccess: async () => { setLedger({ type: "income", category: "client-revenue", amount: "", description: "" }); await refresh(); },
  });
  const calculateDistribution = useMutation({
    mutationFn: () => apiRequest("POST", "/api/operating/distributions/calculate", {
      name: distribution.name || undefined,
      periodStart: distribution.periodStart,
      periodEnd: distribution.periodEnd,
      reserveRate: Number(distribution.reserveRate),
    }),
    onSuccess: refresh,
  });
  const reviewDistribution = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) => apiRequest("POST", `/api/operating/distributions/${id}/review`, { status }),
    onSuccess: refresh,
  });
  const reviewGrowth = useMutation({
    mutationFn: ({ id, status, overrideUnsafe, reason }: { id: number; status: "approved" | "rejected"; overrideUnsafe: boolean; reason?: string }) =>
      apiRequest("POST", `/api/operating/growth/${id}/review`, { status, overrideUnsafe, reason }),
    onSuccess: refresh,
  });
  const reviewDecision = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) => apiRequest("POST", `/api/operating/ai-decisions/${id}/review`, { status }),
    onSuccess: refresh,
  });
  const executeDecision = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/operating/ai-decisions/${id}/execute`, { reason: "Administrator confirmed execution after human review" }),
    onSuccess: refresh,
  });

  const pendingDistributions = useMemo(() => summary.data?.distributions.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const pendingGrowth = useMemo(() => summary.data?.growth.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const pendingAi = useMemo(() => summary.data?.decisions.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const executableAi = useMemo(() => summary.data?.decisions.filter((item) => item.status === "approved" || item.status === "modified") ?? [], [summary.data]);

  if (authority.isLoading) return <PageMessage text="Checking administrator authority…" />;
  if (!authority.isAdmin) return <PageMessage text="This control plane is restricted to the configured human administrator." />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Human authority layer</p><h1 className="mt-2 flex items-center gap-3 text-4xl font-bold"><ShieldCheck className="h-9 w-9 text-emerald-300" /> Administrator Control Plane</h1><p className="mt-3 max-w-3xl text-slate-300">Identity comes from Neon Auth. This page controls organization-wide consequences that should never be executed silently by AI or ordinary members.</p></div>
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm"><div className="font-semibold text-emerald-100">Verified administrator</div><div className="text-emerald-100/70">{authority.data?.email}</div></div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Metric label="Recorded income" value={money(summary.data?.totals.incomeCents ?? 0)} />
          <Metric label="Recorded costs" value={money(summary.data?.totals.expenseCents ?? 0)} />
          <Metric label="Recorded reserve" value={money(summary.data?.totals.reserveCents ?? 0)} />
        </section>

        <Card className="mb-6 border-slate-700 bg-slate-900">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> People & authority</CardTitle><CardDescription>Admin creates the role structure and appoints people; members do not self-grant authority.</CardDescription></CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-3">
            <div><Button onClick={() => bootstrap.mutate()} disabled={bootstrap.isPending}>Initialize standard roles</Button></div>
            <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); createRole.mutate(); }}>
              <h3 className="font-semibold">Create role</h3>
              <Input value={role.name} onChange={(event) => setRole({ ...role, name: event.target.value })} placeholder="Role name" required />
              <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={role.domain} onChange={(event) => setRole({ ...role, domain: event.target.value as OperatingDomain })}>
                <option value="people">People</option><option value="work">Work</option><option value="finance">Finance</option><option value="quality">Quality</option><option value="growth">Growth</option><option value="governance">Governance</option>
              </select>
              <Textarea value={role.description} onChange={(event) => setRole({ ...role, description: event.target.value })} placeholder="Responsibility" required />
              <Textarea value={role.revenueResponsibility} onChange={(event) => setRole({ ...role, revenueResponsibility: event.target.value })} placeholder="Revenue or resilience responsibility" />
              <Button type="submit" disabled={createRole.isPending}>Create role</Button>
            </form>
            <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); assignRole.mutate(); }}>
              <h3 className="font-semibold">Assign member</h3>
              <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={assignment.memberId} onChange={(event) => setAssignment({ ...assignment, memberId: event.target.value })} required>
                <option value="">Choose member</option>{summary.data?.people.map((person) => <option key={person.id} value={person.id}>{person.displayName}{person.email ? ` · ${person.email}` : ""}</option>)}
              </select>
              <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={assignment.roleId} onChange={(event) => setAssignment({ ...assignment, roleId: event.target.value })} required>
                <option value="">Choose role</option>{summary.data?.roles.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <Input type="number" min="0" step="0.01" value={assignment.compensation} onChange={(event) => setAssignment({ ...assignment, compensation: event.target.value })} placeholder="Monthly compensation (USD)" />
              <Textarea value={assignment.notes} onChange={(event) => setAssignment({ ...assignment, notes: event.target.value })} placeholder="Assignment notes" />
              <Button type="submit" disabled={assignRole.isPending}>Assign role</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mb-6 border-slate-700 bg-slate-900">
          <CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5" /> Finance & shared prosperity</CardTitle></CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-2">
            <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); recordLedger.mutate(); }}>
              <h3 className="font-semibold">Record organizational money</h3>
              <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={ledger.type} onChange={(event) => setLedger({ ...ledger, type: event.target.value as LedgerEntryType })}><option value="income">Income</option><option value="expense">Expense</option><option value="reserve">Reserve</option><option value="adjustment">Adjustment</option></select>
              <Input value={ledger.category} onChange={(event) => setLedger({ ...ledger, category: event.target.value })} placeholder="Category" required />
              <Input type="number" min="0" step="0.01" value={ledger.amount} onChange={(event) => setLedger({ ...ledger, amount: event.target.value })} placeholder="Amount (USD)" required />
              <Textarea value={ledger.description} onChange={(event) => setLedger({ ...ledger, description: event.target.value })} placeholder="Purpose" required />
              <Button type="submit" disabled={recordLedger.isPending}>Record entry</Button>
            </form>
            <div className="space-y-5">
              <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); calculateDistribution.mutate(); }}>
                <h3 className="font-semibold">Prepare equal-share distribution</h3>
                <Input value={distribution.name} onChange={(event) => setDistribution({ ...distribution, name: event.target.value })} placeholder="Name (optional)" />
                <div className="grid grid-cols-2 gap-3"><div><Label>Start</Label><Input type="date" value={distribution.periodStart} onChange={(event) => setDistribution({ ...distribution, periodStart: event.target.value })} required /></div><div><Label>End</Label><Input type="date" value={distribution.periodEnd} onChange={(event) => setDistribution({ ...distribution, periodEnd: event.target.value })} required /></div></div>
                <div><Label>Reserve rate</Label><Input type="number" min="0" max="1" step="0.01" value={distribution.reserveRate} onChange={(event) => setDistribution({ ...distribution, reserveRate: event.target.value })} /></div>
                <Button type="submit" disabled={calculateDistribution.isPending}>Calculate for review</Button>
              </form>
              {pendingDistributions.map((item) => <ReviewRow key={item.id} title={item.name} detail={`${money(item.distributableCents)} distributable · ${money(item.reserveContributionCents)} reserve`} onReject={() => reviewDistribution.mutate({ id: item.id, status: "rejected" })} onApprove={() => reviewDistribution.mutate({ id: item.id, status: "approved" })} />)}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Growth approvals</CardTitle><CardDescription>Unsafe growth can only be overridden explicitly and with a reason.</CardDescription></CardHeader><CardContent className="space-y-4">
            {pendingGrowth.map((plan) => <div key={plan.id} className="rounded-lg border border-slate-700 p-4"><div className="flex justify-between gap-3"><strong>{plan.proposedRoleName}</strong><Badge variant={plan.safeToAdd ? "default" : "outline"}>{plan.safeToAdd ? "Gate passed" : "Gate failed"}</Badge></div><p className="mt-2 text-sm text-slate-400">Monthly compensation {money(plan.monthlyCompensationCents)}</p>{!plan.safeToAdd && <Textarea className="mt-3" value={growthReason[plan.id] ?? ""} onChange={(event) => setGrowthReason({ ...growthReason, [plan.id]: event.target.value })} placeholder="Required reason to override the safety gate" />}<div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => reviewGrowth.mutate({ id: plan.id, status: "rejected", overrideUnsafe: false })}>Reject</Button><Button onClick={() => reviewGrowth.mutate({ id: plan.id, status: "approved", overrideUnsafe: !plan.safeToAdd, reason: growthReason[plan.id] })} disabled={!plan.safeToAdd && !(growthReason[plan.id]?.trim())}>Approve{!plan.safeToAdd ? " with override" : ""}</Button></div></div>)}
            {pendingGrowth.length === 0 && <p className="text-sm text-slate-400">No growth decisions awaiting review.</p>}
          </CardContent></Card>

          <Card className="border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI human-review queue</CardTitle><CardDescription>Review and execution are separate acts.</CardDescription></CardHeader><CardContent className="space-y-4">
            {pendingAi.map((decision) => <ReviewRow key={decision.id} title={decision.title} detail={decision.recommendation} onReject={() => reviewDecision.mutate({ id: decision.id, status: "rejected" })} onApprove={() => reviewDecision.mutate({ id: decision.id, status: "approved" })} />)}
            {executableAi.map((decision) => <div key={decision.id} className="rounded-lg border border-emerald-500/30 p-4"><strong>{decision.title}</strong><p className="mt-2 text-sm text-slate-400">Human-approved, not yet executed.</p><Button className="mt-3" onClick={() => executeDecision.mutate(decision.id)}>Confirm execution</Button></div>)}
            {pendingAi.length === 0 && executableAi.length === 0 && <p className="text-sm text-slate-400">No AI proposals need administrator action.</p>}
          </CardContent></Card>
        </div>

        <Card className="border-slate-700 bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" /> Authority audit</CardTitle></CardHeader><CardContent className="space-y-2">
          {(audit.data ?? []).slice(0, 50).map((entry) => <div key={entry.id} className="grid gap-1 rounded-lg border border-slate-800 p-3 text-sm md:grid-cols-[160px_1fr_auto]"><span className="text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span><span><strong>{entry.action}</strong> · {entry.targetType}{entry.targetId ? ` #${entry.targetId}` : ""}{entry.reason ? ` · ${entry.reason}` : ""}</span><Badge variant="outline">{entry.authority}</Badge></div>)}
          {(audit.data?.length ?? 0) === 0 && <p className="text-sm text-slate-400">No authority actions have been recorded yet.</p>}
        </CardContent></Card>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <Card className="border-slate-700 bg-slate-900"><CardContent className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></CardContent></Card>; }
function ReviewRow({ title, detail, onReject, onApprove }: { title: string; detail: string; onReject: () => void; onApprove: () => void }) { return <div className="rounded-lg border border-slate-700 p-4"><strong>{title}</strong><p className="mt-2 text-sm text-slate-400">{detail}</p><div className="mt-3 flex gap-2"><Button variant="outline" onClick={onReject}>Reject</Button><Button onClick={onApprove}>Approve</Button></div></div>; }
function PageMessage({ text }: { text: string }) { return <div className="min-h-screen bg-slate-950 text-slate-100"><Navbar /><main className="mx-auto max-w-3xl px-4 pt-32"><Card className="border-slate-700 bg-slate-900"><CardContent className="p-8">{text}</CardContent></Card></main></div>; }
