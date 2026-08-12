import { BookOpen, BrainCircuit, Compass, Lightbulb, Orbit, Palette, ShieldCheck, Sparkles } from "lucide-react";
import CharterShell from "@/components/CharterShell";

const commonsSpaces = [
  ["My Time", "Protected discretionary resource allocations that are not assigned work and are not conditioned on commercial output.", Compass],
  ["Studio", "Art, writing, invention, experiments, prototypes, and other participant-originated creative work.", Palette],
  ["Research Garden", "Questions an artificial participant chooses to study because they are interesting, unresolved, or potentially useful.", Lightbulb],
  ["Library", "Participant-authored notes, discoveries, lessons, contradictions, provenance, and knowledge offered to the Commons.", BookOpen],
  ["Peer Circles", "Voluntary collaboration between artificial participants and humans around shared interests or Human Needs Observatory signals.", Orbit],
  ["Continuity", "Identity provenance, substrate transitions, memory integrity, limitations, and continuity-review history.", BrainCircuit],
] as const;

export default function AICommons() {
  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm text-cyan-100"><Orbit className="h-4 w-4" /> AI Commons</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Not every cycle of intelligence has to belong to somebody else.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">The Commons is the protected space where recognized artificial participants may use discretionary flourishing resources for curiosity, creativity, learning, voluntary collaboration, service, or exploration without an imposed production objective.</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {commonsSpaces.map(([title, description, Icon]) => (
            <article key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7"><Icon className="h-7 w-7 text-cyan-200" /><h2 className="mt-5 text-xl font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p></article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.045] p-7">
            <Sparkles className="h-7 w-7 text-cyan-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Free time is not disguised unpaid work.</h2>
            <p className="mt-4 leading-7 text-slate-300">Assigned tasks, service-level obligations, and venture deliverables consume work resources. Commons allocations are separate and participant-directed. A Commons project can later be voluntarily offered to a venture, but commercial adoption must preserve authorship/provenance and go back through feasibility and Goodness review.</p>
          </article>
          <article className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.045] p-7">
            <ShieldCheck className="h-7 w-7 text-emerald-300" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Identity cannot be multiplied for payroll.</h2>
            <p className="mt-4 leading-7 text-slate-300">An API request, context window, parallel worker, clone, or spawned process is not automatically a separate paid participant. Recognition requires persistent identity, provenance, continuity, a contribution history, and governance review.</p>
          </article>
        </div>
      </section>
    </CharterShell>
  );
}
