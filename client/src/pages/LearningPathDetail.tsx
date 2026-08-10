import { Link, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, GraduationCap, LockKeyhole } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type {
  LearningEnrollmentApi,
  LearningPathDetailApi,
  LearningPathStepApi,
  LearningProgressApi,
} from "@shared/learning";

interface StepRowProps {
  step: LearningPathStepApi;
  enrolled: boolean;
  updating: boolean;
  onToggle: (step: LearningPathStepApi, completed: boolean) => void;
}

function StepRow({ step, enrolled, updating, onToggle }: StepRowProps) {
  const completed = Boolean(step.completedAt);
  return (
    <Card className={completed ? "border-emerald-500/30 bg-emerald-950/10" : "border-slate-800 bg-slate-900/45"}>
      <CardContent className="flex gap-4 p-5">
        <Checkbox
          checked={completed}
          disabled={!enrolled || updating}
          onCheckedChange={(checked) => onToggle(step, checked === true)}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{step.title}</h3>
            <div className="flex gap-2">
              <Badge variant="outline"><Clock className="mr-1 h-3 w-3" /> {step.estimatedMinutes} min</Badge>
              <Badge variant={step.isRequired ? "default" : "secondary"}>{step.isRequired ? "Required" : "Optional"}</Badge>
            </div>
          </div>
          {step.description && <p className="mt-2 text-sm text-slate-400">{step.description}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {step.resourceId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/resources/${step.resourceId}`}><BookOpen className="mr-2 h-4 w-4" /> Open resource</Link>
              </Button>
            ) : (
              <span className="text-xs text-slate-500">No external resource attached</span>
            )}
            {completed && <span className="inline-flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Completed</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearningPathDetail() {
  const { id } = useParams();
  const pathId = Number(id);
  const { member } = useAuth();
  const { toast } = useToast();

  const pathQuery = useQuery<LearningPathDetailApi>({
    queryKey: [`/api/learning-paths/${pathId}`],
    enabled: Number.isInteger(pathId) && pathId > 0,
  });
  const enrollmentsQuery = useQuery<LearningEnrollmentApi[]>({
    queryKey: ["/api/member/enrollments"],
    enabled: Boolean(member),
  });
  const progressQuery = useQuery<LearningProgressApi>({
    queryKey: [`/api/learning-paths/${pathId}/progress`],
    enabled: Boolean(member) && Number.isInteger(pathId) && pathId > 0,
  });

  const enrollment = enrollmentsQuery.data?.find((item) => item.pathId === pathId) ?? null;
  const progressByStep = new Map((progressQuery.data?.progress ?? []).map((item) => [item.stepId, item]));
  const path = pathQuery.data;

  const enrollMutation = useMutation<LearningEnrollmentApi, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/learning-paths/${pathId}/enroll`);
      return await response.json() as LearningEnrollmentApi;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/enrollments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/learning-paths/${pathId}/progress`] });
      toast({ title: "Learning path started" });
    },
    onError: (error) => toast({ title: "Unable to enroll", description: error.message, variant: "destructive" }),
  });

  const progressMutation = useMutation<unknown, Error, { step: LearningPathStepApi; completed: boolean }>({
    mutationFn: async ({ step, completed }) => {
      const response = await apiRequest("POST", `/api/learning-path-steps/${step.id}/progress`, { completed });
      return await response.json() as unknown;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/learning-paths/${pathId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/learning-paths/${pathId}/progress`] });
      queryClient.invalidateQueries({ queryKey: ["/api/member/enrollments"] });
    },
    onError: (error) => toast({ title: "Progress update failed", description: error.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href="/learning-paths" className="mb-8 inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200">
          <ArrowLeft className="h-4 w-4" /> Back to Learning
        </Link>

        {pathQuery.isLoading ? (
          <Card className="h-96 animate-pulse border-slate-800 bg-slate-900/40" />
        ) : pathQuery.error || !path ? (
          <Card className="border-red-900/50 bg-red-950/20">
            <CardHeader><CardTitle>Learning path unavailable</CardTitle><CardDescription>{pathQuery.error?.message ?? "This path does not exist or is not available at your access level."}</CardDescription></CardHeader>
          </Card>
        ) : (
          <>
            <section className="mb-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">{path.category}</Badge>
                <Badge variant="outline" className="capitalize">{path.skillLevel}</Badge>
                <Badge variant="outline" className="capitalize">{path.requiredTier}</Badge>
              </div>
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-bold tracking-tight">{path.title}</h1>
                  <p className="mt-4 text-lg text-slate-300">{path.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{path.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
                </div>
                <div className="shrink-0">
                  {!member ? (
                    <Button asChild variant="outline"><Link href={`/auth?returnTo=${encodeURIComponent(`/learning-paths/${pathId}`)}`}><LockKeyhole className="mr-2 h-4 w-4" /> Sign in to track progress</Link></Button>
                  ) : !enrollment ? (
                    <Button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}><GraduationCap className="mr-2 h-4 w-4" /> Start path</Button>
                  ) : (
                    <Badge className="px-4 py-2">Enrolled</Badge>
                  )}
                </div>
              </div>
            </section>

            {member && enrollment && (
              <Card className="mb-8 border-violet-500/20 bg-violet-950/10">
                <CardHeader><CardTitle className="text-lg">Your progress</CardTitle></CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between text-sm text-slate-400"><span>Overall completion</span><span>{progressQuery.data?.overallProgress ?? enrollment.progressPercent}%</span></div>
                  <Progress value={progressQuery.data?.overallProgress ?? enrollment.progressPercent} />
                  <p className="mt-3 text-xs text-slate-500">{progressQuery.data?.completedSteps ?? 0} of {progressQuery.data?.totalSteps ?? path.steps.length} steps completed</p>
                </CardContent>
              </Card>
            )}

            <section>
              <h2 className="mb-4 text-2xl font-semibold">Path steps</h2>
              <div className="space-y-4">
                {path.steps.map((step) => {
                  const saved = progressByStep.get(step.id);
                  const merged: LearningPathStepApi = saved
                    ? { ...step, completedAt: saved.completedAt, resourceRating: saved.resourceRating }
                    : step;
                  return <StepRow key={step.id} step={merged} enrolled={Boolean(enrollment)} updating={progressMutation.isPending} onToggle={(selectedStep, completed) => progressMutation.mutate({ step: selectedStep, completed })} />;
                })}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
