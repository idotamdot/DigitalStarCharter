import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useAuthority } from "@/hooks/use-authority";
import type { OperatingSummaryApi } from "@shared/operating-api";
import type { QualityStandardApi, WorkQualityApi } from "@shared/quality-api";
import type { QualityReviewStatus } from "@shared/quality-schema";

export default function QualityConsole() {
  const queryClient = useQueryClient();
  const authority = useAuthority();
  const summary = useQuery<OperatingSummaryApi>({ queryKey: ["/api/operating/summary"] });
  const standards = useQuery<QualityStandardApi[]>({ queryKey: ["/api/quality/standards"] });
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [evidence, setEvidence] = useState("");
  const [notes, setNotes] = useState("");

  const work = useMemo(() => summary.data?.work.filter((item) => item.status !== "completed" && item.status !== "cancelled") ?? [], [summary.data]);
  const selectedWork = work.find((item) => item.id === selectedWorkId) ?? null;
  const quality = useQuery<WorkQualityApi>({
    queryKey: ["/api/quality/work", selectedWorkId],
    enabled: selectedWorkId !== null,
  });

  const review = useMutation({
    mutationFn: ({ standardId, status }: { standardId: number; status: QualityReviewStatus }) => {
      if (!selectedWorkId) throw new Error("Select a work order first");
      return apiRequest("POST", "/api/quality/reviews", {
        workOrderId: selectedWorkId,
        standardId,
        status,
        evidence: evidence || null,
        notes: notes || null,
      });
    },
    onSuccess: async () => {
      setEvidence("");
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: ["/api/quality/work", selectedWorkId] });
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Quality stewardship</p>
          <h1 className="mt-2 text-4xl font-bold">Release gates</h1>
          <p className="mt-3 text-lg text-slate-300">The network does not mark work complete merely because a deadline arrived. Active release-blocking standards must pass, or the human administrator must explicitly waive one with an audited reason.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader><CardTitle>Work awaiting completion</CardTitle><CardDescription>Select work to inspect its quality state.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {work.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelectedWorkId(item.id)} className={selectedWorkId === item.id ? "w-full rounded-lg border border-emerald-500/50 bg-emerald-950/20 p-4 text-left" : "w-full rounded-lg border border-slate-800 p-4 text-left hover:border-slate-700"}>
                  <div className="flex items-center justify-between gap-3"><strong>{item.title}</strong><Badge variant="outline" className="capitalize">{item.status.replaceAll("_", " ")}</Badge></div>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                </button>
              ))}
              {work.length === 0 && <p className="text-sm text-slate-400">No active work currently needs a release gate.</p>}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> {selectedWork?.title ?? "Quality state"}</CardTitle>
              <CardDescription>{selectedWork ? "Each applicable standard needs a current pass or administrator waiver." : "Choose a work order to review."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedWork && quality.data && (
                <div className={quality.data.gate.clear ? "rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4" : "rounded-lg border border-amber-500/30 bg-amber-950/20 p-4"}>
                  <div className="flex items-center gap-2 font-semibold">{quality.data.gate.clear ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <XCircle className="h-5 w-5 text-amber-300" />}{quality.data.gate.clear ? "Release gate clear" : `${quality.data.gate.blocking.length} blocking standard(s)`}</div>
                  {!quality.data.gate.clear && <div className="mt-2 text-sm text-slate-300">{quality.data.gate.blocking.map((item) => `${item.standardName} (${item.status})`).join(" · ")}</div>}
                </div>
              )}

              {selectedWork && authority.can("quality.manage") && (
                <div className="space-y-3 rounded-lg border border-slate-800 p-4">
                  <div><Label>Evidence</Label><Textarea className="mt-2" value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="What was inspected, tested, compared or verified?" /></div>
                  <div><Label>Review notes</Label><Textarea className="mt-2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Reasoning, remediation needed, or waiver justification." /></div>
                </div>
              )}

              {selectedWork && standards.data?.filter((standard) => standard.active && (!standard.appliesToRevenueType || standard.appliesToRevenueType === selectedWork.revenueType)).map((standard) => {
                const latest = quality.data?.reviews.find((item) => item.standardId === standard.id);
                return (
                  <div key={standard.id} className="rounded-lg border border-slate-800 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><div><strong>{standard.name}</strong><p className="mt-1 text-sm text-slate-400">{standard.description}</p></div><Badge variant={latest?.status === "passed" ? "default" : "outline"} className="capitalize">{latest?.status ?? "not reviewed"}</Badge></div>
                    {authority.can("quality.manage") && <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => review.mutate({ standardId: standard.id, status: "failed" })}>Fail</Button><Button onClick={() => review.mutate({ standardId: standard.id, status: "passed" })}>Pass</Button>{authority.can("quality.override") && <Button variant="secondary" onClick={() => review.mutate({ standardId: standard.id, status: "waived" })} disabled={!notes.trim()}>Admin waive</Button>}</div>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
