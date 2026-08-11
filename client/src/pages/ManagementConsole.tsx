import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, BrainCircuit, Database, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useAuthority } from "@/hooks/use-authority";
import type {
  ManagementEngineStatusApi,
  ManagementFindingApi,
  ManagementRunApi,
  ManagementRunDetailApi,
  RunManagementCycleResponseApi,
} from "@shared/ai-management-api";
import type { ManagementFindingSeverity } from "@shared/ai-management-schema";

const money = (cents: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(cents / 100);

function severityVariant(severity: ManagementFindingSeverity): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "critical" || severity === "high") return "destructive";
  if (severity === "medium") return "default";
  if (severity === "low") return "secondary";
  return "outline";
}

export default function ManagementConsole() {
  const authority = useAuthority();
  const queryClient = useQueryClient();
  const status = useQuery<ManagementEngineStatusApi>({
    queryKey: ["/api/management/status"],
    enabled: authority.isAdmin,
  });
  const runs = useQuery<ManagementRunApi[]>({
    queryKey: ["/api/management/runs"],
    enabled: authority.isAdmin,
  });
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const detail = useQuery<ManagementRunDetailApi>({
    queryKey: [selectedRunId ? `/api/management/runs/${selectedRunId}` : "/api/management/runs/none"],
    enabled: authority.isAdmin && selectedRunId !== null,
  });

  useEffect(() => {
    if (selectedRunId === null && runs.data && runs.data.length > 0) {
      setSelectedRunId(runs.data[0].id);
    }
  }, [runs.data, selectedRunId]);

  const runCycle = useMutation({
    mutationFn: async (mode: "deterministic" | "hybrid") => {
      const response = await apiRequest("POST", "/api/management/run", { mode });
      const payload: unknown = await response.json();
      return payload as RunManagementCycleResponseApi;
    },
    onSuccess: async (result) => {
      setSelectedRunId(result.run.id);
      queryClient.setQueryData<ManagementRunDetailApi>([`/api/management/runs/${result.run.id}`], {
        run: result.run,
        findings: result.findings,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/management/runs"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/operating/summary"] }),
      ]);
    },
  });

  const selected = detail.data;
  const findingsByDomain = useMemo(() => {
    const grouped = new Map<string, ManagementFindingApi[]>();
    for (const finding of selected?.findings ?? []) {
      const group = grouped.get(finding.domain) ?? [];
      group.push(finding);
      grouped.set(finding.domain, group);
    }
    return [...grouped.entries()];
  }, [selected]);

  if (authority.isLoading) {
    return <PageMessage text="Checking administrator authority…" />;
  }
  if (!authority.isAdmin) {
    return <PageMessage text="Cross-domain AI management is restricted to the configured human administrator." />;
  }

  const snapshot = selected?.run.snapshot;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">AI observation & proposal layer</p>
            <h1 className="mt-2 flex items-center gap-3 text-4xl font-bold"><BrainCircuit className="h-9 w-9 text-violet-300" /> Management Intelligence</h1>
            <p className="mt-3 text-lg text-slate-300">
              The managers read a frozen factual snapshot, preserve their evidence, and send consequential recommendations to human review. They do not move money, assign authority, waive quality or execute growth decisions.
            </p>
          </div>
          <Button asChild variant="outline"><Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" /> Open human approvals</Link></Button>
        </header>

        <Card className="mb-6 border-violet-500/30 bg-violet-950/10">
          <CardContent className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold"><Database className="h-5 w-5 text-violet-300" /> Factual run first</div>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Deterministic managers always run from Neon data. Hybrid mode optionally asks OpenAI to prioritize and clarify those existing findings using aggregate metrics and de-identified facts; it cannot create new factual findings.
              </p>
              {status.data && !status.data.hybridConfigured && (
                <p className="mt-2 text-xs text-amber-300">Hybrid synthesis is not configured. Deterministic management remains fully available.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => runCycle.mutate("deterministic")} disabled={runCycle.isPending}>
                <Bot className="mr-2 h-4 w-4" /> Run factual cycle
              </Button>
              <Button
                variant="outline"
                onClick={() => runCycle.mutate("hybrid")}
                disabled={runCycle.isPending || !status.data?.hybridConfigured}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Run hybrid synthesis
              </Button>
            </div>
          </CardContent>
        </Card>

        {runCycle.error && (
          <Card className="mb-6 border-red-900/50 bg-red-950/20">
            <CardContent className="flex gap-3 p-5 text-red-100"><TriangleAlert className="h-5 w-5 shrink-0" /><span>{runCycle.error.message}</span></CardContent>
          </Card>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader><CardTitle>Management runs</CardTitle><CardDescription>Every cycle is retained with its snapshot and findings.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {(runs.data ?? []).map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => setSelectedRunId(run.id)}
                  className={selectedRunId === run.id ? "w-full rounded-lg border border-violet-500/50 bg-violet-950/20 p-4 text-left" : "w-full rounded-lg border border-slate-800 p-4 text-left hover:border-slate-700"}
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong>Run #{run.id}</strong>
                    <Badge variant="outline" className="capitalize">{run.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{new Date(run.startedAt).toLocaleString()} · {run.provider}</p>
                  {run.errorMessage && <p className="mt-2 text-xs text-amber-300">{run.errorMessage}</p>}
                </button>
              ))}
              {!runs.isLoading && (runs.data?.length ?? 0) === 0 && <p className="text-sm text-slate-400">No management run has been recorded yet.</p>}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {snapshot ? (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Active members" value={String(snapshot.activeMemberCount)} />
                  <Metric label="Active work" value={String(snapshot.activeWorkCount)} />
                  <Metric label="Operating cash" value={money(snapshot.operatingCashCents)} />
                  <Metric label="Reserve cash" value={money(snapshot.reserveCashCents)} />
                  <Metric label="30-day revenue" value={money(snapshot.revenueLast30DaysCents)} />
                  <Metric label="30-day expense" value={money(snapshot.expenseLast30DaysCents)} />
                  <Metric label="Quality blockers" value={String(snapshot.openQualityBlockCount)} />
                  <Metric label="Reserve runway" value={snapshot.reserveRunwayMonths === null ? "No expense baseline" : `${snapshot.reserveRunwayMonths.toFixed(1)} mo`} />
                </section>

                {findingsByDomain.map(([domain, findings]) => (
                  <Card key={domain} className="border-slate-800 bg-slate-900/55">
                    <CardHeader><CardTitle className="capitalize">{domain} manager</CardTitle><CardDescription>{findings.length} evidence-backed finding(s) in this run.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      {findings.map((finding) => (
                        <div key={finding.id} className="rounded-lg border border-slate-800 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div><h3 className="font-semibold">{finding.title}</h3><p className="mt-1 text-sm text-slate-400">{finding.summary}</p></div>
                            <div className="flex gap-2"><Badge variant={severityVariant(finding.severity)} className="capitalize">{finding.severity}</Badge>{finding.decisionId && <Badge variant="outline">Human review #{finding.decisionId}</Badge>}</div>
                          </div>
                          <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            <div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Recommendation</p><p className="mt-1 text-sm">{finding.recommendation}</p></div>
                            <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Rationale</p><p className="mt-1 text-sm text-slate-300">{finding.rationale}</p></div>
                          </div>
                          <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence</p>
                            {finding.evidence.map((evidence, index) => <p key={`${finding.id}-${index}`} className="text-xs text-slate-400">• {evidence.fact}</p>)}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}

                {selected?.findings.length === 0 && (
                  <Card className="border-emerald-500/20 bg-emerald-950/10"><CardContent className="p-6 text-sm text-emerald-100">No management rule produced a finding for this snapshot.</CardContent></Card>
                )}
              </>
            ) : (
              <Card className="border-slate-800 bg-slate-900/55"><CardContent className="p-8 text-center text-slate-400">Select or run a management cycle to inspect its factual snapshot.</CardContent></Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="border-slate-800 bg-slate-900/55"><CardContent className="p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></CardContent></Card>;
}

function PageMessage({ text }: { text: string }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-slate-200">{text}</div>;
}
