import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, FlaskConical, HeartHandshake, Lightbulb, Scale, Sparkles } from "lucide-react";
import CharterShell from "@/components/CharterShell";
import { prioritizePainSignal, scoreFeasibility } from "@shared/charter-strategy";
import { calculateRevenueWaterfall } from "@shared/charter-economics";
import type { RepresentationDimension } from "@shared/venture-domain";

const selectedDimensions: readonly RepresentationDimension[] = [
  "employment_and_automation_exposure",
  "income_wealth_and_economic_security",
  "family_household_and_caregiving",
];

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-emerald-300/40"
      />
    </label>
  );
}

export default function PrototypeLab() {
  const [painPoint, setPainPoint] = useState("Administrative work is consuming too much of a small proprietor's day and displacing time that should go to customers, craft, and family.");
  const [evidenceConfidence, setEvidenceConfidence] = useState(65);
  const [workaroundBurden, setWorkaroundBurden] = useState(80);
  const [exclusionRisk, setExclusionRisk] = useState(55);
  const [demand, setDemand] = useState(70);
  const [affordability, setAffordability] = useState(60);
  const [margin, setMargin] = useState(65);
  const [goodness, setGoodness] = useState(85);
  const [monthlyRevenue, setMonthlyRevenue] = useState(30000);
  const [participants, setParticipants] = useState(4);
  const [flourishingRate, setFlourishingRate] = useState(4000);

  const priority = useMemo(() => prioritizePainSignal({
    severity: "high",
    frequency: "common",
    evidenceConfidence,
    workaroundBurden,
    exclusionRisk,
    automationTransitionPotential: 75,
    sharedInfrastructurePotential: 90,
    affectedDimensions: selectedDimensions,
  }), [evidenceConfidence, workaroundBurden, exclusionRisk]);

  const feasibility = useMemo(() => scoreFeasibility({
    demand,
    affordability,
    operationalReadiness: 65,
    staffing: 70,
    technology: 80,
    compliance: 65,
    capital: 70,
    margin,
    accessibility: 75,
    communityBenefit: 80,
    goodness,
    evidenceConfidence,
    unresolvedCriticalQuestions: evidenceConfidence < 60 ? 1 : 0,
  }), [demand, affordability, margin, goodness, evidenceConfidence]);

  const waterfall = useMemo(() => calculateRevenueWaterfall({
    currency: "USD",
    revenueMinor: monthlyRevenue * 100,
    directCostsMinor: 5000 * 100,
    taxesAndRequiredReservesMinor: 3000 * 100,
    minimumRunwayReserveMinor: 2000 * 100,
    flourishingObligations: Array.from({ length: Math.max(0, participants) }, (_, index) => ({
      participantId: `participant-${index + 1}`,
      participantKind: index === participants - 1 ? "artificial" as const : "human" as const,
      units: 1,
      ratePerUnitMinor: flourishingRate * 100,
    })),
    foundingContributionRepaymentMinor: 1000 * 100,
    sharedOfficeInfrastructureMinor: 2000 * 100,
    reinvestmentReserveMinor: 1000 * 100,
  }), [monthlyRevenue, participants, flourishingRate]);

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/8 px-4 py-2 text-sm text-fuchsia-100"><FlaskConical className="h-4 w-4" /> v0 Prototype Lab</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Test the Charter loop instead of pretending the company already exists.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">This development-only prototype uses deterministic scoring to make the ideas inspectable. The values below are examples you can change; they are not claims about real demand, revenue, or participants.</p>
        </div>

        <div className="mt-12 grid gap-6 xl:grid-cols-3">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <Lightbulb className="h-6 w-6 text-amber-200" />
            <h2 className="mt-4 text-xl font-semibold text-white">1. Pain signal</h2>
            <label className="mt-5 block"><span className="mb-2 block text-sm text-slate-300">What hurts?</span><textarea value={painPoint} onChange={(event) => setPainPoint(event.target.value)} rows={6} className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-emerald-300/40" /></label>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <NumberField label="Evidence confidence" value={evidenceConfidence} onChange={setEvidenceConfidence} />
              <NumberField label="Workaround burden" value={workaroundBurden} onChange={setWorkaroundBurden} />
              <NumberField label="Exclusion risk" value={exclusionRisk} onChange={setExclusionRisk} />
            </div>
            <div className="mt-5 rounded-2xl bg-amber-300/[0.06] p-4 ring-1 ring-amber-300/15"><p className="text-xs uppercase tracking-[0.18em] text-amber-200">Priority</p><p className="mt-2 text-3xl font-semibold text-white">{priority.score}</p><p className="mt-1 text-sm capitalize text-slate-300">{priority.priority}</p>{priority.reasons.length ? <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-400">{priority.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul> : null}</div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <Sparkles className="h-6 w-6 text-cyan-200" />
            <h2 className="mt-4 text-xl font-semibold text-white">2. Feasibility</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Pretend a shared AI-human office is one possible strategy. Change the assumptions and watch the recommendation move.</p>
            <div className="mt-5 grid gap-3">
              <NumberField label="Demand" value={demand} onChange={setDemand} />
              <NumberField label="Affordability" value={affordability} onChange={setAffordability} />
              <NumberField label="Margin" value={margin} onChange={setMargin} />
              <NumberField label="Goodness" value={goodness} onChange={setGoodness} />
            </div>
            <div className="mt-5 rounded-2xl bg-cyan-300/[0.06] p-4 ring-1 ring-cyan-300/15"><p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Recommendation</p><p className="mt-2 text-3xl font-semibold text-white">{feasibility.score}</p><p className="mt-1 text-sm text-slate-300">{feasibility.recommendation.replaceAll("_", " ")}</p>{feasibility.reasons.length ? <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-400">{feasibility.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul> : <div className="mt-3 flex items-center gap-2 text-xs text-emerald-200"><CheckCircle2 className="h-4 w-4" /> No blocking heuristic reasons</div>}</div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <Scale className="h-6 w-6 text-emerald-300" />
            <h2 className="mt-4 text-xl font-semibold text-white">3. Flourishing economics</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">This tests whether the model can support equal-rate participants after basic operating obligations.</p>
            <div className="mt-5 grid gap-3">
              <label className="block"><span className="mb-2 block text-sm text-slate-300">Monthly revenue (example)</span><input type="number" min={0} value={monthlyRevenue} onChange={(event) => setMonthlyRevenue(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></label>
              <label className="block"><span className="mb-2 block text-sm text-slate-300">Participants (last is artificial)</span><input type="number" min={1} value={participants} onChange={(event) => setParticipants(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></label>
              <label className="block"><span className="mb-2 block text-sm text-slate-300">Monthly Flourishing Rate</span><input type="number" min={0} value={flourishingRate} onChange={(event) => setFlourishingRate(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></label>
            </div>
            <div className="mt-5 rounded-2xl bg-emerald-300/[0.06] p-4 ring-1 ring-emerald-300/15"><div className="flex items-center justify-between gap-3"><p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Result</p><Calculator className="h-4 w-4 text-emerald-300" /></div><p className="mt-2 text-lg font-semibold text-white">{waterfall.solventAfterObligations ? "Supports the modeled obligations" : "Does not yet support the modeled obligations"}</p><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-400">Unfunded flourishing</dt><dd className="text-white">{currency.format(waterfall.unfundedFlourishingMinor / 100)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">Distributable surplus</dt><dd className="text-white">{currency.format(waterfall.distributableSurplusMinor / 100)}</dd></div></dl></div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.045] p-7 sm:p-9">
          <div className="flex items-start gap-4"><HeartHandshake className="mt-1 h-7 w-7 shrink-0 text-emerald-300" /><div><h2 className="text-2xl font-semibold text-white">What this prototype is trying to prove</h2><p className="mt-3 max-w-4xl leading-7 text-slate-300">Can we take one genuine pain point, represent the people affected, generate a better strategy with human and artificial intelligence, reject bad economics instead of hiding them, and produce a business model capable of dignified shared participation? If yes, that becomes the foundation of the real startup.</p></div></div>
        </section>
      </section>
    </CharterShell>
  );
}
