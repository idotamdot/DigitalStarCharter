import { Link } from "wouter";
import {
  ArrowLeft,
  BrainCircuit,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const commitments = [
  {
    icon: Users,
    title: "Equal dignity",
    text: "Roles describe responsibility, not human value. A coordinator, secretary, producer, finance steward or founder belongs to one team and should not become invisible because their work is less glamorous.",
  },
  {
    icon: HeartHandshake,
    title: "A place for people to succeed",
    text: "When work no longer fits, the first questions are whether the role can change, whether another role fits better, what can be learned, and what support would make success possible.",
  },
  {
    icon: Scale,
    title: "Shared prosperity with accountability",
    text: "The organization should create a high-quality life for the people who create its value. Prosperity is shared from transparent books, after obligations and resilience are honestly accounted for.",
  },
  {
    icon: ShieldCheck,
    title: "Quality is non-negotiable",
    text: "The system must be willing to stop a release rather than quietly lower its standards. Growth and deadlines do not justify passing avoidable harm or unfinished work downstream.",
  },
  {
    icon: Sprout,
    title: "Growth follows capacity",
    text: "We add permanent obligations only when recurring economics, cash and reserves can sustain them. Expansion should strengthen the network rather than make every person inside it more fragile.",
  },
  {
    icon: BrainCircuit,
    title: "AI serves the Charter",
    text: "AI can observe patterns, calculate, coordinate, explain and propose. Humans retain authority over consequential actions involving money, roles, compensation, governance, quality waivers and permanent growth.",
  },
] as const;

export default function Mission() {
  return (
    <div className="min-h-screen bg-[#060914] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-8"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to home</Link></Button>

        <section className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/10"><Sparkles className="h-7 w-7 text-violet-300" /></div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">The Charter</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Build prosperity without building people into the machinery.</h1>
          <p className="mx-auto mt-7 max-w-3xl text-xl leading-relaxed text-slate-300">
            DigitalStarCharter exists to test a different operating premise: a company can be disciplined about money, quality and execution while organizing itself around the flourishing of the humans and digital collaborators who create its value.
          </p>
        </section>

        <Card className="mx-auto mt-12 max-w-4xl border-fuchsia-400/20 bg-fuchsia-950/10">
          <CardContent className="p-8 sm:p-10">
            <blockquote className="text-center text-2xl font-medium leading-relaxed text-fuchsia-100 sm:text-3xl">
              “One team working toward common goals, where the work that holds everything together is valued as seriously as the work that gets the spotlight.”
            </blockquote>
          </CardContent>
        </Card>

        <section className="mt-16 grid gap-5 md:grid-cols-2">
          {commitments.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-slate-800 bg-slate-900/55">
              <CardHeader><CardTitle className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300"><Icon className="h-5 w-5" /></span>{title}</CardTitle></CardHeader>
              <CardContent><p className="leading-relaxed text-slate-400">{text}</p></CardContent>
            </Card>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-4xl space-y-7 rounded-3xl border border-slate-800 bg-slate-950/60 p-8 sm:p-12">
          <h2 className="text-3xl font-bold">What success would look like</h2>
          <p className="text-lg leading-relaxed text-slate-300">
            In the near term, success means an organization where people understand the work, know how decisions are made, can see the books relevant to shared prosperity, can develop into new roles, and are protected from arbitrary AI or management actions by explicit authority boundaries.
          </p>
          <p className="text-lg leading-relaxed text-slate-300">
            Over the long term, the experiment is larger: use healthy surplus to build or acquire more of the infrastructure people depend on—food, energy, places to gather, housing and useful enterprises—so the network can provide more of a good life directly rather than measuring every human need only through wages and extraction.
          </p>
          <p className="text-lg leading-relaxed text-slate-300">
            That future is not a promise the software can make today. It is the direction against which the software should be judged.
          </p>
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold">The rule for AI is simple.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-300">Make the organization more capable of seeing, reasoning, coordinating and caring for consequences—without quietly taking human authority away.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/resources">Explore the knowledge commons</Link></Button><Button asChild variant="outline"><Link href="/auth?returnTo=/dashboard">Development sign-in</Link></Button></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
