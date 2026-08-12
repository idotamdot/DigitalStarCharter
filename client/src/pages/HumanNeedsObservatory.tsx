import { AlertTriangle, ArrowRight, Eye, Layers3, Lightbulb, Search, UsersRound } from "lucide-react";
import { Link } from "wouter";
import CharterShell from "@/components/CharterShell";
import { baselineRepresentationPerspectives, representationInnovationPrinciples } from "@shared/universal-representation";

const signalPath = [
  ["Pain signal", "A person or community describes what is difficult, inaccessible, expensive, unsafe, unstable, or unnecessarily burdensome."],
  ["Representation coverage", "The system identifies every materially affected perspective and relevant intersection instead of relying on a fixed persona list."],
  ["Structural cause", "AI and humans distinguish the underlying barrier from the workaround people have been forced to use."],
  ["Innovation hypothesis", "Mixed human-AI teams propose ways to remove the barrier, not merely teach people to tolerate it."],
  ["Evidence & feasibility", "Demand, affordability, operations, regulation, staffing, capital, accessibility, and downside are researched before launch."],
] as const;

export default function HumanNeedsObservatory() {
  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm text-cyan-100">
              <Eye className="h-4 w-4" /> Human Needs Observatory
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Strategy begins with what hurts.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              The Observatory is the listening and pattern-recognition layer of Digital Star Charter. It gathers lived pain, constraints, aspirations, testimony, evidence, and workarounds—then turns recurring or neglected problems into researchable opportunity signals.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
            <div className="flex items-center gap-3 text-amber-100"><AlertTriangle className="h-5 w-5" /><span className="font-semibold">No fabricated demand</span></div>
            <p className="mt-4 text-sm leading-6 text-slate-400">A pain point is not validated merely because AI can imagine it. Frequency, severity, willingness or ability to pay, public-benefit value, and the testimony of affected people are tracked separately.</p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-5">
          {signalPath.map(([title, description], index) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-[#0b1713]/80 p-5">
              <span className="text-xs font-semibold tracking-[0.18em] text-emerald-300">0{index + 1}</span>
              <h2 className="mt-3 font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Baseline representation lenses</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Named perspectives are prompts, never the boundary of humanity.</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400"><Layers3 className="h-4 w-4" /> Intersectional review required</div>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {baselineRepresentationPerspectives.map((perspective) => (
              <article key={perspective.id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-white">{perspective.label}</h3>
                  <UsersRound className="h-5 w-5 shrink-0 text-emerald-300" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{perspective.context[0]}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {perspective.dimensions.map((dimension) => (
                    <span key={dimension} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/10">{dimension.replaceAll("_", " ")}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-amber-100"><Lightbulb className="h-5 w-5" /><span className="font-semibold">Innovation rules</span></div>
            <div className="mt-5 space-y-3">
              {representationInnovationPrinciples.map((principle) => (
                <div key={principle} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-300">{principle}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.055] p-7 sm:p-9">
            <Search className="h-7 w-7 text-emerald-300" />
            <h2 className="mt-5 text-2xl font-semibold text-white">From signal to Charter</h2>
            <p className="mt-4 leading-7 text-slate-300">Once evidence is strong enough to justify exploration, the signal moves into Venture Studio. There AI can develop alternative strategies, while people with relevant lived experience retain the ability to challenge the premise and reshape the solution.</p>
            <Link href="/studio" className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-3 font-medium text-[#07100d]">Open Venture Studio <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </CharterShell>
  );
}
