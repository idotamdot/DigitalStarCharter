import { Link as RouterLink, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HamburgerMenuIcon } from "@/lib/icons";
import { ShieldCheck, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthority } from "@/hooks/use-authority";

type NavLink = {
  text: string;
  href: string;
  requiresAuth?: boolean;
};

const navLinks: readonly NavLink[] = [
  { text: "Mission", href: "/mission" },
  { text: "Knowledge", href: "/resources" },
  { text: "Learning", href: "/learning-paths" },
  { text: "Dashboard", href: "/dashboard", requiresAuth: true },
  { text: "Profile", href: "/profile", requiresAuth: true },
  { text: "Operations", href: "/operations", requiresAuth: true },
  { text: "Quality", href: "/quality", requiresAuth: true },
];

export default function Navbar() {
  const [location] = useLocation();
  const { member, isLoading, logoutMutation } = useAuth();
  const authority = useAuthority();
  const filteredLinks = navLinks.filter((link) => !link.requiresAuth || Boolean(member));
  const signInHref = `/auth?returnTo=${encodeURIComponent(location || "/dashboard")}`;

  const authControl = !isLoading && (
    member ? (
      <Button onClick={() => logoutMutation.mutate()} variant="outline" disabled={logoutMutation.isPending} className="border-blue-500 text-blue-400 hover:bg-blue-900/30">
        Sign Out
      </Button>
    ) : (
      <RouterLink href={signInHref}>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">Sign In by Email</Button>
      </RouterLink>
    )
  );

  const adminLink = member && authority.isAdmin ? (
    <RouterLink href="/admin" className="inline-flex items-center gap-1 px-2 py-2 text-sm font-semibold text-amber-300 hover:text-amber-200">
      <ShieldCheck className="h-4 w-4" /> Admin
    </RouterLink>
  ) : null;

  return (
    <nav className="fixed z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <RouterLink href="/">
              <div className="flex cursor-pointer items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white"><Star className="h-5 w-5 text-yellow-300" /></div>
                <span className="ml-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent">DigitalStarCharter</span>
              </div>
            </RouterLink>
          </div>

          <div className="hidden items-center space-x-5 md:flex">
            {filteredLinks.map((link) => <RouterLink key={link.href} href={link.href} className="px-2 py-2 text-sm font-medium text-gray-300 hover:text-blue-400">{link.text}</RouterLink>)}
            {adminLink}
            {authControl}
          </div>

          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-gray-300"><HamburgerMenuIcon className="h-6 w-6" /></Button></SheetTrigger>
              <SheetContent side="right" className="border-gray-800 bg-gray-900/95">
                <div className="mt-6 flex flex-col space-y-4">
                  {filteredLinks.map((link) => <RouterLink key={link.href} href={link.href} className="py-2 text-base font-medium text-gray-300 hover:text-blue-400">{link.text}</RouterLink>)}
                  {adminLink}
                  {authControl}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
