import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(1, "Please enter your full name"),
});

const AuthPage = () => {
  const [, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container grid flex-1 w-full h-full min-h-screen py-10 lg:grid-cols-2 lg:gap-12 lg:py-12">
      {/* Left column (form) */}
      <div className="flex flex-col justify-center space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Digital Presence</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Join our celestial network of professionals
          </p>
        </div>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-md mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...loginForm.register("username")}
                      placeholder="Enter your username"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginForm.register("password")}
                      placeholder="Enter your password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline hover:text-primary/90"
                  onClick={() => setActiveTab("register")}
                >
                  Register
                </button>
              </span>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join our community of stars and start your journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      {...registerForm.register("fullName")}
                      placeholder="Enter your full name"
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerForm.register("email")}
                      placeholder="Enter your email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username-reg">Username</Label>
                    <Input
                      id="username-reg"
                      {...registerForm.register("username")}
                      placeholder="Choose a username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-reg">Password</Label>
                    <Input
                      id="password-reg"
                      type="password"
                      {...registerForm.register("password")}
                      placeholder="Create a password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline hover:text-primary/90"
                  onClick={() => setActiveTab("login")}
                >
                  Log in
                </button>
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right column (info) */}
      <div className="hidden lg:flex flex-col justify-center">
        <div className="p-8 space-y-6 relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow">
          {/* Starry background overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background/80" />
            {/* Stars animation */}
            <div className="stars-container absolute inset-0">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="star absolute rounded-full bg-white"
                  style={{
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.8 + 0.2,
                    animation: `twinkle ${Math.random() * 5 + 5}s infinite ${
                      Math.random() * 5
                    }s`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Join the Digital Presence Constellation
            </h2>

            <p className="mb-6 text-lg text-muted-foreground">
              A revolutionary remote work platform where professionals collaborate
              as stars in a unified constellation, sharing skills and rewards.
            </p>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Why Join Digital Presence?
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span> Equal profit
                    distribution based on completed tasks
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span> AI-driven task
                    allocation based on your skills
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span> Freedom to change
                    roles and upgrade skills at any time
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span> Be part of a
                    democratic, transparent governance model
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Join as a Founding Star
                </h3>
                <p className="text-muted-foreground">
                  The first 30 members make up our North Star Council, guiding the
                  platform's future. Early members have increased governance input
                  and unique benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;