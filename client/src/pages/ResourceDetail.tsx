import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StarButton } from "@/components/ui/star-button";

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
  content?: string;
  author?: string;
  datePublished?: string;
  relatedResources?: number[];
}

const ResourceDetail = ({ params }: { params: { id: string } }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const resourceId = parseInt(params.id);
  
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

  // Fetch resource detail
  const { data: resource, isLoading: resourceLoading } = useQuery({
    queryKey: ["/api/resources", resourceId],
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

  // Check if user has access to this resource
  const hasAccess = () => {
    if (!resource || !subscription) return false;
    if (resource.isPublic) return true;
    
    // Handle tier-based access
    const tierLevels = {
      "dwarf-star": 1,
      "giant-star": 2,
      "supernova": 3
    };
    
    const resourceTierLevel = resource.requiredTier ? tierLevels[resource.requiredTier as keyof typeof tierLevels] || 0 : 0;
    const userTierLevel = tierLevels[subscription.tier as keyof typeof tierLevels] || 0;
    
    return userTierLevel >= resourceTierLevel;
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'article':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        );
      case 'template':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        );
      case 'course':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        );
      case 'tool':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        );
      case 'guide':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
    }
  };

  if (userLoading || profileLoading || subscriptionLoading || resourceLoading) {
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

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a1f]">
        <Navbar />
        <main className="flex-grow relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="text-center bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700 p-12">
              <h2 className="text-2xl font-bold text-white mb-4">Resource Not Found</h2>
              <p className="text-gray-300 mb-8">This celestial knowledge does not exist in our constellation.</p>
              <Button
                onClick={() => navigate('/resources')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Return to Library
              </Button>
            </div>
          </div>
        </main>
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
        <div 
          className="absolute top-40 -left-20 w-96 h-96 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0 animate-pulse" 
          style={{ 
            animationDuration: '15s',
            background: resource.category === 'business' 
              ? 'radial-gradient(circle at 50% 0%, #3B82F6, transparent 70%)' 
              : resource.category === 'marketing' 
              ? 'radial-gradient(circle at 50% 0%, #8B5CF6, transparent 70%)'
              : resource.category === 'development'
              ? 'radial-gradient(circle at 50% 0%, #EC4899, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, #10B981, transparent 70%)'
          }}
        ></div>
      
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          {/* Resource navigation */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/resources')}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Resource Library
            </Button>
          </div>

          {/* Resource header */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center">
                {getContentTypeIcon(resource.contentType)}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-500/30 text-sm capitalize">
                  {resource.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/30 text-sm capitalize">
                  {resource.contentType}
                </span>
                {!resource.isPublic && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/50 capitalize">
                    {resource.requiredTier?.replace('-', ' ')} Tier
                  </span>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
              {resource.title}
            </h1>
            
            {resource.author && (
              <p className="text-gray-300 mb-2">
                By {resource.author} 
                {resource.datePublished && ` • ${new Date(resource.datePublished).toLocaleDateString()}`}
              </p>
            )}
            
            <p className="text-gray-300 text-lg mt-4 mb-8">
              {resource.description}
            </p>
          </div>

          {/* Resource content */}
          {hasAccess() ? (
            <Card className="backdrop-blur-sm bg-gray-800/30 border-gray-700 overflow-hidden mb-8">
              <CardContent className="p-6 md:p-8">
                {resource.contentType === 'video' ? (
                  <div className="aspect-video bg-gray-900 rounded-md mb-6 overflow-hidden">
                    <iframe 
                      className="w-full h-full" 
                      src={resource.url} 
                      title={resource.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-blue max-w-none mb-6">
                    {resource.content ? (
                      <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                    ) : (
                      <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
                          {getContentTypeIcon(resource.contentType)}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Access External Resource</h3>
                        <p className="text-gray-300 mb-6">
                          This celestial knowledge exists in an external constellation.
                        </p>
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => window.open(resource.url, "_blank")}
                        >
                          Open External Resource
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="backdrop-blur-sm bg-gray-800/30 border-gray-700 rounded-lg overflow-hidden p-10 text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Celestial Knowledge Restricted</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                This resource requires {resource.requiredTier?.replace('-', ' ')} tier access or higher.
                Upgrade your constellation tier to view this content.
              </p>
              <div className="flex justify-center">
                <StarButton
                  href="/service-selection"
                  color="purple"
                  size="md"
                >
                  Upgrade Your Star
                </StarButton>
              </div>
            </div>
          )}

          {/* Related Resources */}
          {resource.relatedResources && resource.relatedResources.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2 text-yellow-400">★</span>
                Related Celestial Knowledge
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* We would map through related resources here */}
                <Card className="backdrop-blur-sm bg-gray-800/30 border-gray-700 hover:border-blue-500/50 transition-colors overflow-hidden h-full">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Explore More Resources</CardTitle>
                    <CardDescription className="text-gray-300">
                      Discover related celestial knowledge in our vast constellation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      onClick={() => navigate('/resources')}
                    >
                      Return to Library
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResourceDetail;