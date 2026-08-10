import { useQuery } from "@tanstack/react-query";
import { Bot, BriefcaseBusiness, Landmark, ShieldCheck, TrendingUp, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import type { OperatingSummaryApi } from "@shared/operating-api";

const money = (cents: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(cents / 100);

export default function OperationsConsole() {
  const { member } = useAuth();
  const summaryQuery = useQuery<OperatingSummaryApi>({ queryKey: ["/api/operating/summary"] });
  const data = summaryQuery.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Shared operating picture</p>
          <h1 className="mt-2 text-4xl font-bold">Charter Operating System</h1>
          <p className="mt-3 text-lg text-slate-300">People, work, finance, quality and growth remain visible together. Financial metrics come from posted balanced journals.</p>
        </header>

        {summaryQuery.isLoading ? (
          <Card className="h-72 animate-pulse border-slate-800 bg-slate-900/40" />
        ) : summaryQuery.error || !data ? (
          <Card className="border-red-900/50 bg-red-950/20"><CardHeader><CardTitle>Operating system unavailable</CardTitle><CardDescription>{summaryQuery.error?.message ?? "No operating summary is available."}</CardDescription></CardHeader></Card>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<Landmark className="h-5 w-5" />} label="Earned revenue" value={money(data.totals.revenueCents)} />
              <Metric icon={<BriefcaseBusiness className="h-5 w-5" />} label="Recognized expense" value={money(data.totals.expenseCents)} />
              <Metric icon={<Landmark className="h-5 w-5" />} label="Operating cash" value={money(data.totals.operatingCashCents)} />
              <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Reserve cash" value={money(data.totals.reserveCashCents)} />
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-slate-800 bg-slate-900/55">
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Human roles</CardTitle><CardDescription>Responsibility is explicit so coordination does not become invisible labor.</CardDescription></CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {data.roles.filter((role) => role.active).map((role) => (
                    <div key={role.id} className="rounded-lg border border-slate-800 p-4">
                      <div className="flex items-center justify-between gap-2"><strong>{role.name}</strong><Badge variant="outline" className="capitalize">{role.domain}</Badge></div>
                      <p className="mt-2 text-sm text-slate-400">{role.description}</p>
                      {role.revenueResponsibility && <p className="mt-3 text-xs text-emerald-300">{role.revenueResponsibility}</p>}
                    </div>
                  ))}
                  {data.roles.length === 0 && <p className="text-sm text-slate-400">Standard roles have not been initialized yet.</p>}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55">
                <CardHeader><CardTitle>Work queue</CardTitle><CardDescription>Current commitments and operational work.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {data.work.slice(0, 10).map((work) => (
                    <div key={work.id} className={work.assignedMemberId === member?.id ? "rounded-lg border border-blue-500/30 bg-blue-950/10 p-4" : "rounded-lg border border-slate-800 p-4"}>
                      <div className="flex flex-wrap items-center justify-between gap-2"><strong>{work.title}</strong><Badge className="capitalize">{work.status.replaceAll("_", " ")}</Badge></div>
                      <p className="mt-2 text-sm text-slate-400">Expected {money(work.expectedRevenueCents)} · Reported {money(work.reportedRevenueCents)}</p>
                    </div>
                  ))}
                  {data.work.length === 0 && <p className="text-sm text-slate-400">No work orders yet.</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-slate-800 bg-slate-900/55">
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Sustainable growth gates</CardTitle><CardDescription>Permanent expansion follows demonstrated capacity.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {data.growth.map((plan) => (
                    <div key={plan.id} className="rounded-lg border border-slate-800 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2"><strong>{plan.proposedRoleName}</strong><Badge variant={plan.safeToAdd ? "default" : "outline"}>{plan.safeToAdd ? "Financial gate passed" : "Not yet safe"}</Badge></div>
                      <p className="mt-2 text-sm text-slate-400">Status: {plan.status.replaceAll("_", " ")} · Monthly compensation {money(plan.monthlyCompensationCents)}</p>
                    </div>
                  ))}
                  {data.growth.length === 0 && <p className="text-sm text-slate-400">No permanent expansion proposals yet.</p>}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/55">
                <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI recommendations</CardTitle><CardDescription>Recommendations remain proposals until human review.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {data.decisions.slice(0, 10).map((decision) => (
                    <div key={decision.id} className="rounded-lg border border-slate-800 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs uppercase tracking-wide text-violet-300">{decision.domain} · {decision.consequenceLevel}</p><strong>{decision.title}</strong></div><Badge variant="outline" className="capitalize">{decision.status.replaceAll("_", " ")}</Badge></div>
                      <p className="mt-3 text-sm">{decision.recommendation}</p>
                      <p className="mt-2 text-xs text-slate-500">Rationale: {decision.rationale}</p>
                    </div>
                  ))}
                  {data.decisions.length === 0 && <p className="text-sm text-slate-400">No AI management proposals have been submitted.</p>}
                </CardContent>
              </Card>
            </div>

            {data.journal.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/55">
                <CardHeader><CardTitle>Recent journal entries</CardTitle><CardDescription>Detailed journal activity is shown only when your authority allows it.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {data.journal.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-800 p-4 md:flex md:items-center md:justify-between">
                      <div><strong>{entry.description}</strong><p className="text-xs text-slate-500">{new Date(entry.occurredAt).toLocaleDateString()}</p></div>
                      <div className="mt-2 text-sm text-slate-300 md:mt-0">Debits {money(entry.debitCents)} · Credits {money(entry.creditCents)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-800 bg-slate-900/55">
              <CardHeader><CardTitle>Your authority snapshot</CardTitle><CardDescription>Calculated by the server from verified identity and active role assignments.</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {data.access.capabilities.map((capability) => <Badge key={capability} variant="outline">{capability}</Badge>)}
                {data.access.capabilities.length === 0 && <span className="text-sm text-slate-400">Ordinary member authority only.</span>}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <Card className="border-slate-800 bg-slate-900/55"><CardContent className="p-5"><div className="mb-3 flex items-center gap-2 text-slate-400">{icon}<span className="text-sm">{label}</span></div><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}
