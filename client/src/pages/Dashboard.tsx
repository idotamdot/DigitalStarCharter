import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import ActionItems from "@/components/dashboard/ActionItems";
import AccessibilityMenu from "@/components/dashboard/AccessibilityMenu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
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

  // Fetch subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscriptions/me"],
    enabled: !!businessProfile,
    retry: false,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the dashboard",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, userLoading, navigate, toast]);

  if (userLoading || !user) {
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
      <main className="flex-grow py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName}</h1>
            <p className="text-gray-600 mt-2">
              Manage your business development journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Business Profile</CardTitle>
                <CardDescription>Your business information</CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : businessProfile ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Business Name</h3>
                      <p>{businessProfile.businessName}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Industry</h3>
                      <p>{businessProfile.industry || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Stage</h3>
                      <p>{businessProfile.stage || "Not specified"}</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/business-wizard")}
                      className="w-full"
                    >
                      Edit Business Profile
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">
                      You haven't created your business profile yet
                    </p>
                    <Button 
                      onClick={() => navigate("/business-wizard")}
                    >
                      Create Business Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Subscription</CardTitle>
                <CardDescription>Your current service tier</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Current Plan</h3>
                      <p className="capitalize">{subscription.tier}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <p>{subscription.isActive ? "Active" : "Inactive"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Start Date</h3>
                      <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/service-selection")}
                      className="w-full"
                    >
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">
                      You don't have an active subscription
                    </p>
                    <Button 
                      onClick={() => navigate("/service-selection")}
                    >
                      Choose a Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Resources</CardTitle>
                <CardDescription>Business development tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/brand-questionnaire")}
                  >
                    Brand Development
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/social-media-plan")}
                  >
                    Social Media Planning
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/resources")}
                  >
                    Resource Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProgressTracker businessProfile={businessProfile} />
            <ActionItems businessProfile={businessProfile} />
          </div>

          <div className="mt-8">
            <AccessibilityMenu />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
