import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BusinessInfoForm from "@/components/wizard/BusinessInfoForm";
import BrandingForm from "@/components/wizard/BrandingForm";
import WebsiteForm from "@/components/wizard/WebsiteForm";
import MarketingForm from "@/components/wizard/MarketingForm";
import LaunchForm from "@/components/wizard/LaunchForm";
import { useToast } from "@/hooks/use-toast";

// Steps in the wizard
const WIZARD_STEPS = [
  { id: "business-info", label: "Business Info" },
  { id: "branding", label: "Branding" },
  { id: "website", label: "Website" },
  { id: "marketing", label: "Marketing" },
  { id: "launch", label: "Launch" },
];

const BusinessWizard = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState("business-info");
  
  // Check if user is logged in
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  // Fetch business profile if it exists
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
        description: "Please sign in to access the business wizard",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, userLoading, navigate, toast]);

  // Determine which steps are completed based on the business profile
  const getCompletedSteps = () => {
    if (!businessProfile) return [];
    
    const completedSteps = ["business-info"]; // Business info is completed if profile exists
    
    if (businessProfile.completedSteps) {
      const steps = businessProfile.completedSteps as string[];
      return [...completedSteps, ...steps];
    }
    
    return completedSteps;
  };
  
  const completedSteps = getCompletedSteps();

  // Handle step change
  const handleStepChange = (step: string) => {
    setActiveStep(step);
  };

  if (userLoading) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Business Development Wizard</h1>
            <p className="text-gray-600 mt-2">
              Complete these steps to set up your business online presence
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Tabs value={activeStep} onValueChange={handleStepChange}>
                <TabsList className="grid grid-cols-5 mb-8">
                  {WIZARD_STEPS.map((step) => (
                    <TabsTrigger 
                      key={step.id} 
                      value={step.id}
                      className={completedSteps.includes(step.id) ? "data-[state=active]:bg-green-100 data-[state=active]:text-green-900" : ""}
                    >
                      {step.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="business-info">
                  <BusinessInfoForm 
                    existingProfile={businessProfile}
                    onComplete={() => setActiveStep("branding")}
                  />
                </TabsContent>
                
                <TabsContent value="branding">
                  <BrandingForm 
                    businessProfile={businessProfile}
                    onComplete={() => setActiveStep("website")}
                  />
                </TabsContent>
                
                <TabsContent value="website">
                  <WebsiteForm 
                    businessProfile={businessProfile}
                    onComplete={() => setActiveStep("marketing")}
                  />
                </TabsContent>
                
                <TabsContent value="marketing">
                  <MarketingForm 
                    businessProfile={businessProfile}
                    onComplete={() => setActiveStep("launch")}
                  />
                </TabsContent>
                
                <TabsContent value="launch">
                  <LaunchForm 
                    businessProfile={businessProfile}
                    onComplete={() => navigate("/dashboard")}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at support@digitalpresence.com
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessWizard;
