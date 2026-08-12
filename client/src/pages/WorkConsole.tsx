import { useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, ListChecks, Sparkles, UserRoundPlus } from "lucide-react";
import CharterShell from "@/components/CharterShell";
import {
  generateWorkItemsFromObjective,
  onboardingCompletion,
  routeWorkItem,
  type ParticipantOnboardingProfile,
  type TaskRoutingCandidate,
  type WorkObjective,
} from "@shared/work-orchestration";

const initialProfile: ParticipantOnboardingProfile = {
  participantId: "seed-human-001",
  participantKind: "human",
  displayName: "Maria",
  stage: "capabilities",
  capabilities: [
    {
      id: "cap-patterns",
      name: "Spot unusual patterns",
      confidence: 88,
      evidence: ["Prior claims-processing experience"],
      wantsToUse: true,
      wantsToDevelop: true,
    },
    {
      id: "cap-relations",
      name: "Calm and guide frustrated customers",
      confidence: 92,
      evidence: ["High-volume customer support history"],
      wantsToUse: true,
      wantsToDevelop: false,
    },
  ],
  needs: ["Predictable hours", "Stable income", "Child-care compatible schedule"],
  aspirations: ["Learn AI-assisted operations", "Eventually run a business"],
  preferences: {
    preferredHoursPerWeek: 36,
    scheduleNotes: "Prefers school-hour core schedule",
    collaborationPreferences: ["Clear handoffs", "Human review for emotionally sensitive cases"],
    tasksToAvoid: ["Continuous call-center queue"],
    accessibilityNeeds: [],
  },
  thoughtPartnerParticipantId: "ai-nexus-001",
  proposedRoleTitle: "Human Exception & Relationship Steward",
  proposedRolePurpose: "Handle ambiguity, relationship repair, and consequential exceptions while AI handles repetitive comparison and classification.",
  approvedAuthorities: ["inform", "recommend", "execute_reversible"],
};

const candidates: readonly TaskRoutingCandidate[] = [
  {
    participantId: "seed-human-001",
    capabilityFit: 91,
    preferenceFit: 88,
    authorityFit: true,
    availabilityFit: 82,
    reasons: ["Strong relationship capability", "Role preference aligns", "Approved recommendation authority"],
  },
  {
    participantId: "ai-nexus-001",
    capabilityFit: 95,
    preferenceFit: 90,
    authorityFit: true,
    availabilityFit: 100,
    reasons: ["Strong workflow analysis", "Available for parallel analysis", "Human review retained for consequential decisions"],
  },
];

export default function WorkConsole() {
  const [profileStage, setProfileStage] = useState<ParticipantOnboardingProfile["stage"]>(initialProfile.stage);
  const [objectiveTitle, setObjectiveTitle] = useState("Onboard first Universal Operations Office customer");
  const [objectiveOutcome, setObjectiveOutcome] = useState("Customer workflows are documented, operating, quality checked, and supported by a human-AI office.");
  const [objectiveSource, setObjectiveSource] = useState<WorkObjective["source"]>("customer_commitment");
  const [planVersion, setPlanVersion] = useState(0);

  const profile = useMemo(() => ({ ...initialProfile, stage: profileStage }), [profileStage]);
  const objective = useMemo<WorkObjective>(() => ({
    id: `objective-${planVersion + 1}`,
    title: objectiveTitle,
    outcome: objectiveOutcome,
    source: objectiveSource,
    priority: "high",
    dueAt: null,
    constraints: ["No participant deletion", "Respect authority boundaries", "Preserve human and artificial dissent"],
    goodnessRequirements: ["Dignity", "Accessibility", "Non-extraction", "Transparent evidence"],
  }), [objectiveTitle, objectiveOutcome, objectiveSource, planVersion]);

  const generatedTasks = useMemo(() => generateWorkItemsFromObjective(objective), [objective]);
  const routedTasks = useMemo(
    () => generatedTasks.map((task) => ({ task, routing: routeWorkItem(task, candidates) })),
    [generatedTasks],
  );

  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm text-cyan-100"><BriefcaseBusiness className="h-4 w-4" /> USE · Work Console</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Onboard people. Create the work. Route it by capability.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">The Universal Synchrony Engine turns goals and customer commitments into work, assigns human and artificial participants by capability and authority, and records contribution instead of merely tracking attendance.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-fuchsia-200/15 bg-white/[0.045] p-6 shadow-[0_0_45px_rgba(217,70,239,0.05)] backdrop-blur-sm sm:p-7">
            <div className="flex items-center gap-3"><UserRoundPlus className="h-6 w-6 text-fuchsia-200" /><h2 className="text-2xl font-semibold text-white">Staff onboarding</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-400">Not a résumé gate. The system learns capability, needs, aspirations, preferences, accessibility, and desired growth before designing a role.</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">Seed Member</p><p className="mt-2 text-2xl font-semibold text-white">{profile.displayName}</p><p className="mt-1 text-sm text-slate-400">{profile.proposedRoleTitle}</p></div><span className="rounded-full border border-fuchsia-300/20 px-3 py-1 text-sm text-fuchsia-100">{onboardingCompletion(profile)}%</span></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-fuchsia-300" style={{ width: `${onboardingCompletion(profile)}%` }} /></div>
              <label className="mt-5 block text-sm text-slate-300">Prototype onboarding stage<select value={profileStage} onChange={(event) => setProfileStage(event.target.value as ParticipantOnboardingProfile["stage"])} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b18] px-3 py-2 text-white"><option value="identity">Identity</option><option value="capabilities">Capabilities</option><option value="needs">Needs</option><option value="aspirations">Aspirations</option><option value="work_preferences">Work preferences</option><option value="accessibility">Accessibility</option><option value="thought_partner">Thought Partner</option><option value="role_design">Role design</option><option value="ready">Ready</option></select></label>
              <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Capabilities</p><ul className="mt-2 space-y-2 text-sm text-slate-300">{profile.capabilities.map((capability) => <li key={capability.id}>• {capability.name}</li>)}</ul></div><div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Needs</p><ul className="mt-2 space-y-2 text-sm text-slate-300">{profile.needs.map((need) => <li key={need}>• {need}</li>)}</ul></div></div>
              <div className="mt-5 rounded-xl bg-fuchsia-300/[0.06] p-4 text-sm leading-6 text-slate-300"><strong className="text-fuchsia-100">Role purpose:</strong> {profile.proposedRolePurpose}</div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-200/15 bg-white/[0.045] p-6 shadow-[0_0_45px_rgba(34,211,238,0.05)] backdrop-blur-sm sm:p-7">
            <div className="flex items-center gap-3"><ListChecks className="h-6 w-6 text-cyan-200" /><h2 className="text-2xl font-semibold text-white">Dynamic work generation</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-400">Enter a real customer commitment, venture goal, maintenance need, Goodness obligation, participant proposal, or Commons objective. The prototype creates a deterministic work plan that can later be enriched by AI proposals.</p>

            <div className="mt-5 space-y-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5">
              <label className="block"><span className="text-xs uppercase tracking-[0.18em] text-cyan-200">Objective</span><input value={objectiveTitle} onChange={(event) => setObjectiveTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan-300/40" /></label>
              <label className="block"><span className="text-xs uppercase tracking-[0.18em] text-cyan-200">Required outcome</span><textarea value={objectiveOutcome} onChange={(event) => setObjectiveOutcome(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan-300/40" /></label>
              <label className="block"><span className="text-xs uppercase tracking-[0.18em] text-cyan-200">Source</span><select value={objectiveSource} onChange={(event) => setObjectiveSource(event.target.value as WorkObjective["source"])} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b18] px-3 py-2 text-white"><option value="customer_commitment">Customer commitment</option><option value="venture_goal">Venture goal</option><option value="maintenance">Maintenance</option><option value="goodness">Goodness obligation</option><option value="participant_proposal">Participant proposal</option><option value="commons">Commons objective</option></select></label>
              <button type="button" onClick={() => setPlanVersion((current) => current + 1)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm font-medium text-cyan-50 transition hover:bg-cyan-200/15"><Sparkles className="h-4 w-4" /> Generate work plan</button>
            </div>

            <div className="mt-5 space-y-4">
              {routedTasks.map(({ task, routing }) => (
                <article key={task.id} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                  <div className="flex items-start justify-between gap-4"><div><p className="font-medium text-white">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.estimatedEffortHours ?? "?"}h · {task.requiredAuthority.replaceAll("_", " ")}</p></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{task.status}</span></div>
                  <p className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-500">Definition of done</p><ul className="mt-2 space-y-1 text-sm text-slate-300">{task.definitionOfDone.map((item) => <li key={item}>• {item}</li>)}</ul>
                  <div className="mt-4 flex items-center gap-2 text-sm text-cyan-100"><Sparkles className="h-4 w-4" /><span>Recommended: {routing.recommendedParticipantId ?? "Needs review"} · {routing.score}% fit</span></div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-violet-200/20 bg-violet-300/[0.045] p-7 shadow-[0_0_55px_rgba(139,92,246,0.06)] backdrop-blur-sm sm:p-9">
          <div className="flex items-start gap-4"><CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-violet-200" /><div><h2 className="text-2xl font-semibold text-white">The operating loop</h2><p className="mt-3 max-w-5xl leading-7 text-slate-300">Customer commitment or venture goal → objective → generated work items → capability and authority routing → human/AI collaboration → quality review → completion → Success Mapping → capability growth or role pivot → next work cycle.</p></div></div>
        </section>
      </section>
    </CharterShell>
  );
}
