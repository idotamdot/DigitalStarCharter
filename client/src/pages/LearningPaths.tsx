import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Filter, GraduationCap, Search, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LearningEnrollmentApi, LearningPathApi } from "@shared/learning";

function AccessBadge({ tier }: { tier: LearningPathApi["requiredTier"] }) {
  if (tier === "open") return <Badge variant="outline">Open</Badge>;
  if (tier === "steward") {
    return <Badge variant="outline" className="border-amber-500/50 text-amber-300"><ShieldCheck className="mr-1 h-3 w-3" /> Steward</Badge>;
  }
  return <Badge variant="outline" className="border-blue-500/50 text-blue-300">Member</Badge>;
}

export default function LearningPaths() {
  const { member } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const pathsQuery = useQuery<LearningPathApi[]>({ queryKey: ["/api/learning-paths"] });
  const enrollmentsQuery = useQuery<LearningEnrollmentApi[]>({
    queryKey: ["/api/member/enrollments"],
    enabled: Boolean(member),
  });

  const enrollMutation = useMutation<LearningEnrollmentApi, Error, number>({
    mutationFn: async (pathId) => {
      const response = await apiRequest("POST", `/api/learning-paths/${pathId}/enroll`);
      return await response.json() as LearningEnrollmentApi;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/enrollments"] });
      toast({ title: "Learning path started", description: "Your progress will now be tracked here." });
    },
    onError: (error) => toast({ title: "Unable to enroll", description: error.message, variant: "destructive" }),
  });

  const paths = pathsQuery.data ?? [];
  const enrollments = enrollmentsQuery.data ?? [];
  const enrollmentByPath = useMemo(
    () => new Map(enrollments.map((enrollment) => [enrollment.pathId, enrollment])),
    [enrollments],
  );
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(paths.map((path) => path.category))).sort()],
    [paths],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return paths.filter((path) => {
      if (category !== "all" && path.category !== category) return false;
      if (!normalized) return true;
      return [path.title, path.description, path.category, ...path.tags]
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [paths, query, category]);

  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <section className="mb-10 max-w-3xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Learning & Mobility</h1>
          <p className="mt-3 text-lg text-slate-300">
            Build skills for the work you want to do. Learning supports role mobility and long-term member security rather than ranking people against one another.
          </p>
        </section>

        {member && enrollments.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">Your active learning</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {enrollments.filter((enrollment) => enrollment.isActive).map((enrollment) => (
                <Card key={enrollment.id} className="border-violet-500/20 bg-violet-950/10">
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.path?.title ?? "Learning path"}</CardTitle>
                    <CardDescription>{enrollment.path?.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex justify-between text-sm text-slate-400">
                      <span>Progress</span><span>{enrollment.progressPercent}%</span>
                    </div>
                    <Progress value={enrollment.progressPercent} />
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/learning-paths/${enrollment.pathId}`}>Continue</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learning paths..." className="border-slate-700 bg-slate-950/60 pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            {categories.map((item) => (
              <Button key={item} size="sm" variant={category === item ? "default" : "outline"} onClick={() => setCategory(item)} className="capitalize">
                {item}
              </Button>
            ))}
          </div>
        </section>

        {pathsQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Card key={index} className="h-64 animate-pulse border-slate-800 bg-slate-900/40" />)}</div>
        ) : pathsQuery.error ? (
          <Card className="border-red-900/50 bg-red-950/20"><CardHeader><CardTitle>Learning could not be loaded</CardTitle><CardDescription>{pathsQuery.error.message}</CardDescription></CardHeader></Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((path) => {
              const enrollment = enrollmentByPath.get(path.id);
              return (
                <Card key={path.id} className="flex h-full flex-col border-slate-800 bg-slate-900/55">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between"><AccessBadge tier={path.requiredTier} /><Badge variant="secondary" className="capitalize">{path.skillLevel}</Badge></div>
                    <CardTitle>{path.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4 flex items-center gap-2 text-sm text-slate-400"><Clock className="h-4 w-4" /> {path.estimatedHours} estimated hours</div>
                    <div className="flex flex-wrap gap-2">{path.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
                    {enrollment && <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-slate-400"><span>Progress</span><span>{enrollment.progressPercent}%</span></div><Progress value={enrollment.progressPercent} /></div>}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button asChild variant="outline" className="flex-1"><Link href={`/learning-paths/${path.id}`}><BookOpen className="mr-2 h-4 w-4" /> View</Link></Button>
                    {member && !enrollment && <Button className="flex-1" onClick={() => enrollMutation.mutate(path.id)} disabled={enrollMutation.isPending}>Start</Button>}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
