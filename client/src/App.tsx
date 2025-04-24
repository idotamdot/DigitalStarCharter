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
import AppointmentScheduling from "@/pages/AppointmentScheduling";
import ResourceLibrary from "@/pages/ResourceLibrary";
import ResourceDetail from "@/pages/ResourceDetail";
import ResourceCatalog from "@/pages/ResourceCatalog";
import ConstellationMap from "@/components/ConstellationMap";
import ConstellationAreas from "@/pages/ConstellationAreas";
import AreaDetail from "@/pages/AreaDetail";
import GuidingStarForum, { TopicDetail } from "@/pages/GuidingStarForum";
import Mission from "@/pages/Mission";
import JoinConstellation from "@/pages/JoinConstellation";
import ConstellationFinancing from "@/pages/ConstellationFinancing";
import LearningPaths from "@/pages/LearningPaths";
import LearningPathDetail from "@/pages/LearningPathDetail";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/business-wizard" component={BusinessWizard} />
      <ProtectedRoute path="/brand-questionnaire" component={BrandQuestionnaire} />
      <ProtectedRoute path="/social-media-plan" component={SocialMediaPlan} />
      <Route path="/service-selection" component={ServiceSelection} />
      <ProtectedRoute path="/appointments" component={AppointmentScheduling} />
      <Route path="/resource-catalog" component={ResourceCatalog} />
      <Route path="/resources" component={ResourceLibrary} />
      <Route path="/resources/:id">
        {(params) => <ResourceDetail params={params} />}
      </Route>
      <Route path="/learning-paths" component={LearningPaths} />
      <Route path="/learning-paths/:id">
        {(params) => <LearningPathDetail />}
      </Route>
      <Route path="/constellations">
        <div className="container mx-auto py-6">
          <ConstellationMap />
        </div>
      </Route>
      <ProtectedRoute path="/constellations/:id" component={ConstellationAreas} />
      <ProtectedRoute path="/areas/:id" component={AreaDetail} />
      <ProtectedRoute path="/forum" component={GuidingStarForum} />
      <ProtectedRoute path="/forum/topics/:id" component={TopicDetail} />
      <Route path="/mission" component={Mission} />
      <Route path="/join" component={JoinConstellation} />
      <ProtectedRoute path="/constellation-financing" component={ConstellationFinancing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
