import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Users, WalletCards, TrendingUp, Bot, ScrollText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useAuthority } from "@/hooks/use-authority";

interface Role {
  id: number;
  name: string;
  domain: string;
  description: string;
  active: boolean;
}

interface Person {
  id: number;
  fullName: string;
  email?: string;
}

interface DistributionPeriod {
  id: number;
  name: string;
  distributableCents: number;
  reserveContributionCents: number;
  status: string;
}

interface GrowthPlan {
  id: number;
  proposedRoleName: string;
  monthlyCompensationCents: number;
  safeToAdd: boolean;
  status: string;
}

interface Decision {
  id: number;
  title: string;
  domain: string;
  consequenceLevel: string;
  recommendation: string;
  rationale: string;
  status: string;
}

interface AuditEntry {
  id: number;
  actorEmail: string | null;
  authority: string;
  action: string;
  targetType: string;
  targetId: string | null;
  outcome: string;
  reason: string | null;
  createdAt: string;
}

interface Summary {
  roles: Role[];
  people: Person[];
  distributions: DistributionPeriod[];
  growth: GrowthPlan[];
  decisions: Decision[];
  totals: { incomeCents: number; expenseCents: number; reserveCents: number };
}

const money = (cents: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(cents / 100);

function dollarsToCents(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export default function AdminConsole() {
  const queryClient = useQueryClient();
  const authority = useAuthority();
  const summary = useQuery<Summary>({ queryKey: ["/api/operating/summary"], enabled: authority.isAdmin });
  const audit = useQuery<AuditEntry[]>({ queryKey: ["/api/operating/audit"], enabled: authority.isAdmin });

  const [role, setRole] = useState({ name: "", domain: "work", description: "", revenueResponsibility: "" });
  const [assignment, setAssignment] = useState({ userId: "", roleId: "", compensation: "", notes: "" });
  const [ledger, setLedger] = useState({ type: "income", category: "client-revenue", amount: "", description: "" });
  const [distribution, setDistribution] = useState({ name: "", periodStart: "", periodEnd: "", reserveRate: "0.20" });

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
    onSuccess: async () => {
      setRole({ name: "", domain: "work", description: "", revenueResponsibility: "" });
      await refresh();
    },
  });
  const assignRole = useMutation({
    mutationFn: () => apiRequest("POST", "/api/operating/assignments", {
      userId: Number(assignment.userId),
      roleId: Number(assignment.roleId),
      compensationCentsMonthly: dollarsToCents(assignment.compensation),
      status: "active",
      notes: assignment.notes || null,
    }),
    onSuccess: refresh,
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
    onSuccess: async () => {
      setLedger({ type: "income", category: "client-revenue", amount: "", description: "" });
      await refresh();
    },
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
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      apiRequest("POST", `/api/operating/distributions/${id}/review`, { status }),
    onSuccess: refresh,
  });
  const reviewGrowth = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" | "deferred" }) =>
      apiRequest("POST", `/api/operating/growth/${id}/review`, { status }),
    onSuccess: refresh,
  });
  const reviewDecision = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      apiRequest("POST", `/api/operating/ai-decisions/${id}/review`, { status }),
    onSuccess: refresh,
  });
  const executeDecision = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/operating/ai-decisions/${id}/execute`, {
      reason: "Administrator confirmed execution after human review",
    }),
    onSuccess: refresh,
  });

  const pendingDistributions = useMemo(() => summary.data?.distributions.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const pendingGrowth = useMemo(() => summary.data?.growth.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const pendingAi = useMemo(() => summary.data?.decisions.filter((item) => item.status === "human_review") ?? [], [summary.data]);
  const executableAi = useMemo(() => summary.data?.decisions.filter((item) => item.status === "approved" || item.status === "modified") ?? [], [summary.data]);

  if (authority.isLoading) return <PageMessage text="Checking administrator authority…" />;
  if (!authority.isAdmin) {
    return <PageMessage text="This control plane is restricted to the configured human administrator. Your Neon identity is signed in, but it does not hold administrator authority." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-amber-300 uppercase tracking-[0.18em] text-sm font-semibold">Human authority layer</p>
              <h1 className="text-4xl font-bold mt-2 flex items-center gap-3"><ShieldCheck className="h-9 w-9 text-emerald-300" /> Administrator Control Plane</h1>
              <p className="mt-3 text-slate-300 max-w-3xl">Neon Auth establishes identity. Server-side capabilities decide authority. AI can recommend; this layer controls organizational, financial and governance consequences.</p>
            </div>
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm">
              <div className="font-semibold text-emerald-100">Verified administrator</div>
              <div className="text-emerald-100/70">{authority.data?.email}</div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <Metric label="Recorded income" value={money(summary.data?.totals.incomeCents ?? 0)} />
            <Metric label="Recorded costs" value={money(summary.data?.totals.expenseCents ?? 0)} />
            <Metric label="Recorded reserve" value={money(summary.data?.totals.reserveCents ?? 0)} />
          </section>

          <Card className="bg-slate-900 border-slate-700 text-slate-100">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> People & authority</CardTitle></CardHeader>
            <CardContent className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Initialize the standard human roles once. Custom roles can then be added without changing the authority engine.</p>
                <Button onClick={() => bootstrap.mutate()} disabled={bootstrap.isPending}>Initialize standard roles</Button>
              </div>
              <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); createRole.mutate(); }}>
                <h3 className="font-semibold">Create role</h3>
                <Input value={role.name} onChange={(event) => setRole({ ...role, name: event.target.value })} placeholder="Role name" required />
                <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={role.domain} onChange={(event) => setRole({ ...role, domain: event.target.value })}>
                  <option value="people">People</option><option value="work">Work</option><option value="finance">Finance</option><option value="quality">Quality</option><option value="growth">Growth</option>
                </select>
                <Textarea value={role.description} onChange={(event) => setRole({ ...role, description: event.target.value })} placeholder="What this human is responsible for" required />
                <Textarea value={role.revenueResponsibility} onChange={(event) => setRole({ ...role, revenueResponsibility: event.target.value })} placeholder="How this role protects or creates income" />
                <Button type="submit" disabled={createRole.isPending}>Create role</Button>
              </form>
              <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); assignRole.mutate(); }}>
                <h3 className="font-semibold">Assign person to role</h3>
                <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={assignment.userId} onChange={(event) => setAssignment({ ...assignment, userId: event.target.value })} required>
                  <option value="">Choose person</option>
                  {summary.data?.people.map((person) => <option key={person.id} value={person.id}>{person.fullName}{person.email ? ` · ${person.email}` : ""}</option>)}
                </select>
                <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={assignment.roleId} onChange={(event) => setAssignment({ ...assignment, roleId: event.target.value })} required>
                  <option value="">Choose role</option>
                  {summary.data?.roles.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <Input type="number" min="0" step="0.01" value={assignment.compensation} onChange={(event) => setAssignment({ ...assignment, compensation: event.target.value })} placeholder="Monthly compensation (USD)" />
                <Textarea value={assignment.notes} onChange={(event) => setAssignment({ ...assignment, notes: event.target.value })} placeholder="Assignment notes" />
                <Button type="submit" disabled={assignRole.isPending}>Assign role</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 text-slate-100">
            <CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5" /> Finance & distribution</CardTitle></CardHeader>
            <CardContent className="grid gap-8 lg:grid-cols-2">
              <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); recordLedger.mutate(); }}>
                <h3 className="font-semibold">Record organization money</h3>
                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={ledger.type} onChange={(event) => setLedger({ ...ledger, type: event.target.value })}>
                    <option value="income">Income</option><option value="expense">Expense</option><option value="reserve">Reserve</option>
                  </select>
                  <Input value={ledger.category} onChange={(event) => setLedger({ ...ledger, category: event.target.value })} placeholder="Category" required />
                </div>
                <Input type="number" min="0" step="0.01" value={ledger.amount} onChange={(event) => setLedger({ ...ledger, amount: event.target.value })} placeholder="Amount (USD)" required />
                <Textarea value={ledger.description} onChange={(event) => setLedger({ ...ledger, description: event.target.value })} placeholder="What this money was for" required />
                <Button type="submit" disabled={recordLedger.isPending}>Record entry</Button>
              </form>

              <div className="space-y-5">
                <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); calculateDistribution.mutate(); }}>
                  <h3 className="font-semibold">Prepare equal-share distribution</h3>
                  <Input value={distribution.name} onChange={(event) => setDistribution({ ...distribution, name: event.target.value })} placeholder="Distribution name (optional)" />
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Period start</Label><Input type="date" value={distribution.periodStart} onChange={(event) => setDistribution({ ...distribution, periodStart: event.target.value })} required /></div>
                    <div><Label>Period end</Label><Input type="date" value={distribution.periodEnd} onChange={(event) => setDistribution({ ...distribution, periodEnd: event.target.value })} required /></div>
                  </div>
                  <div><Label>Reserve rate</Label><Input type="number" min="0" max="1" step="0.01" value={distribution.reserveRate} onChange={(event) => setDistribution({ ...distribution, reserveRate: event.target.value })} /></div>
                  <Button type="submit" disabled={calculateDistribution.isPending}>Calculate for human review</Button>
                </form>
                {pendingDistributions.map((item) => (
                  <ReviewRow key={item.id} title={item.name} detail={`${money(item.distributableCents)} distributable · ${money(item.reserveContributionCents)} to reserve`} onReject={() => reviewDistribution.mutate({ id: item.id, status: "rejected" })} onApprove={() => reviewDistribution.mutate({ id: item.id, status: "approved" })} />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-slate-900 border-slate-700 text-slate-100">
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Permanent growth approvals</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingGrowth.length === 0 && <p className="text-slate-400">No staffing plans await review.</p>}
                {pendingGrowth.map((item) => (
                  <ReviewRow key={item.id} title={item.proposedRoleName} detail={`${money(item.monthlyCompensationCents)}/month · ${item.safeToAdd ? "financial gate passed" : "financial gate NOT passed"}`} onReject={() => reviewGrowth.mutate({ id: item.id, status: "rejected" })} onApprove={() => reviewGrowth.mutate({ id: item.id, status: "approved" })} approveDisabled={!item.safeToAdd} />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700 text-slate-100">
              <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI management gate</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pendingAi.map((item) => <ReviewRow key={item.id} title={item.title} detail={`${item.domain} · ${item.consequenceLevel} · ${item.recommendation}`} onReject={() => reviewDecision.mutate({ id: item.id, status: "rejected" })} onApprove={() => reviewDecision.mutate({ id: item.id, status: "approved" })} />)}
                {executableAi.map((item) => <div key={item.id} className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4"><div className="font-semibold">{item.title}</div><p className="mt-1 text-sm text-slate-400">Human-approved; execution still requires an explicit administrator action.</p><Button className="mt-3" onClick={() => executeDecision.mutate(item.id)}>Mark executed</Button></div>)}
                {pendingAi.length === 0 && executableAi.length === 0 && <p className="text-slate-400">No AI proposals require administrator action.</p>}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-700 text-slate-100">
            <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" /> Authority audit trail</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {audit.data?.slice(0, 50).map((entry) => (
                <div key={entry.id} className="grid gap-1 rounded border border-slate-800 p-3 text-sm md:grid-cols-[180px_180px_1fr]">
                  <span className="text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                  <span className="text-amber-200">{entry.actorEmail || "system"}</span>
                  <span>{entry.action} · {entry.targetType}{entry.targetId ? ` #${entry.targetId}` : ""} · <strong>{entry.outcome}</strong></span>
                </div>
              ))}
              {audit.data?.length === 0 && <p className="text-slate-400">No authority actions have been recorded yet.</p>}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="bg-slate-900 border-slate-700 text-slate-100"><CardContent className="pt-6"><p className="text-sm text-slate-400">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></CardContent></Card>;
}

function ReviewRow({ title, detail, onReject, onApprove, approveDisabled = false }: { title: string; detail: string; onReject: () => void; onApprove: () => void; approveDisabled?: boolean }) {
  return <div className="rounded-lg border border-slate-700 p-4"><div className="font-semibold">{title}</div><p className="mt-1 text-sm text-slate-400">{detail}</p><div className="mt-3 flex gap-2"><Button variant="outline" onClick={onReject}>Reject</Button><Button onClick={onApprove} disabled={approveDisabled}>Approve</Button></div></div>;
}

function PageMessage({ text }: { text: string }) {
  return <div className="min-h-screen bg-slate-950 text-white"><Navbar /><main className="mx-auto max-w-3xl px-4 pt-32"><Card className="bg-slate-900 border-slate-700 text-slate-100"><CardContent className="pt-6">{text}</CardContent></Card></main></div>;
}
