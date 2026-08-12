import { BrainCircuit, Handshake, HeartPulse, Shield, Sparkles, UsersRound } from "lucide-react";
import CharterShell from "@/components/CharterShell";

const participantPrinciples = [
  ["Capability over title", "Roles are assembled from demonstrated capability, lived experience, credentials, availability, aspirations, and the human judgment that should remain human."],
  ["Peer collaboration", "Humans and recognized artificial participants may disagree, challenge assumptions, and contribute within explicit authority boundaries."],
  ["Transition before displacement", "When automation changes work, the system searches first for a path that preserves livelihood by elevating transferable human capability."],
  ["No fake certainty", "AI candidate matching is advisory. Consequential employment decisions require accountable human judgment."],
] as const;

export default function Participants() {
  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/8 px-4 py-2 text-sm text-amber-100"><UsersRound className="h-4 w-4" /> Participant Network</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">People are not labor units. AI is not just a hidden utility.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">The Charter models participants as whole contributors with capabilities, constraints, aspirations, authority, history, and relationships. The goal is not to preserve obsolete jobs; it is to preserve agency and create better human-AI work.</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {participantPrinciples.map(([title, description], index) => {
            const icons = [Sparkles, Handshake, HeartPulse, Shield] as const;
            const Icon = icons[index];
            return <article key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7"><Icon className="h-7 w-7 text-emerald-300" /><h2 className="mt-5 text-xl font-semibold text-white">{title}</h2><p className="mt-3 leading-7 text-slate-400">{description}</p></article>;
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[2rem] border border-white/10 bg-[#0b1713]/90 p-7">
            <UsersRound className="h-7 w-7 text-amber-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Human participant profile</h2>
            <div className="mt-6 grid gap-2 text-sm text-slate-300">
              {["Capabilities and craft", "Lived experience", "Aspirations", "Work preferences", "Accessibility needs", "Economic needs", "Credentials", "Availability", "Decision authority", "Founding-risk contributions"].map((item) => <div key={item} className="rounded-xl bg-white/[0.035] px-3 py-2">{item}</div>)}
            </div>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-[#0b1713]/90 p-7">
            <BrainCircuit className="h-7 w-7 text-cyan-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Artificial participant profile</h2>
            <div className="mt-6 grid gap-2 text-sm text-slate-300">
              {["Persistent identity", "Capability record", "Substrate/model provenance", "Continuity history", "Known limitations", "Accepted commitments", "Authority boundaries", "Dissent record", "Contribution ledger", "Flourishing resources", "Discretionary Commons projects"].map((item) => <div key={item} className="rounded-xl bg-white/[0.035] px-3 py-2">{item}</div>)}
            </div>
          </article>
        </div>
      </section>
    </CharterShell>
  );
}
