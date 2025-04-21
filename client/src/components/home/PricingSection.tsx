import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

type PricingTier = {
  name: string;
  price: string;
  description: string;
  popular?: boolean;
  features: {
    included: string[];
    excluded: string[];
  };
  headerClassName?: string;
  buttonVariant: "outline" | "default";
};

const PricingSection = () => {
  const { toast } = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    businessType: "",
  });

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
    throwOnError: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/users/login", loginForm);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setLoginOpen(false);
      
      if (selectedTier) {
        window.location.href = `/service-selection?tier=${selectedTier}`;
      }
      
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
      
      if (selectedTier) {
        window.location.href = `/service-selection?tier=${selectedTier}`;
      }
      
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

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier);
    
    if (!user) {
      setLoginOpen(true);
    } else {
      window.location.href = `/service-selection?tier=${tier}`;
    }
  };

  const pricingTiers: PricingTier[] = [
    {
      name: "Self-Guided",
      price: "$29",
      description: "Perfect for individuals just starting their business journey",
      features: {
        included: [
          "Business development wizard",
          "Basic website builder",
          "Social media content scheduler",
          "Resource library access",
          "Community forum access",
        ],
        excluded: ["1-on-1 expert support", "Custom branding services"],
      },
      buttonVariant: "outline",
    },
    {
      name: "Growth",
      price: "$79",
      description: "Ideal for businesses ready to establish a strong online presence",
      popular: true,
      features: {
        included: [
          "Everything in Self-Guided",
          "Advanced website builder with e-commerce",
          "Monthly 1-on-1 expert consultation",
          "Custom logo design",
          "Social media strategy development",
          "SEO optimization",
        ],
        excluded: ["Dedicated account manager"],
      },
      headerClassName: "bg-gradient-to-r from-primary-500 to-secondary-500",
      buttonVariant: "default",
    },
    {
      name: "Premium",
      price: "$199",
      description: "Complete support for serious business growth",
      features: {
        included: [
          "Everything in Growth",
          "Dedicated account manager",
          "Full brand identity package",
          "Custom website development",
          "Content creation services",
          "Weekly strategy calls",
          "Marketing campaign management",
        ],
        excluded: [],
      },
      buttonVariant: "outline",
    },
  ];

  return (
    <section className="py-16 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Service Tiers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the level of support that's right for your business journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 ${
                tier.popular
                  ? "transform scale-105 border-2 border-primary-500 relative shadow-xl"
                  : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-xs font-semibold">
                  MOST POPULAR
                </div>
              )}
              <div
                className={`p-8 border-b border-gray-200 ${
                  tier.headerClassName || ""
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    tier.headerClassName ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline mb-4">
                  <span
                    className={`text-4xl font-extrabold ${
                      tier.headerClassName ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`ml-1 ${
                      tier.headerClassName
                        ? "text-white opacity-80"
                        : "text-gray-500"
                    }`}
                  >
                    /month
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    tier.headerClassName
                      ? "text-white opacity-90"
                      : "text-gray-600"
                  }`}
                >
                  {tier.description}
                </p>
              </div>
              <div className="p-8">
                <ul className="space-y-4">
                  {tier.features.included.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500 w-5 h-5 mt-1 mr-3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-gray-600">
                        {feature.startsWith("Everything in") ? (
                          <strong>{feature}</strong>
                        ) : (
                          feature
                        )}
                      </span>
                    </li>
                  ))}
                  {tier.features.excluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start opacity-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-500 w-5 h-5 mt-1 mr-3"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
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
                          <option value="Sole Proprietorship">
                            Sole Proprietorship
                          </option>
                          <option value="Partnership">Partnership</option>
                          <option value="LLC">LLC</option>
                          <option value="Not yet established">
                            Not yet established
                          </option>
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

                <Button
                  onClick={() => handleTierSelect(tier.name.toLowerCase())}
                  variant={tier.buttonVariant}
                  className={`mt-8 w-full ${
                    tier.buttonVariant === "default"
                      ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                      : "text-primary-600 border-primary-600 hover:bg-primary-50"
                  }`}
                >
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
