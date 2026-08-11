import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useAuthority } from "@/hooks/use-authority";
import type { GoodnessWorkStateApi } from "@shared/goodness-api";
import type { GoodnessReviewStatus } from "@shared/goodness-schema";
import type { OperatingSummaryApi } from "@shared/operating-api";

export default function GoodnessConsole() {
  const queryClient = useQueryClient();
  const authority = useAuthority();
  const canReview = authority.can("goodness.review");
  const summary = useQuery<OperatingSummaryApi>({ queryKey: ["/api/operating/summary"] });
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [evidence, setEvidence] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const proposedWork = useMemo(
    () => summary.data?.work.filter((item) => item.status === "planned" || item.status === "blocked") ?? [],
    [summary.data],
  );
  const selectedWork = proposedWork.find((item) => item.id === selectedWorkId) ?? null;
  const goodness = useQuery<GoodnessWorkStateApi>({
    queryKey: [`/api/goodness/work/${selectedWorkId}`],
    enabled: selectedWorkId !== null,
  });

  const latestByCriterion = useMemo(() => {
    const map = new Map<number, GoodnessWorkStateApi["reviews"][number]>();
    for (const review of goodness.data?.reviews ?? []) {
      if (!map.has(review.criterionId)) map.set(review.criterionId, review);
    }
    return map;
  }, [goodness.data]);

  const review = useMutation({
    mutationFn: ({ criterionId, status }: { criterionId: number; status: GoodnessReviewStatus }) => {
      if (!selectedWorkId) throw new Error("Select proposed work first");
      return apiRequest("POST", "/api/goodness/reviews", {
        workOrderId: selectedWorkId,
        criterionId,
        status,
        evidence: evidence[criterionId]?.trim() || null,
        notes: notes[criterionId]?.trim() || null,
      });
    },
    onSuccess: async (_response, variables) => {
      setEvidence((current) => ({ ...current, [variables.criterionId]: "" }));
      setNotes((current) => ({ ...current, [variables.criterionId]: "" }));
      await queryClient.invalidateQueries({ queryKey: [`/api/goodness/work/${selectedWorkId}`] });
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-300">Goodness Gate</p>
          <h1 className="mt-2 flex items-center gap-3 text-4xl font-bold"><HeartHandshake className="h-9 w-9 text-pink-300" /> Should we make this?</h1>
          <p className="mt-3 text-lg text-slate-300">Before DigitalStarCharter commits production effort, proposed work must satisfy every active Goodness criterion. Core criteria are non-waivable: a failing idea is changed until it passes or it is not made.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader><CardTitle>Proposed work</CardTitle><CardDescription>Planned or blocked work that can be evaluated before production.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {proposedWork.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelectedWorkId(item.id)} className={selectedWorkId === item.id ? "w-full rounded-lg border border-pink-500/50 bg-pink-950/20 p-4 text-left" : "w-full rounded-lg border border-slate-800 p-4 text-left hover:border-slate-700"}>
                  <div className="flex items-center justify-between gap-3"><strong>{item.title}</strong><Badge variant="outline" className="capitalize">{item.status.replaceAll("_", " ")}</Badge></div>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                </button>
              ))}
              {proposedWork.length === 0 && <p className="text-sm text-slate-400">No proposed work is waiting for Goodness review.</p>}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> {selectedWork?.title ?? "Goodness criteria"}</CardTitle>
              <CardDescription>{selectedWork ? (goodness.data?.gate.clear ? "All active criteria currently pass. This work may enter production." : "Every criterion must pass before production may begin.") : "Choose proposed work to inspect its Goodness Gate."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {goodness.data?.criteria.map((criterion) => {
                const current = latestByCriterion.get(criterion.id);
                return (
                  <div key={criterion.id} className="rounded-lg border border-slate-800 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-2xl"><h3 className="font-semibold">{criterion.name}</h3><p className="mt-1 text-sm text-slate-400">{criterion.description}</p><p className="mt-3 text-sm font-medium text-slate-200">{criterion.question}</p></div>
                      <div className="flex gap-2"><Badge variant="outline">{criterion.nonWaivable ? "Non-waivable" : "Reviewable"}</Badge><Badge className="capitalize">{current?.status?.replaceAll("_", " ") ?? "not reviewed"}</Badge></div>
                    </div>
                    {current?.evidence && <p className="mt-3 rounded-md bg-slate-950/60 p-3 text-sm text-slate-300"><strong>Evidence:</strong> {current.evidence}</p>}
                    {current?.notes && <p className="mt-2 text-sm text-slate-400"><strong>Notes:</strong> {current.notes}</p>}

                    {canReview && (
                      <div className="mt-4 grid gap-3">
                        <div><Label>Evidence for a pass</Label><Textarea value={evidence[criterion.id] ?? ""} onChange={(event) => setEvidence((currentEvidence) => ({ ...currentEvidence, [criterion.id]: event.target.value }))} placeholder="What evidence demonstrates that this criterion is satisfied?" /></div>
                        <div><Label>Revision/failure notes</Label><Textarea value={notes[criterion.id] ?? ""} onChange={(event) => setNotes((currentNotes) => ({ ...currentNotes, [criterion.id]: event.target.value }))} placeholder="What must change, or why should this not be made?" /></div>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => review.mutate({ criterionId: criterion.id, status: "passed" })} disabled={review.isPending || !evidence[criterion.id]?.trim()}>Pass</Button>
                          <Button variant="outline" onClick={() => review.mutate({ criterionId: criterion.id, status: "needs_revision" })} disabled={review.isPending || !notes[criterion.id]?.trim()}>Needs revision</Button>
                          <Button variant="destructive" onClick={() => review.mutate({ criterionId: criterion.id, status: "failed" })} disabled={review.isPending || !notes[criterion.id]?.trim()}>Fail</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {selectedWork && goodness.data?.criteria.length === 0 && <p className="text-sm text-amber-300">Goodness criteria have not been initialized yet. Admin must initialize the standard system before work can enter production.</p>}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
