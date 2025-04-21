import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const ServiceSelection = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("monthly");
  
  // Check if user is logged in
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  // Fetch business profile
  const { data: businessProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/business-profiles/me"],
    enabled: !!user,
    retry: false,
  });

  // Fetch current subscription if exists
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscriptions/me"],
    enabled: !!businessProfile,
    retry: false,
  });

  // Mutation to create/update subscription
  const subscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (currentSubscription) {
        return apiRequest("PUT", `/api/subscriptions/${currentSubscription.id}`, data);
      } else {
        return apiRequest("POST", "/api/subscriptions", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/me"] });
      toast({
        title: "Success!",
        description: "Your subscription has been updated.",
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating your subscription.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to select a service tier",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, userLoading, navigate, toast]);

  // Check for tier parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get("tier");
    if (tierParam) {
      setSelectedTier(tierParam);
    } else if (currentSubscription) {
      setSelectedTier(currentSubscription.tier);
    }
  }, [currentSubscription]);

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleSubscribe = () => {
    if (!selectedTier || !businessProfile) return;
    
    const payload = {
      businessId: businessProfile.id,
      tier: selectedTier,
      startDate: new Date().toISOString(),
      isActive: true,
      paymentInfo: { method: "credit_card", status: "completed" },
    };
    
    subscriptionMutation.mutate(payload);
  };

  const pricingTiers: PricingTier[] = [
    {
      id: "self-guided",
      name: "Self-Guided",
      price: 29,
      description: "Perfect for individuals just starting their business journey",
      features: [
        "Business development wizard",
        "Basic website builder",
        "Social media content scheduler",
        "Resource library access",
        "Community forum access",
      ],
    },
    {
      id: "growth",
      name: "Growth",
      price: 79,
      description: "Ideal for businesses ready to establish a strong online presence",
      features: [
        "Everything in Self-Guided",
        "Advanced website builder with e-commerce",
        "Monthly 1-on-1 expert consultation",
        "Custom logo design",
        "Social media strategy development",
        "SEO optimization",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: 199,
      description: "Complete support for serious business growth",
      features: [
        "Everything in Growth",
        "Dedicated account manager",
        "Full brand identity package",
        "Custom website development",
        "Content creation services",
        "Weekly strategy calls",
        "Marketing campaign management",
      ],
    },
  ];

  if (userLoading || profileLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Service Tier</h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Select the level of support that best suits your business needs and goals
            </p>
          </div>

          <div className="text-center mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="inline-flex">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative ${
                  tier.popular
                    ? "border-2 border-primary-500 shadow-xl"
                    : "border border-gray-200 shadow-md"
                } ${selectedTier === tier.id ? "ring-2 ring-primary-500" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-xs font-semibold rounded-bl-xl">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{tier.name}</span>
                    {selectedTier === tier.id && currentSubscription?.tier === tier.id && (
                      <Badge variant="outline" className="ml-2">Current Plan</Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-baseline mt-2">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${activeTab === "annual" ? Math.round(tier.price * 0.8) : tier.price}
                    </span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {feature.startsWith("Everything in") ? (
                            <strong>{feature}</strong>
                          ) : (
                            feature
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    onClick={() => handleSelectTier(tier.id)}
                    variant={tier.popular ? "default" : "outline"}
                    className={`w-full ${
                      tier.popular
                        ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                        : ""
                    }`}
                  >
                    {selectedTier === tier.id ? "Selected" : "Select"}
                  </Button>
                  
                  {activeTab === "annual" && (
                    <p className="text-xs text-center text-green-600">
                      Save ${Math.round(tier.price * 0.2 * 12)} per year
                    </p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleSubscribe}
              disabled={!selectedTier || subscriptionMutation.isPending || (currentSubscription?.tier === selectedTier)}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 px-8"
            >
              {subscriptionMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : currentSubscription?.tier === selectedTier ? (
                "Current Plan"
              ) : "Confirm Selection"}
            </Button>
            <p className="mt-4 text-gray-500 text-sm">
              {activeTab === "annual" ? "Annual billing, charged yearly" : "Monthly billing, cancel anytime"}
            </p>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Can I change my plan later?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              <div>
                <h3 className="font-semibold">Is there a free trial?</h3>
                <p className="text-gray-600">Yes, all plans come with a 14-day free trial so you can test the features before committing.</p>
              </div>
              <div>
                <h3 className="font-semibold">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards and PayPal.</p>
              </div>
              <div>
                <h3 className="font-semibold">How do I cancel my subscription?</h3>
                <p className="text-gray-600">You can cancel your subscription at any time from your dashboard. Your access will continue until the end of your billing period.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceSelection;
