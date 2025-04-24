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
import { Star, Sparkles, Rocket, Shield, ZapIcon, Diamond, Users } from "lucide-react";

interface ServiceTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
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
        description: "Your constellation services have been updated.",
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating your services.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to select constellation services",
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
      businessId: businessProfile?.id,
      tier: selectedTier,
      startDate: new Date().toISOString(),
      isActive: true,
      paymentInfo: { method: "credit_card", status: "completed" },
    };
    
    subscriptionMutation.mutate(payload);
  };

  const serviceTiers: ServiceTier[] = [
    {
      id: "dwarf-star",
      name: "Dwarf Star",
      icon: <Star className="h-8 w-8" />,
      color: "blue",
      price: 29,
      description: "Basic services for new constellation members just beginning their journey",
      features: [
        "Digital Presence skills assessment",
        "Weekly AI task allocation",
        "Profit-sharing participation",
        "Resource library access",
        "Guiding Star forum access",
      ],
    },
    {
      id: "giant-star",
      name: "Giant Star",
      icon: <Sparkles className="h-8 w-8" />,
      color: "purple",
      price: 79,
      description: "Enhanced services for established constellation members",
      features: [
        "Everything in Dwarf Star",
        "Priority task selection",
        "Monthly 1-on-1 mentorship",
        "Specialized skills certification",
        "Constellation voting rights",
        "Multi-role participation",
      ],
      popular: true,
    },
    {
      id: "supernova",
      name: "Supernova",
      icon: <Diamond className="h-8 w-8" />,
      color: "pink",
      price: 199,
      description: "Premium services for North Star Council candidates",
      features: [
        "Everything in Giant Star",
        "Guiding Star eligibility",
        "Council voting rights",
        "Constellation formation privileges",
        "Custom AI skill development",
        "Weekly strategy sessions",
        "Unlimited role changes",
      ],
    },
  ];

  if (userLoading || profileLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a1f]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1f]">
      <Navbar />
      <main className="flex-grow relative overflow-hidden">
        {/* Background stars */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute h-full w-full">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 5 + 3}s`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Nebula effects */}
        <div className="absolute top-40 -left-20 w-96 h-96 rounded-full bg-blue-500 mix-blend-screen filter blur-[120px] opacity-20 z-0 animate-pulse" 
             style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-40 -right-20 w-96 h-96 rounded-full bg-purple-600 mix-blend-screen filter blur-[120px] opacity-20 z-0 animate-pulse"
             style={{ animationDuration: '20s' }}></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          <div className="mb-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
              Constellation Services
            </h1>
            <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
              Select the level of participation that matches your journey in our celestial network
            </p>
          </div>

          <div className="text-center mb-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="inline-flex">
              <TabsList className="bg-gray-800/50 backdrop-blur-sm">
                <TabsTrigger value="monthly" className="data-[state=active]:bg-blue-900/50">Monthly</TabsTrigger>
                <TabsTrigger value="annual" className="data-[state=active]:bg-blue-900/50">Annual (Save 20%)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {serviceTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative backdrop-blur-sm bg-gray-800/30 border-gray-700 ${
                  tier.popular
                    ? "border-2 border-purple-500/50 shadow-lg shadow-purple-500/10"
                    : "border border-gray-700"
                } ${selectedTier === tier.id ? "ring-2 ring-blue-500" : ""} hover:border-blue-500/50 transition-colors overflow-hidden`}
              >
                {/* Background glow effect */}
                <div 
                  className={`absolute inset-0 opacity-20 mix-blend-screen filter blur-[50px] z-0`}
                  style={{
                    background: tier.color === 'blue' 
                      ? 'radial-gradient(circle at 50% 0%, #3B82F6, transparent 70%)' 
                      : tier.color === 'purple' 
                      ? 'radial-gradient(circle at 50% 0%, #8B5CF6, transparent 70%)'
                      : 'radial-gradient(circle at 50% 0%, #EC4899, transparent 70%)',
                  }}
                ></div>
                
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-xl z-10">
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className="pb-0">
                  <div className="flex justify-center mb-4">
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        tier.color === 'blue' 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : tier.color === 'purple' 
                          ? 'bg-purple-900/30 text-purple-400'
                          : 'bg-pink-900/30 text-pink-400'
                      }`}
                    >
                      {tier.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="flex flex-col items-center">
                    <span className="text-white text-xl">{tier.name}</span>
                    {selectedTier === tier.id && currentSubscription?.tier === tier.id && (
                      <Badge variant="outline" className="mt-2 bg-blue-900/30 text-blue-300 border-blue-500/50">Current Tier</Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex justify-center items-baseline mt-4">
                    <span 
                      className={`text-4xl font-extrabold ${
                        tier.color === 'blue' ? 'text-blue-400' : 
                        tier.color === 'purple' ? 'text-purple-400' : 'text-pink-400'
                      }`}
                    >
                      ${activeTab === "annual" ? Math.round(tier.price * 0.8) : tier.price}
                    </span>
                    <span className="text-gray-400 ml-1">/month</span>
                  </div>
                  
                  <CardDescription className="text-gray-400 mt-2 text-center">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-400 mr-2 text-lg">★</span>
                        <span className="text-gray-300">
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
                
                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Button
                    onClick={() => handleSelectTier(tier.id)}
                    variant="outline"
                    className={`w-full border border-gray-700 ${
                      tier.color === 'blue' 
                        ? 'hover:bg-blue-900/50 hover:text-blue-300 hover:border-blue-500/50' : 
                      tier.color === 'purple' 
                        ? 'hover:bg-purple-900/50 hover:text-purple-300 hover:border-purple-500/50' :
                        'hover:bg-pink-900/50 hover:text-pink-300 hover:border-pink-500/50'
                    } ${
                      selectedTier === tier.id 
                        ? tier.color === 'blue' 
                          ? 'bg-blue-900/50 text-blue-300 border-blue-500/50' :
                          tier.color === 'purple'
                          ? 'bg-purple-900/50 text-purple-300 border-purple-500/50' :
                          'bg-pink-900/50 text-pink-300 border-pink-500/50'
                        : 'bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    {selectedTier === tier.id ? "Selected" : "Select"}
                  </Button>
                  
                  {activeTab === "annual" && (
                    <p className={`text-xs text-center ${
                      tier.color === 'blue' ? 'text-blue-400' : 
                      tier.color === 'purple' ? 'text-purple-400' : 'text-pink-400'
                    }`}>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-6 rounded-full"
            >
              {subscriptionMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : currentSubscription?.tier === selectedTier ? (
                "Current Tier"
              ) : "Confirm Selection"}
            </Button>
            <p className="mt-4 text-gray-400 text-sm">
              {activeTab === "annual" ? "Annual billing, charged yearly" : "Monthly billing, cancel anytime"}
            </p>
          </div>

          <div className="mt-24 max-w-3xl mx-auto bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                <ZapIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-8 text-white">Celestial Questions</h2>
            <div className="space-y-6">
              <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                <h3 className="font-semibold text-white flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  Can I change my constellation tier later?
                </h3>
                <p className="text-gray-300 mt-2">
                  Yes, any star can change their tier at any time. Your participation level will be adjusted at the next billing cycle.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                <h3 className="font-semibold text-white flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  How is profit-sharing calculated?
                </h3>
                <p className="text-gray-300 mt-2">
                  All stars who complete their weekly tasks receive an equal share of constellation profits, regardless of tier. Higher tiers provide additional services and privileges.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                <h3 className="font-semibold text-white flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  What payment methods are accepted?
                </h3>
                <p className="text-gray-300 mt-2">
                  We accept all major credit cards, PayPal, and cryptocurrency payments for constellation memberships.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                <h3 className="font-semibold text-white flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-2" />
                  How do I become eligible for the North Star Council?
                </h3>
                <p className="text-gray-300 mt-2">
                  The North Star Council consists of the first 30 members (15 UX Designers and 15 Developers). To be considered, you must maintain Supernova tier status and receive nomination from existing council members.
                </p>
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
