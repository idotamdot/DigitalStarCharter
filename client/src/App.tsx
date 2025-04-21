import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import BusinessWizard from "@/pages/BusinessWizard";
import BrandQuestionnaire from "@/pages/BrandQuestionnaire";
import SocialMediaPlan from "@/pages/SocialMediaPlan";
import ServiceSelection from "@/pages/ServiceSelection";
import ResourceLibrary from "@/pages/ResourceLibrary";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./lib/queryClient";

function Router() {
  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
    throwOnError: false,
  });

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/business-wizard" component={BusinessWizard} />
      <Route path="/brand-questionnaire" component={BrandQuestionnaire} />
      <Route path="/social-media-plan" component={SocialMediaPlan} />
      <Route path="/service-selection" component={ServiceSelection} />
      <Route path="/resources" component={ResourceLibrary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
