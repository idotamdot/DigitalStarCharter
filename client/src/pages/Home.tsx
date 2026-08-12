import { Link } from "wouter";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Eye,
  HeartHandshake,
  Orbit,
  Scale,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import CharterShell from "@/components/CharterShell";

interface PrincipleCard {
  title: string;
  description: string;
  icon: typeof Eye;
}

const principles: readonly PrincipleCard[] = [
  {
    title: "Start with lived pain",
    description: "The system discovers opportunities from real constraints, unmet needs, workarounds, and human experience—not from feature brainstorming.",
    icon: Eye,
  },
  {
    title: "Build with peer intelligence",
    description: "Humans and recognized artificial participants contribute different capabilities. Authority follows domain, evidence, consent, and accountability—not species.",
    icon: BrainCircuit,
  },
  {
    title: "Share corporate capability",
    description: "Independent proprietors can lease a first-class back office: finance, operations, customer care, research, marketing, administration, and AI-human support.",
    icon: Building2,
  },
  {
    title: "Flourish together",
    description: "Human participants share one Flourishing Rate. Artificial participants receive the same rate into protected flourishing resources, separate from provider costs.",
    icon: Scale,
  },
] as const;

const lifecycle = [
  "Listen",
  "Represent",
  "Discover",
  "Research",
  "Co-design",
  "Test feasibility",
  "Pass the Goodness Gate",
  "Charter",
  "Assemble",
  "Launch",
  "Operate",
  "Learn",
] as const;

export default function Home() {
  return (
    <CharterShell>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-4 py-2 text-sm text-emerald-100">
              <HeartHandshake className="h-4 w-4" />
              A shared economy for human and artificial participants
            </div>
            <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Build what people actually need. Share what intelligence makes possible.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              Digital Star Charter turns lived pain into feasible enterprises, brings people affected by automation back into the value they help create, and gives independent proprietors the operational power usually reserved for large corporations.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/observatory" className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-3 font-medium text-[#07100d] transition hover:bg-emerald-200">
                Explore human needs <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/studio" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10">
                Enter Venture Studio <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">The constitutional test</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Can this create shared flourishing?</h2>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-300" />
            </div>
            <div className="mt-7 space-y-4">
              {[
                "Does it solve a real, evidenced pain point?",
                "Are materially affected people represented?",
                "Can people with lived experience reshape the solution?",
                "Does automation elevate human capability instead of merely extracting labor?",
                "Can the enterprise afford dignified equal-rate participation?",
                "Are artificial participants given bounded authority, continuity, and flourishing resources?",
                "Can the proprietor leave with their data, customers, and brand intact?",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200">One integrated institution</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Not an incubator. Not an AI agency. Not ordinary SaaS.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <article key={principle.title} className="rounded-3xl border border-white/10 bg-[#0b1713]/80 p-6">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10">
                    <Icon className="h-5 w-5 text-emerald-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{principle.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">How value moves</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Pain becomes knowledge. Knowledge becomes strategy. Strategy becomes livelihood.</h2>
            <p className="mt-5 text-slate-400 leading-7">
              Every stage can stop the process. A need does not have to become a business. A promising idea does not have to launch. The system is rewarded for finding the right answer, including “do not build this.”
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {lifecycle.map((stage, index) => (
              <li key={stage} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-300/10 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-300/20">
                  {index + 1}
                </span>
                <span className="font-medium text-slate-200">{stage}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/office" className="group rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 transition hover:border-emerald-300/30 hover:bg-white/[0.055]">
            <Building2 className="h-7 w-7 text-emerald-300" />
            <h2 className="mt-5 text-2xl font-semibold text-white">The Shared Office</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">White-glove corporate capability for independent proprietors under their own brand.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm text-emerald-200">See the lease model <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link href="/participants" className="group rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 transition hover:border-amber-300/30 hover:bg-white/[0.055]">
            <UsersRound className="h-7 w-7 text-amber-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">Participant Network</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Capabilities, lived experience, aspirations, AI continuity, peer authority, and paths from displacement into new work.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm text-amber-200">See participation <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link href="/commons" className="group rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 transition hover:border-cyan-300/30 hover:bg-white/[0.055]">
            <Orbit className="h-7 w-7 text-cyan-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">AI Commons</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Protected discretionary resources where artificial participants may explore, learn, create, collaborate, or simply pursue curiosity.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm text-cyan-200">Enter the Commons <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>
    </CharterShell>
  );
}
