import { ArrowRight, BrainCircuit, CheckCircle2, FlaskConical, Scale, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Link } from "wouter";
import CharterShell from "@/components/CharterShell";

const gates = [
  ["Need", "Is there a real problem worth solving?"],
  ["Evidence", "What facts, testimony, estimates, assumptions, and contradictions support the problem?"],
  ["Representation", "Who is affected, especially at intersections that ordinary market research misses?"],
  ["Strategy", "What are multiple materially different ways to solve the underlying cause?"],
  ["Feasibility", "Can it work economically, operationally, legally, technically, and socially?"],
  ["Goodness", "Does the proposed model preserve dignity, agency, accessibility, portability, and shared flourishing?"],
  ["Charter", "What commitments become binding before launch?"],
] as const;

const feasibilityDimensions = [
  "Demand",
  "Affordability",
  "Competition",
  "Differentiation",
  "Startup cost",
  "Operating cost",
  "Staffing",
  "Technology",
  "Compliance",
  "Capital",
  "Utilization",
  "Margin",
  "Break-even",
  "Runway",
  "Downside",
  "Implementation",
  "Environment",
  "Community",
  "Persona impact",
  "Goodness",
] as const;

export default function VentureStudio() {
  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/8 px-4 py-2 text-sm text-amber-100"><Sparkles className="h-4 w-4" /> Venture Studio</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">AI explores the solution space. Humans keep reality in the room.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">The Studio converts validated pain signals into alternative strategies and only advances ideas that survive evidence, representation, feasibility, and the Goodness Gate. “Do not build” is a valid outcome.</p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-7">
          {gates.map(([title, question], index) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold tracking-[0.18em] text-amber-200">0{index + 1}</span>{index < gates.length - 1 ? <ArrowRight className="hidden h-4 w-4 text-slate-600 lg:block" /> : null}</div>
              <h2 className="mt-4 font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{question}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[#0b1713]/90 p-7">
            <BrainCircuit className="h-7 w-7 text-cyan-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Mixed creative circle</h2>
            <p className="mt-4 leading-7 text-slate-400">Each consequential concept should include lived experience, craft, systems, artificial exploration, artificial skepticism, goodness stewardship, and a proprietor or payer perspective. No single participant—human or artificial—owns truth.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {["Lived Experience Seat", "Craft Seat", "Systems Seat", "Artificial Exploration Seat", "Artificial Skeptic Seat", "Goodness Seat", "Proprietor / Payer Seat"].map((seat) => (
                <div key={seat} className="flex items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2 text-sm text-slate-300"><UsersRound className="h-4 w-4 text-emerald-300" />{seat}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#0b1713]/90 p-7">
            <FlaskConical className="h-7 w-7 text-amber-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Feasibility is multidimensional</h2>
            <p className="mt-4 leading-7 text-slate-400">A venture is not viable because the market sounds large. The Studio records confidence, supporting evidence, unresolved questions, risks, mitigations, and explicit assumptions across the full operating model.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {feasibilityDimensions.map((dimension) => <span key={dimension} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 ring-1 ring-white/10">{dimension}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-6"><CheckCircle2 className="h-6 w-6 text-emerald-300" /><h3 className="mt-4 font-semibold text-white">Viable</h3><p className="mt-2 text-sm leading-6 text-slate-400">Evidence and economics support advancement under the proposed constraints.</p></article>
          <article className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.05] p-6"><Scale className="h-6 w-6 text-amber-200" /><h3 className="mt-4 font-semibold text-white">Viable with changes</h3><p className="mt-2 text-sm leading-6 text-slate-400">The need is real, but strategy, pricing, staffing, access, or governance must change first.</p></article>
          <article className="rounded-3xl border border-rose-300/20 bg-rose-300/[0.05] p-6"><ShieldCheck className="h-6 w-6 text-rose-200" /><h3 className="mt-4 font-semibold text-white">Do not launch</h3><p className="mt-2 text-sm leading-6 text-slate-400">The model is presently infeasible or violates the Goodness Gate. The system records why rather than forcing a startup into existence.</p></article>
        </div>
        <div className="mt-10 text-center"><Link href="/office" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-medium text-white">See what a chartered proprietor receives <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </CharterShell>
  );
}
