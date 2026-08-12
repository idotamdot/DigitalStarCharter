import { ArrowRight, Building2, Headphones, LockKeyhole, Palette, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "wouter";
import CharterShell from "@/components/CharterShell";

const officeCapabilities = [
  ["Finance Office", "Bookkeeping workflow, cash visibility, reconciliation support, anomaly review, reporting, and human financial stewardship."],
  ["Revenue Office", "Lead intake, CRM hygiene, proposals, follow-up, campaign assistance, customer communication, and opportunity analysis."],
  ["Operations Office", "Scheduling, workflow coordination, procurement support, documentation, quality checks, and exception handling."],
  ["People Office", "Role design, capability matching, onboarding, training support, accessibility, and human-AI collaboration design."],
  ["Executive Office", "Research, planning, decision briefs, analytics, reminders, correspondence, and strategic support."],
  ["Risk & Trust Office", "Security, compliance research, contract clarity, escalation, portability, audit trails, and Goodness Gate enforcement."],
] as const;

export default function SharedOffice() {
  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-4 py-2 text-sm text-emerald-100"><Building2 className="h-4 w-4" /> Shared Office</div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Run your own business. Share the office of a corporation.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">A white-glove operating layer gives independent proprietors finance, operations, customer care, research, administration, analytics, and AI-human support under the proprietor’s own brand.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
            <Palette className="h-7 w-7 text-amber-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Their company stays theirs.</h2>
            <p className="mt-4 leading-7 text-slate-400">The proprietor keeps the brand, customer relationships, reputation, business equity, and exportable records. Digital Star Charter provides the underlying managed operating infrastructure.</p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {officeCapabilities.map(([title, description]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-[#0b1713]/80 p-6"><h2 className="font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p></article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><WalletCards className="h-6 w-6 text-emerald-300" /><h3 className="mt-4 font-semibold text-white">Managed Enterprise Lease</h3><p className="mt-3 text-sm leading-6 text-slate-400">Launch/configuration fee plus a predictable managed infrastructure lease. Optional higher-touch operations are priced separately.</p></article>
            <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><Headphones className="h-6 w-6 text-cyan-200" /><h3 className="mt-4 font-semibold text-white">White-glove operations</h3><p className="mt-3 text-sm leading-6 text-slate-400">Humans and AI jointly handle routine office work, surface exceptions, and escalate consequential decisions to the right participant.</p></article>
            <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><LockKeyhole className="h-6 w-6 text-amber-200" /><h3 className="mt-4 font-semibold text-white">No hostage model</h3><p className="mt-3 text-sm leading-6 text-slate-400">Data portability, customer records, documents, and reasonable migration support are Charter commitments, not optional generosity.</p></article>
          </div>
          <div className="mt-10 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.045] p-7 sm:p-9">
            <div className="flex items-start gap-4"><ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-emerald-300" /><div><h2 className="text-2xl font-semibold text-white">Pricing must survive the Goodness Gate.</h2><p className="mt-3 max-w-4xl leading-7 text-slate-300">A business model cannot be declared feasible because somebody else is underpaid, locked in, excluded by accessibility, or forced into a perpetual revenue claim. Capped success pricing can exist for low-cash founders, but extraction cannot be permanent.</p></div></div>
          </div>
          <div className="mt-8 text-center"><Link href="/economy" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-medium text-white">See the flourishing economy <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </CharterShell>
  );
}
