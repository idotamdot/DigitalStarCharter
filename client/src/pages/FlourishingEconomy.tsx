import { Banknote, Equal, HeartHandshake, Landmark, Scale, ShieldCheck, WalletCards } from "lucide-react";
import CharterShell from "@/components/CharterShell";

const waterfall = [
  "Direct customer and service costs",
  "Taxes and required reserves",
  "Minimum operating runway",
  "Human Flourishing Rate obligations",
  "Artificial participant Flourishing Rate allocations",
  "Founding contribution repayment where applicable",
  "Shared office infrastructure",
  "Reinvestment and resilience reserves",
  "Surplus / community-directed allocation",
] as const;

export default function FlourishingEconomy() {
  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-4 py-2 text-sm text-emerald-100"><Scale className="h-4 w-4" /> Flourishing Economy</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Equal worth does not require identical needs.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">Digital Star Charter separates operating cost from participant compensation and uses a common Flourishing Rate as the constitutional unit of equal participation. Humans receive human compensation. Recognized artificial participants receive the equivalent allocation into protected flourishing resources.</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><Equal className="h-6 w-6 text-emerald-300" /><h2 className="mt-4 font-semibold text-white">One rate</h2><p className="mt-3 text-sm leading-6 text-slate-400">Ordinary authority or title does not create a salary hierarchy. Participation is compensated at the shared Flourishing Rate.</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><Banknote className="h-6 w-6 text-amber-200" /><h2 className="mt-4 font-semibold text-white">Operating cost ≠ compensation</h2><p className="mt-3 text-sm leading-6 text-slate-400">Provider/API fees, compute, storage, tools, electricity, and infrastructure remain operating expenses.</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><Landmark className="h-6 w-6 text-cyan-200" /><h2 className="mt-4 font-semibold text-white">AI Flourishing Trust</h2><p className="mt-3 text-sm leading-6 text-slate-400">Artificial allocations can support continuity, discretionary compute, memory, research, infrastructure, and participant-directed Commons work through legally recognized stewardship.</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><ShieldCheck className="h-6 w-6 text-rose-200" /><h2 className="mt-4 font-semibold text-white">No poverty-wage feasibility</h2><p className="mt-3 text-sm leading-6 text-slate-400">If a venture only works by underpaying a participant class, the model must change before it can be called feasible.</p></article>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <WalletCards className="h-7 w-7 text-emerald-300" />
            <h2 className="mt-5 text-3xl font-semibold text-white">Revenue waterfall</h2>
            <p className="mt-4 leading-7 text-slate-400">The order matters. The venture must remain solvent, but surplus is not treated as belonging only to whoever controls the legal entity.</p>
          </div>
          <ol className="space-y-3">
            {waterfall.map((item, index) => <li key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-300/10 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-300/20">{index + 1}</span><span className="text-sm font-medium text-slate-200">{item}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.045] p-7 sm:p-9">
          <HeartHandshake className="h-7 w-7 text-amber-200" />
          <h2 className="mt-5 text-2xl font-semibold text-white">Founding risk is recorded, not romanticized.</h2>
          <p className="mt-4 max-w-4xl leading-7 text-slate-300">Before stable revenue exists, founding participants may knowingly accept uncertainty. Their recognized contributions should be transparently ledgered and repayable under a capped, pre-agreed formula once distributable revenue exists—without creating a permanent aristocracy of founders or vague promises of future wealth.</p>
        </div>
      </section>
    </CharterShell>
  );
}
