import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import { HamburgerMenuIcon } from "@/lib/icons";
import { Star } from "lucide-react";

type NavLink = {
  text: string;
  href: string;
  requiresAuth?: boolean;
};

const navLinks: NavLink[] = [
  { text: "Features", href: "/#features" },
  { text: "Constellation Services", href: "/service-selection" },
  { text: "Mission", href: "/mission" },
  { text: "Join", href: "/join" },
  { text: "About Us", href: "/#about" },
  { text: "Dashboard", href: "/dashboard", requiresAuth: true },
  { text: "Resources", href: "/resources", requiresAuth: true },
  { text: "Constellations", href: "/constellations", requiresAuth: true },
];

const Navbar = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    businessType: "",
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
    throwOnError: false,
  });

  const isHomePage = location === "/" || location.startsWith("/#");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/users/login", loginForm);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setLoginOpen(false);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/users/register", registerForm);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setRegisterOpen(false);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your inputs and try again",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/users/logout", {});
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
      // Redirect to home if on dashboard
      if (location.startsWith("/dashboard") || location.startsWith("/resources")) {
        window.location.href = "/";
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Filter links based on authentication status
  const filteredLinks = navLinks.filter((link) => {
    if (link.requiresAuth) {
      return !!user;
    }
    return true;
  });

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                  <Star className="h-5 w-5 text-yellow-300" />
                </div>
                <span className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Digital Presence
                </span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isHomePage &&
              filteredLinks
                .filter((link) => link.href.startsWith("/#"))
                .map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 px-3 py-2 text-sm font-medium"
                  >
                    {link.text}
                  </a>
                ))}

            {filteredLinks
              .filter((link) => !link.href.startsWith("/#"))
              .map((link) => (
                <Link key={link.href} href={link.href}>
                  <a className="text-gray-300 hover:text-blue-400 px-3 py-2 text-sm font-medium">
                    {link.text}
                  </a>
                </Link>
              ))}

            {!isLoading && (
              <>
                {!user ? (
                  <>
                    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="hidden md:block border-blue-500 text-blue-400 hover:bg-blue-900/30"
                        >
                          Sign In
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Sign in to your account</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleLogin} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={loginForm.username}
                              onChange={(e) =>
                                setLoginForm({
                                  ...loginForm,
                                  username: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={loginForm.password}
                              onChange={(e) =>
                                setLoginForm({
                                  ...loginForm,
                                  password: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Sign In
                          </Button>
                        </form>
                        <p className="text-center text-sm mt-4">
                          Don't have an account?{" "}
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => {
                              setLoginOpen(false);
                              setRegisterOpen(true);
                            }}
                          >
                            Register
                          </Button>
                        </p>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                          Get Started
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create an account</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleRegister}
                          className="space-y-4 mt-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={registerForm.fullName}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  fullName: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={registerForm.email}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  email: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-username">Username</Label>
                            <Input
                              id="reg-username"
                              value={registerForm.username}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  username: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-password">Password</Label>
                            <Input
                              id="reg-password"
                              type="password"
                              value={registerForm.password}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  password: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="businessType">Business Type</Label>
                            <select
                              id="businessType"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              value={registerForm.businessType}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  businessType: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">Select your business type</option>
                              <option value="Sole Proprietorship">Sole Proprietorship</option>
                              <option value="Partnership">Partnership</option>
                              <option value="LLC">LLC</option>
                              <option value="Not yet established">Not yet established</option>
                            </select>
                          </div>
                          <Button type="submit" className="w-full">
                            Register
                          </Button>
                        </form>
                        <p className="text-center text-sm mt-4">
                          Already have an account?{" "}
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => {
                              setRegisterOpen(false);
                              setLoginOpen(true);
                            }}
                          >
                            Sign in
                          </Button>
                        </p>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-900/30"
                  >
                    Sign Out
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-300">
                  <HamburgerMenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900/95 border-gray-800">
                <div className="flex flex-col space-y-4 mt-6">
                  {isHomePage &&
                    filteredLinks
                      .filter((link) => link.href.startsWith("/#"))
                      .map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          className="text-gray-300 hover:text-blue-400 py-2 text-base font-medium"
                        >
                          {link.text}
                        </a>
                      ))}

                  {filteredLinks
                    .filter((link) => !link.href.startsWith("/#"))
                    .map((link) => (
                      <Link key={link.href} href={link.href}>
                        <a className="text-gray-300 hover:text-blue-400 py-2 text-base font-medium">
                          {link.text}
                        </a>
                      </Link>
                    ))}

                  {!isLoading && (
                    <>
                      {!user ? (
                        <>
                          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full border-blue-500 text-blue-400 hover:bg-blue-900/30"
                              >
                                Sign In
                              </Button>
                            </DialogTrigger>
                          </Dialog>

                          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700">
                                Get Started
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </>
                      ) : (
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full border-primary-600 text-primary-600 hover:bg-primary-50"
                        >
                          Sign Out
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
