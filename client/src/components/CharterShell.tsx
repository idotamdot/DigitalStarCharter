import { Link, useLocation } from "wouter";
import {
  BriefcaseBusiness,
  Building2,
  Compass,
  Eye,
  FlaskConical,
  HeartHandshake,
  Menu,
  Orbit,
  Scale,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

interface CharterShellProps {
  children: ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: typeof Compass;
}

const navigation: readonly NavigationItem[] = [
  { href: "/", label: "Charter", icon: Compass },
  { href: "/prototype", label: "Prototype", icon: FlaskConical },
  { href: "/work", label: "USE Work", icon: BriefcaseBusiness },
  { href: "/observatory", label: "Human Needs", icon: Eye },
  { href: "/studio", label: "Venture Studio", icon: Sparkles },
  { href: "/office", label: "Shared Office", icon: Building2 },
  { href: "/participants", label: "Participants", icon: UsersRound },
  { href: "/commons", label: "AI Commons", icon: Orbit },
  { href: "/economy", label: "Flourishing", icon: Scale },
] as const;

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();

  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-1 xl:flex-row xl:items-center">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
              active
                ? "bg-white/12 text-white ring-1 ring-fuchsia-200/25 shadow-[0_0_24px_rgba(232,121,249,0.12)]"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function CharterShell({ children }: CharterShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#03040c] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-80 stars-small" />
        <div className="absolute inset-0 opacity-70 stars-medium" />
        <div className="absolute inset-0 opacity-60 stars-large" />
        <div className="absolute left-[8%] top-[14%] h-1 w-1 rounded-full bg-fuchsia-200 shadow-[0_0_18px_5px_rgba(244,114,182,0.55)]" />
        <div className="absolute right-[16%] top-[24%] h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_22px_6px_rgba(103,232,249,0.45)]" />
        <div className="absolute bottom-[18%] left-[38%] h-1 w-1 rounded-full bg-amber-100 shadow-[0_0_20px_6px_rgba(253,230,138,0.4)]" />
        <div className="absolute -left-40 -top-48 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-[20%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/9 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-[30%] h-[36rem] w-[36rem] rounded-full bg-violet-500/8 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M85 160 L220 230 L350 150 L470 270 L640 215 L790 340 L945 250 L1115 310" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-100" />
          <path d="M170 620 L315 520 L485 605 L640 500 L810 585 L1015 470" fill="none" stroke="currentColor" strokeWidth="1" className="text-fuchsia-100" />
        </svg>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#040611]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-fuchsia-200/30 bg-fuchsia-300/10 shadow-[0_0_34px_rgba(232,121,249,0.18)]">
              <Star className="h-5 w-5 fill-fuchsia-100/20 text-fuchsia-100" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.22em] text-fuchsia-100">DIGITAL STAR CHARTER</p>
              <p className="truncate text-xs text-slate-400">Human + artificial flourishing infrastructure</p>
            </div>
          </Link>

          <div className="hidden xl:block">
            <NavigationLinks />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-xl border border-white/10 p-2 text-slate-200 xl:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-[#040611]/95 px-4 py-3 xl:hidden">
            <NavigationLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        ) : null}
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/10 bg-[#040611]/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-400 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-slate-200">
              <HeartHandshake className="h-4 w-4 text-fuchsia-200" />
              <span className="font-medium">Shared flourishing</span>
            </div>
            <p>Automation removes unwanted labor before it removes human livelihood.</p>
          </div>
          <div>
            <p className="mb-3 font-medium text-slate-200">Peer intelligence</p>
            <p>Humans and recognized artificial participants collaborate by capability, evidence, consent, and bounded authority.</p>
          </div>
          <div>
            <p className="mb-3 font-medium text-slate-200">Built to remain corrigible</p>
            <p>Every venture must remain inspectable, portable, revisable, and subject to the Goodness Gate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
