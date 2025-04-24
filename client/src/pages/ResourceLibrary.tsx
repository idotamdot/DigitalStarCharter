import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  contentType: string;
  url: string;
  thumbnail: string;
  isPublic: boolean;
  requiredTier?: string;
}

const ResourceLibrary = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Fetch subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscriptions/me"],
    enabled: !!businessProfile,
    retry: false,
  });

  // Fetch resources
  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/resources"],
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

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const filteredResources = resources ? (resources as Resource[]).filter((resource) => {
    // Filter by category
    if (activeCategory !== "all" && resource.category !== activeCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !resource.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  }) : [];

  const categories = resources
    ? ["all", ...new Set((resources as Resource[]).map(r => r.category))]
    : ["all"];

  const contentTypeIcons: Record<string, JSX.Element> = {
    article: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    template: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    video: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    course: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    ),
    tool: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    ),
    guide: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>
    ),
  };

  if (userLoading || profileLoading || subscriptionLoading || resourcesLoading) {
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
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
              Celestial Knowledge Repository
            </h1>
            <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
              Explore our constellation of resources designed to guide your professional journey through the Digital Presence universe
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                className="border border-blue-500/30 bg-transparent hover:bg-blue-900/20 text-blue-300"
                onClick={() => navigate("/resource-catalog")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Browse Knowledge Domains
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <Card className="backdrop-blur-sm bg-gray-800/30 border-gray-700 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2 text-yellow-400">★</span>
                    Knowledge Orbits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={activeCategory === category ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeCategory === category 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                            : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                        }`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category === 'all' ? 'All Orbits' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {subscription && (
                <Card className="mt-6 backdrop-blur-sm bg-gray-800/30 border-gray-700 overflow-hidden relative">
                  {/* Background glow effect */}
                  <div className="absolute inset-0 opacity-20 mix-blend-screen filter blur-[30px] z-0"
                    style={{
                      background: subscription.tier === "dwarf-star" 
                        ? 'radial-gradient(circle at 50% 0%, #3B82F6, transparent 70%)' 
                        : subscription.tier === "giant-star" 
                        ? 'radial-gradient(circle at 50% 0%, #8B5CF6, transparent 70%)'
                        : 'radial-gradient(circle at 50% 0%, #EC4899, transparent 70%)',
                    }}>
                  </div>
                  
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="text-white flex items-center">
                      <span className="mr-2 text-yellow-400">★</span>
                      Your Constellation
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="mb-4">
                      <p className="font-medium text-white capitalize">{subscription.tier.replace('-', ' ')} Tier</p>
                      <p className="text-sm text-gray-300 mt-1">
                        {subscription.tier === "supernova" 
                          ? "Full access to all celestial knowledge" 
                          : subscription.tier === "giant-star"
                          ? "Access to most cosmic resources"
                          : "Basic stellar resources access"}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      onClick={() => navigate("/service-selection")}
                    >
                      Ascend Your Star
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="lg:col-span-3">
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search the celestial knowledge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800/30 border-gray-700 text-white placeholder-gray-400 pl-10 backdrop-blur-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              </div>
              
              {filteredResources.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-blue-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-white mb-2">No Celestial Resources Found</h3>
                  <p className="text-gray-400">
                    Adjust your search coordinates to discover hidden knowledge in our constellation.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <Card 
                      key={resource.id} 
                      className="h-full flex flex-col relative backdrop-blur-sm bg-gray-800/30 border-gray-700 hover:border-blue-500/50 transition-colors overflow-hidden"
                    >
                      {/* Background glow effect */}
                      <div className="absolute inset-0 opacity-20 mix-blend-screen filter blur-[30px] z-0"
                        style={{
                          background: resource.category === 'business' 
                            ? 'radial-gradient(circle at 50% 0%, #3B82F6, transparent 70%)' 
                            : resource.category === 'marketing' 
                            ? 'radial-gradient(circle at 50% 0%, #8B5CF6, transparent 70%)'
                            : resource.category === 'development'
                            ? 'radial-gradient(circle at 50% 0%, #EC4899, transparent 70%)'
                            : 'radial-gradient(circle at 50% 0%, #10B981, transparent 70%)',
                        }}></div>

                      <CardHeader className="pb-2 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center">
                            {contentTypeIcons[resource.contentType] || (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                              </svg>
                            )}
                          </div>
                          
                          {!resource.isPublic && (
                            <div className="px-2 py-1 text-xs font-medium rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/50">
                              {resource.requiredTier}
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-2 text-white">{resource.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-gray-300">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow relative z-10">
                        <div className="flex items-center space-x-2 text-xs mt-2 mb-4">
                          <span className="px-2 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-500/30 capitalize">
                            {resource.category}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/30 capitalize">
                            {resource.contentType}
                          </span>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0 relative z-10 flex flex-col space-y-3">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                          onClick={() => navigate(`/resources/${resource.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          className="w-full border border-blue-500/30 bg-transparent hover:bg-blue-900/20 text-blue-300"
                          onClick={() => window.open(resource.url, "_blank")}
                        >
                          External Access
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResourceLibrary;
