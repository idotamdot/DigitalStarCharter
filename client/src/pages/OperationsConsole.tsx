import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

interface Role { id: number; name: string; domain: string; description: string; revenueResponsibility?: string | null; }
interface WorkOrder { id: number; title: string; status: string; expectedRevenueCents: number; actualRevenueCents: number; }
interface Decision { id: number; title: string; domain: string; status: string; consequenceLevel: string; recommendation: string; rationale: string; }
interface GrowthPlan { id: number; proposedRoleName: string; safeToAdd: boolean; status: string; analysis: { monthlyMargin?: number; requiredReserveCents?: number } | null; }
interface Person { id: number; fullName: string; email: string; }
interface Summary {
  roles: Role[];
  work: WorkOrder[];
  decisions: Decision[];
  growth: GrowthPlan[];
  people: Person[];
  totals: { incomeCents: number; expenseCents: number; reserveCents: number };
}

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function OperationsConsole() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Summary>({ queryKey: ["/api/operating/summary"] });

  const bootstrap = useMutation({
    mutationFn: () => apiRequest("POST", "/api/operating/bootstrap", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/operating/summary"] }),
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      apiRequest("POST", `/api/operating/ai-decisions/${id}/review`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/operating/summary"] }),
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-emerald-300 font-semibold tracking-wide uppercase text-sm">Human-in-the-loop management</p>
              <h1 className="text-4xl font-bold mt-2">Charter Operating System</h1>
              <p className="text-slate-300 mt-3 max-w-3xl">People, work, finance, quality and growth in one accountable operating loop. AI may propose and analyze; consequential actions require human review.</p>
            </div>
            <Button onClick={() => bootstrap.mutate()} disabled={bootstrap.isPending}>Initialize human roles</Button>
          </div>

          {isLoading && <p>Loading operating system…</p>}
          {error && <Card><CardContent className="pt-6">The operating tables may not exist yet. Apply the Drizzle schema to Neon, then reload this page.</CardContent></Card>}

          {data && <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Metric title="Income recorded" value={money(data.totals.incomeCents)} />
              <Metric title="Operating costs" value={money(data.totals.expenseCents)} />
              <Metric title="Reserve recorded" value={money(data.totals.reserveCents)} />
              <Metric title="Net before distributions" value={money(data.totals.incomeCents - data.totals.expenseCents - data.totals.reserveCents)} />
            </div>

            <section>
              <h2 className="text-2xl font-bold mb-4">Human roles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {data.roles.map((role) => <Card key={role.id} className="bg-slate-900 border-slate-700 text-slate-100"><CardHeader><CardTitle>{role.name}</CardTitle></CardHeader><CardContent><p className="text-sm text-emerald-300 mb-2">{role.domain}</p><p className="text-sm text-slate-300">{role.description}</p>{role.revenueResponsibility && <p className="text-sm mt-3"><strong>Income impact:</strong> {role.revenueResponsibility}</p>}</CardContent></Card>)}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-700 text-slate-100">
                <CardHeader><CardTitle>Revenue work</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {data.work.length === 0 && <p className="text-slate-400">No work orders yet.</p>}
                  {data.work.slice(0, 8).map((work) => <div key={work.id} className="border border-slate-700 rounded-lg p-3"><div className="flex justify-between gap-4"><strong>{work.title}</strong><span>{work.status}</span></div><p className="text-sm text-slate-400 mt-1">Expected {money(work.expectedRevenueCents)} · Actual {money(work.actualRevenueCents)}</p></div>)}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700 text-slate-100">
                <CardHeader><CardTitle>Growth gate</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {data.growth.length === 0 && <p className="text-slate-400">No proposed permanent additions yet.</p>}
                  {data.growth.map((plan) => <div key={plan.id} className="border border-slate-700 rounded-lg p-3"><div className="flex justify-between"><strong>{plan.proposedRoleName}</strong><span className={plan.safeToAdd ? "text-emerald-300" : "text-amber-300"}>{plan.safeToAdd ? "Safe to add" : "Not yet safe"}</span></div><p className="text-sm text-slate-400 mt-1">Status: {plan.status}</p></div>)}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900 border-slate-700 text-slate-100">
              <CardHeader><CardTitle>AI proposals awaiting human judgment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {data.decisions.filter((d) => d.status === "human_review").length === 0 && <p className="text-slate-400">No decisions awaiting review.</p>}
                {data.decisions.filter((d) => d.status === "human_review").map((decision) => <div key={decision.id} className="border border-slate-700 rounded-lg p-4"><div className="flex flex-col md:flex-row md:justify-between gap-2"><div><p className="text-xs uppercase tracking-wide text-purple-300">{decision.domain} · {decision.consequenceLevel}</p><h3 className="font-bold text-lg">{decision.title}</h3></div><div className="flex gap-2"><Button variant="outline" onClick={() => review.mutate({ id: decision.id, status: "rejected" })}>Reject</Button><Button onClick={() => review.mutate({ id: decision.id, status: "approved" })}>Approve</Button></div></div><p className="mt-3">{decision.recommendation}</p><p className="text-sm text-slate-400 mt-2">Why: {decision.rationale}</p></div>)}
              </CardContent>
            </Card>
          </>}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return <Card className="bg-slate-900 border-slate-700 text-slate-100"><CardContent className="pt-6"><p className="text-sm text-slate-400">{title}</p><p className="text-2xl font-bold mt-1">{value}</p></CardContent></Card>;
}
