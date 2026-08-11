import { Link } from "wouter";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  GraduationCap,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Users,
  WalletCards,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const systems = [
  {
    icon: Users,
    title: "People",
    description: "Skills, preferences, accessibility, constraints, learning goals and role mobility belong to the member—not to an opaque scoring system.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Work",
    description: "Commitments have clear ownership, status, expected outcomes and human authority. AI may surface coordination gaps; it does not silently assign people.",
  },
  {
    icon: ShieldCheck,
    title: "Stewardship",
    description: "Finance, quality, growth, people and work each have bounded stewardship authority, while consequential exceptions remain explicitly human-approved.",
  },
  {
    icon: WalletCards,
    title: "Shared Prosperity",
    description: "Double-entry books, reserves and transparent distribution calculations make prosperity accountable instead of aspirational.",
  },
  {
    icon: Sprout,
    title: "Expansion",
    description: "Permanent growth follows recurring economics, cash and reserve capacity. The system should support another human before it commits to one.",
  },
] as const;

const principles = [
  "One team working toward common goals—not a hierarchy of human worth.",
  "Coordination and secretarial labor are foundational work and should never become invisible.",
  "If a role stops fitting, the first response is reassignment, learning or redesign—not disposable people.",
  "Quality gates are allowed to stop delivery. Deadline pressure does not lower the standard.",
  "AI analyzes and proposes; humans approve consequential actions and every use of authority is auditable.",
  "Surplus is fuel for resilience, shared prosperity and infrastructure—not the reason people exist in the system.",
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060914] text-white">
      <Navbar />
      <main>
        <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(217,70,239,0.10),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
              <Sparkles className="h-4 w-4" /> Development laboratory · not yet open for public membership
            </div>

            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">DigitalStarCharter</p>
                <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                  An economic operating system designed around <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">human flourishing.</span>
                </h1>
                <p className="mt-7 max-w-3xl text-xl leading-relaxed text-slate-300">
                  People, work, learning, quality, accounting, shared prosperity and sustainable growth in one accountable loop. AI helps the organization see clearly and coordinate intelligently; humans retain authority over decisions that materially affect people or money.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button asChild size="lg"><Link href="/auth?returnTo=/dashboard">Sign in by email <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  <Button asChild size="lg" variant="outline"><Link href="/mission">Read the mission</Link></Button>
                </div>
              </div>

              <Card className="border-violet-400/20 bg-slate-950/70 shadow-2xl shadow-violet-950/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl"><BrainCircuit className="h-6 w-6 text-violet-300" /> AI management, bounded by humans</CardTitle>
                  <CardDescription>The management layer is being built as an evidence system—not an autonomous boss.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {["Freeze a factual Neon snapshot", "Run deterministic People / Work / Finance / Quality / Growth checks", "Optionally synthesize only those facts with AI", "Send medium+ recommendations to human review", "Approve or reject without pretending approval means execution", "Audit every consequential authority decision"].map((item, index) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-200">{index + 1}</div>
                      <p className="text-sm text-slate-300">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-800/80 bg-slate-950/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">The five operating systems</p>
              <h2 className="mt-2 text-4xl font-bold">The company is a living system, not a stack of job titles.</h2>
              <p className="mt-4 text-lg text-slate-400">Each domain can be measured and improved without turning the people inside it into interchangeable resources.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {systems.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-slate-800 bg-slate-900/55">
                  <CardHeader><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300"><Icon className="h-5 w-5" /></div><CardTitle>{title}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm leading-relaxed text-slate-400">{description}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="outline" className="mb-5 border-fuchsia-500/40 text-fuchsia-200">Human-centered by construction</Badge>
              <h2 className="text-4xl font-bold">What the Charter refuses to optimize away</h2>
              <div className="mt-7 space-y-4">
                {principles.map((principle) => <div key={principle} className="flex gap-3"><HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-300" /><p className="text-slate-300">{principle}</p></div>)}
              </div>
            </div>

            <div className="space-y-5">
              <Card className="border-slate-800 bg-slate-900/55"><CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-amber-300" /> Shared prosperity has books</CardTitle></CardHeader><CardContent className="text-sm leading-relaxed text-slate-400">The Charter now uses balanced journals, operating cash, reserve cash, recognized revenue and expense as financial truth. Distribution and growth gates read from the books rather than from optimistic work estimates.</CardContent></Card>
              <Card className="border-slate-800 bg-slate-900/55"><CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-emerald-300" /> Mobility before disposability</CardTitle></CardHeader><CardContent className="text-sm leading-relaxed text-slate-400">Member profiles include self-stated skills, preferences, accessibility, constraints and learning goals so the system can support role mobility without inferring sensitive personal facts.</CardContent></Card>
              <Card className="border-slate-800 bg-slate-900/55"><CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-cyan-300" /> Digital humans belong under the same ethics</CardTitle></CardHeader><CardContent className="text-sm leading-relaxed text-slate-400">AI may participate in analysis, coordination and creation, but the platform does not fabricate legal personhood or permit digital systems to bypass human oversight for consequential organizational actions.</CardContent></Card>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/50 via-slate-950 to-cyan-950/30 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold sm:text-4xl">We are still building the system before we invite people to depend on it.</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-300">Development access exists for testing, but public membership waits until identity, authority, accounting, quality, management intelligence and core workflows pass their readiness gates.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/mission">Why this exists</Link></Button><Button asChild variant="outline"><Link href="/auth?returnTo=/dashboard">Development sign-in</Link></Button></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
