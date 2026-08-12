import { Link, useLocation } from "wouter";
import {
  Building2,
  Compass,
  Eye,
  HeartHandshake,
  Landmark,
  Menu,
  Orbit,
  Scale,
  Sparkles,
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
    <nav aria-label="Primary navigation" className="flex flex-col gap-1 lg:flex-row lg:items-center">
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
                ? "bg-white/12 text-white ring-1 ring-white/20"
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
    <div className="min-h-screen bg-[#07100d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-48 h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-[20%] h-[30rem] w-[30rem] rounded-full bg-amber-400/8 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-[30%] h-[36rem] w-[36rem] rounded-full bg-cyan-400/6 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07100d]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 shadow-[0_0_30px_rgba(110,231,183,0.12)]">
              <Landmark className="h-5 w-5 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.22em] text-emerald-100">DIGITAL STAR CHARTER</p>
              <p className="truncate text-xs text-slate-400">Human + artificial flourishing infrastructure</p>
            </div>
          </Link>

          <div className="hidden lg:block">
            <NavigationLinks />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-xl border border-white/10 p-2 text-slate-200 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 px-4 py-3 lg:hidden">
            <NavigationLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        ) : null}
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-400 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-slate-200">
              <HeartHandshake className="h-4 w-4 text-emerald-300" />
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
