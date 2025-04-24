import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StarButton } from "@/components/ui/star-button";

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  popular?: boolean;
}

const ResourceCatalog = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
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

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the resource library",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, userLoading, navigate, toast]);

  const resourceCategories: ResourceCategory[] = [
    {
      id: "business-foundations",
      name: "Business Foundations",
      description: "Essential knowledge for establishing your digital business presence",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
      color: "blue",
    },
    {
      id: "marketing-cosmos",
      name: "Marketing Cosmos",
      description: "Strategies and tools to attract clients and grow your audience",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="21.17" y1="8" x2="12" y2="8"></line>
          <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
          <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
        </svg>
      ),
      color: "purple",
      popular: true,
    },
    {
      id: "technical-universe",
      name: "Technical Universe",
      description: "Development resources and coding knowledge for digital professionals",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      ),
      color: "pink",
    },
    {
      id: "financial-nebula",
      name: "Financial Nebula",
      description: "Money management, pricing strategies, and billing insights",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ),
      color: "green",
    },
    {
      id: "client-galaxy",
      name: "Client Galaxy",
      description: "Client management techniques for stellar relationships",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      color: "orange",
    },
    {
      id: "productivity-constellation",
      name: "Productivity Constellation",
      description: "Tools and techniques to maximize your efficiency in the digital workspace",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      ),
      color: "teal",
    },
  ];

  if (userLoading || profileLoading) {
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
      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          <div className="mb-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-400">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
              Celestial Knowledge Domains
            </h1>
            <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
              Explore our cosmic library of resources organized by specialized domains of expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {resourceCategories.map((category) => (
              <Card 
                key={category.id} 
                className="h-full flex flex-col relative backdrop-blur-sm bg-gray-800/30 border-gray-700 hover:border-blue-500/50 transition-colors overflow-hidden"
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 opacity-20 mix-blend-screen filter blur-[30px] z-0"
                  style={{
                    background: category.color === 'blue' 
                      ? 'radial-gradient(circle at 50% 0%, #3B82F6, transparent 70%)' 
                      : category.color === 'purple' 
                      ? 'radial-gradient(circle at 50% 0%, #8B5CF6, transparent 70%)'
                      : category.color === 'pink'
                      ? 'radial-gradient(circle at 50% 0%, #EC4899, transparent 70%)'
                      : category.color === 'green'
                      ? 'radial-gradient(circle at 50% 0%, #10B981, transparent 70%)'
                      : category.color === 'orange'
                      ? 'radial-gradient(circle at 50% 0%, #F97316, transparent 70%)'
                      : 'radial-gradient(circle at 50% 0%, #14B8A6, transparent 70%)',
                  }}></div>
                
                {category.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-xl z-10">
                    POPULAR
                  </div>
                )}

                <CardHeader className="pb-2 relative z-10">
                  <div className="flex justify-center mb-4">
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        category.color === 'blue' 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : category.color === 'purple' 
                          ? 'bg-purple-900/30 text-purple-400'
                          : category.color === 'pink'
                          ? 'bg-pink-900/30 text-pink-400'
                          : category.color === 'green'
                          ? 'bg-green-900/30 text-green-400'
                          : category.color === 'orange'
                          ? 'bg-orange-900/30 text-orange-400'
                          : 'bg-teal-900/30 text-teal-400'
                      }`}
                    >
                      {category.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl text-center text-white">{category.name}</CardTitle>
                  <CardDescription className="text-center text-gray-300 mt-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardFooter className="mt-auto p-6 pt-0 relative z-10">
                  <Button
                    className={`w-full ${
                      category.color === 'blue' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : category.color === 'purple' 
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : category.color === 'pink'
                        ? 'bg-pink-600 hover:bg-pink-700'
                        : category.color === 'green'
                        ? 'bg-green-600 hover:bg-green-700'
                        : category.color === 'orange'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-teal-600 hover:bg-teal-700'
                    } text-white border-none`}
                    onClick={() => navigate(`/resources?category=${category.id}`)}
                  >
                    Explore Domain
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <StarButton
              href="/resources"
              color="gold"
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              View All Resources
            </StarButton>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResourceCatalog;