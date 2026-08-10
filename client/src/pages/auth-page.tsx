import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { neonAuth } from "@/lib/neon-auth";

function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

const AuthPage = () => {
  const [, navigate] = useLocation();
  const { member, isLoading, error: authError } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return safeReturnPath(params.get("returnTo"));
  }, []);

  const callbackURL = useMemo(() => {
    const callback = new URL("/auth", window.location.origin);
    callback.searchParams.set("returnTo", returnTo);
    return callback.toString();
  }, [returnTo]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      toast({
        title: "Sign-in link could not be used",
        description: "Request a new magic link and use the newest email you receive.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (member && !isLoading) navigate(returnTo);
  }, [member, isLoading, navigate, returnTo]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsSending(true);
    try {
      const result = await neonAuth.signIn.magicLink({
        email: normalizedEmail,
        callbackURL,
      });
      if (result.error) throw new Error(result.error.message || "Unable to send magic link");

      setSentTo(normalizedEmail);
      toast({
        title: "Magic link sent",
        description: "Open the newest email from Neon Auth to finish signing in.",
      });
    } catch (error) {
      toast({
        title: "Could not send sign-in link",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading && !sentTo) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-cyan-300" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto grid min-h-[80vh] max-w-5xl items-center gap-10 lg:grid-cols-2">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100"><ShieldCheck className="h-4 w-4" /> Neon Auth · passwordless</div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">One secure link. No password to remember.</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">DigitalStarCharter uses Neon Auth as its sole identity authority. Enter your email and we will send a magic link. After verification, you return to the work you were trying to open.</p>
          <div className="mt-8 space-y-3 text-sm text-slate-300">
            <p>• There is no DigitalStarCharter password database.</p>
            <p>• Protected API calls carry a Neon-issued JWT that the server verifies against Neon’s signing keys.</p>
            <p>• The verified identity maps to one Charter member record and its server-enforced capabilities.</p>
            <p>• Consequential actions still follow the Human-in-the-loop approval model.</p>
          </div>
        </section>

        <Card className="border-cyan-400/20 bg-slate-900/90 text-white shadow-2xl shadow-cyan-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><Mail className="h-5 w-5 text-cyan-300" /> Sign in by email</CardTitle>
            <CardDescription className="text-slate-400">We will return you to {returnTo} after Neon verifies the link.</CardDescription>
          </CardHeader>
          <CardContent>
            {sentTo ? (
              <div className="space-y-5">
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4"><p className="font-medium text-emerald-100">Check your email</p><p className="mt-1 text-sm text-emerald-100/80">A sign-in link was sent to <strong>{sentTo}</strong>. Use the newest link if you request more than one.</p></div>
                <Button variant="outline" className="w-full" onClick={() => setSentTo(null)}>Use a different email</Button>
              </div>
            ) : (
              <form onSubmit={sendMagicLink} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email address</Label>
                  <Input id="magic-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required className="border-slate-700 bg-slate-950" />
                </div>
                <Button type="submit" className="w-full" disabled={isSending}>{isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending secure link…</> : "Email me a magic link"}</Button>
              </form>
            )}
            {authError ? <p className="mt-5 rounded-md border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">{authError.message}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AuthPage;
