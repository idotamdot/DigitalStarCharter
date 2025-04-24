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
import ConstellationMap from "@/components/ConstellationMap";
import ConstellationAreas from "@/pages/ConstellationAreas";
import AreaDetail from "@/pages/AreaDetail";
import GuidingStarForum, { TopicDetail } from "@/pages/GuidingStarForum";
import Mission from "@/pages/Mission";
import JoinConstellation from "@/pages/JoinConstellation";
import ConstellationFinancing from "@/pages/ConstellationFinancing";
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
      <Route path="/constellations">
        <div className="container mx-auto py-6">
          <ConstellationMap />
        </div>
      </Route>
      <Route path="/constellations/:id">
        {(params) => <ConstellationAreas />}
      </Route>
      <Route path="/areas/:id">
        {(params) => <AreaDetail />}
      </Route>
      <Route path="/forum">
        <GuidingStarForum />
      </Route>
      <Route path="/forum/topics/:id">
        {(params) => <TopicDetail />}
      </Route>
      <Route path="/mission" component={Mission} />
      <Route path="/join" component={JoinConstellation} />
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
