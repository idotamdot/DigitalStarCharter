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
  { text: "Operations", href: "/operations", requiresAuth: true },
];

export default function Navbar() {
  const [location] = useLocation();
  const { member, isLoading, logoutMutation } = useAuth();
  const authority = useAuthority();
  const filteredLinks = navLinks.filter((link) => !link.requiresAuth || Boolean(member));
  const signInHref = `/auth?returnTo=${encodeURIComponent(location || "/dashboard")}`;

  const authControl = !isLoading && (
    member ? (
      <Button
        onClick={() => logoutMutation.mutate()}
        variant="outline"
        disabled={logoutMutation.isPending}
        className="border-blue-500 text-blue-400 hover:bg-blue-900/30"
      >
        Sign Out
      </Button>
    ) : (
      <RouterLink href={signInHref}>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
          Sign In by Email
        </Button>
      </RouterLink>
    )
  );

  const adminLink = member && authority.isAdmin ? (
    <RouterLink href="/admin" className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 px-2 py-2 text-sm font-semibold">
      <ShieldCheck className="h-4 w-4" /> Admin
    </RouterLink>
  ) : null;

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <RouterLink href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                  <Star className="h-5 w-5 text-yellow-300" />
                </div>
                <span className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  DigitalStarCharter
                </span>
              </div>
            </RouterLink>
          </div>

          <div className="hidden md:flex items-center space-x-5">
            {filteredLinks.map((link) => (
              <RouterLink key={link.href} href={link.href} className="text-gray-300 hover:text-blue-400 px-2 py-2 text-sm font-medium">
                {link.text}
              </RouterLink>
            ))}
            {adminLink}
            {authControl}
          </div>

          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-300">
                  <HamburgerMenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900/95 border-gray-800">
                <div className="flex flex-col space-y-4 mt-6">
                  {filteredLinks.map((link) => (
                    <RouterLink key={link.href} href={link.href} className="text-gray-300 hover:text-blue-400 py-2 text-base font-medium">
                      {link.text}
                    </RouterLink>
                  ))}
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
