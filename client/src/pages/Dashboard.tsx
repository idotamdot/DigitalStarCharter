import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, BriefcaseBusiness, GraduationCap, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import type { LearningEnrollmentApi } from "@shared/learning";
import type { OperatingSummaryApi } from "@shared/operating-api";

const money = (cents: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(cents / 100);

export default function Dashboard() {
  const { member } = useAuth();
  const summaryQuery = useQuery<OperatingSummaryApi>({ queryKey: ["/api/operating/summary"] });
  const learningQuery = useQuery<LearningEnrollmentApi[]>({ queryKey: ["/api/member/enrollments"] });

  if (!member) return null;

  const summary = summaryQuery.data;
  const assignments = summary?.assignments.filter((assignment) => assignment.memberId === member.id && assignment.status === "active") ?? [];
  const roleById = new Map((summary?.roles ?? []).map((role) => [role.id, role]));
  const assignedWork = summary?.work.filter((work) => work.assignedMemberId === member.id && work.status !== "completed" && work.status !== "cancelled") ?? [];
  const activeLearning = (learningQuery.data ?? []).filter((enrollment) => enrollment.isActive && !enrollment.completedAt);

  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Member home</p>
          <h1 className="mt-2 text-4xl font-bold">Welcome, {member.displayName}</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-300">
            Your work, learning, role mobility and shared operating picture live here. The system is designed to help people flourish while keeping growth financially sustainable.
          </p>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<BriefcaseBusiness className="h-5 w-5" />} label="Active work" value={String(assignedWork.length)} />
          <Metric icon={<GraduationCap className="h-5 w-5" />} label="Learning paths" value={String(activeLearning.length)} />
          <Metric icon={<WalletCards className="h-5 w-5" />} label="Recorded network income" value={money(summary?.totals.incomeCents ?? 0)} />
          <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Your authority domains" value={String(summary?.access.domains.length ?? 0)} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader>
              <CardTitle>Your roles</CardTitle>
              <CardDescription>Roles describe responsibility and authority, not human worth.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-400">No operating role has been assigned yet.</p>
              ) : assignments.map((assignment) => {
                const role = roleById.get(assignment.roleId);
                return (
                  <div key={assignment.id} className="rounded-lg border border-slate-800 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{role?.name ?? "Role"}</strong>
                      <Badge variant="outline" className="capitalize">{role?.domain ?? "member"}</Badge>
                    </div>
                    {role?.description && <p className="mt-2 text-sm text-slate-400">{role.description}</p>}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader>
              <CardTitle>Work in your hands</CardTitle>
              <CardDescription>Only work currently assigned to you appears here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedWork.length === 0 ? (
                <p className="text-sm text-slate-400">You have no active work orders.</p>
              ) : assignedWork.slice(0, 6).map((work) => (
                <div key={work.id} className="rounded-lg border border-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3"><strong>{work.title}</strong><Badge className="capitalize">{work.status.replaceAll("_", " ")}</Badge></div>
                  <p className="mt-2 text-sm text-slate-400">{work.description}</p>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full"><Link href="/operations">Open operating system</Link></Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader>
              <CardTitle>Learning & role mobility</CardTitle>
              <CardDescription>Build capability for new work before role changes become necessary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeLearning.length === 0 ? (
                <div className="text-center py-6"><Sparkles className="mx-auto mb-3 h-7 w-7 text-violet-300" /><p className="text-sm text-slate-400">No active learning path.</p></div>
              ) : activeLearning.slice(0, 4).map((enrollment) => (
                <div key={enrollment.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm"><span>{enrollment.path?.title ?? "Learning path"}</span><span className="text-slate-400">{enrollment.progressPercent}%</span></div>
                  <Progress value={enrollment.progressPercent} />
                </div>
              ))}
              <Button asChild variant="outline" className="w-full"><Link href="/learning-paths"><BookOpen className="mr-2 h-4 w-4" /> Explore learning</Link></Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader>
              <CardTitle>Human-in-the-loop authority</CardTitle>
              <CardDescription>Your current server-enforced capability snapshot.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(summary?.access.capabilities ?? []).map((capability) => <Badge key={capability} variant="outline">{capability}</Badge>)}
                {(summary?.access.capabilities.length ?? 0) === 0 && <p className="text-sm text-slate-400">No steward capabilities assigned. Ordinary member actions remain available.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-slate-800 bg-slate-900/55">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-400">{icon}<span className="text-sm">{label}</span></div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
