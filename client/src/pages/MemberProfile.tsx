import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Accessibility, Brain, Clock3, HeartHandshake, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { MemberProfileApi } from "@shared/member-api";

interface ProfileDraft {
  primarySkills: string;
  developingSkills: string;
  preferredWork: string;
  avoidWork: string;
  communication: string;
  accessibility: string;
  schedule: string;
  mobility: string;
  constraintsNotes: string;
  learningGoals: string;
  availabilityNotes: string;
}

const emptyDraft: ProfileDraft = {
  primarySkills: "",
  developingSkills: "",
  preferredWork: "",
  avoidWork: "",
  communication: "",
  accessibility: "",
  schedule: "",
  mobility: "",
  constraintsNotes: "",
  learningGoals: "",
  availabilityNotes: "",
};

function join(values: string[] | undefined): string {
  return values?.join(", ") ?? "";
}

function split(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function MemberProfile() {
  const { member } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery<MemberProfileApi>({ queryKey: ["/api/member/profile"] });
  const [displayName, setDisplayName] = useState(member?.displayName ?? "");
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);

  useEffect(() => {
    if (member) setDisplayName(member.displayName);
  }, [member]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setDraft({
      primarySkills: join(profile.skills.primary),
      developingSkills: join(profile.skills.developing),
      preferredWork: join(profile.preferences.preferredWork),
      avoidWork: join(profile.preferences.avoidWork),
      communication: join(profile.preferences.communication),
      accessibility: join(profile.constraints.accessibility),
      schedule: profile.constraints.schedule ?? "",
      mobility: profile.constraints.mobility ?? "",
      constraintsNotes: profile.constraints.notes ?? "",
      learningGoals: join(profile.learningGoals),
      availabilityNotes: profile.availabilityNotes ?? "",
    });
  }, [profileQuery.data]);

  const saveIdentity = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/member", { displayName }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["/api/member"] }),
  });

  const saveProfile = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/member/profile", {
      skills: {
        primary: split(draft.primarySkills),
        developing: split(draft.developingSkills),
      },
      preferences: {
        preferredWork: split(draft.preferredWork),
        avoidWork: split(draft.avoidWork),
        communication: split(draft.communication),
      },
      constraints: {
        accessibility: split(draft.accessibility),
        schedule: draft.schedule || undefined,
        mobility: draft.mobility || undefined,
        notes: draft.constraintsNotes || undefined,
      },
      learningGoals: split(draft.learningGoals),
      availabilityNotes: draft.availabilityNotes || null,
    }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["/api/member/profile"] }),
  });

  if (!member) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">People system</p>
          <h1 className="mt-2 text-4xl font-bold">Your member profile</h1>
          <p className="mt-3 max-w-3xl text-slate-300">Tell the operating system what you do well, what you want to learn, what work fits you, and what conditions help you succeed. These are inputs for role fit—not reasons to diminish your place on the team.</p>
        </header>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader><CardTitle className="flex items-center gap-2"><HeartHandshake className="h-5 w-5" /> Identity</CardTitle><CardDescription>Your Neon Auth email is identity-bound; your display name is yours to set.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div><Label htmlFor="display-name">Display name</Label><Input id="display-name" className="mt-2" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></div>
              <Button onClick={() => saveIdentity.mutate()} disabled={saveIdentity.isPending || !displayName.trim()}>Save name</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Skills & work fit</CardTitle><CardDescription>Comma-separated entries are fine; we can make this richer later.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Skills you already use well" value={draft.primarySkills} onChange={(value) => setDraft({ ...draft, primarySkills: value })} />
              <Field label="Skills you are developing" value={draft.developingSkills} onChange={(value) => setDraft({ ...draft, developingSkills: value })} />
              <Field label="Work you prefer" value={draft.preferredWork} onChange={(value) => setDraft({ ...draft, preferredWork: value })} />
              <Field label="Work you should avoid" value={draft.avoidWork} onChange={(value) => setDraft({ ...draft, avoidWork: value })} />
              <Field label="Communication that works for you" value={draft.communication} onChange={(value) => setDraft({ ...draft, communication: value })} />
              <Field label="Learning goals" value={draft.learningGoals} onChange={(value) => setDraft({ ...draft, learningGoals: value })} />
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader><CardTitle className="flex items-center gap-2"><Accessibility className="h-5 w-5" /> Accessibility & constraints</CardTitle><CardDescription>The system should adapt work around real human constraints wherever possible.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Accessibility needs" value={draft.accessibility} onChange={(value) => setDraft({ ...draft, accessibility: value })} />
              <Field label="Mobility considerations" value={draft.mobility} onChange={(value) => setDraft({ ...draft, mobility: value })} />
              <div className="md:col-span-2"><Label>Schedule constraints</Label><Textarea className="mt-2" value={draft.schedule} onChange={(event) => setDraft({ ...draft, schedule: event.target.value })} /></div>
              <div className="md:col-span-2"><Label>Anything else the system should respect</Label><Textarea className="mt-2" value={draft.constraintsNotes} onChange={(event) => setDraft({ ...draft, constraintsNotes: event.target.value })} /></div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/55">
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock3 className="h-5 w-5" /> Availability</CardTitle></CardHeader>
            <CardContent><Textarea value={draft.availabilityNotes} onChange={(event) => setDraft({ ...draft, availabilityNotes: event.target.value })} placeholder="When you can work, recurring limitations, preferred hours, or anything operations should know." /></CardContent>
          </Card>

          <div className="flex justify-end"><Button size="lg" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}><Sparkles className="mr-2 h-4 w-4" /> Save member profile</Button></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><Label>{label}</Label><Input className="mt-2" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Separate entries with commas" /></div>;
}
