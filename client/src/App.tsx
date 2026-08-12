import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PrototypeLab from "@/pages/PrototypeLab";
import HumanNeedsObservatory from "@/pages/HumanNeedsObservatory";
import VentureStudio from "@/pages/VentureStudio";
import SharedOffice from "@/pages/SharedOffice";
import Participants from "@/pages/Participants";
import AICommons from "@/pages/AICommons";
import FlourishingEconomy from "@/pages/FlourishingEconomy";
import Dashboard from "@/pages/Dashboard";
import Mission from "@/pages/Mission";
import LearningPaths from "@/pages/LearningPaths";
import LearningPathDetail from "@/pages/LearningPathDetail";
import ResourceLibrary from "@/pages/ResourceLibrary";
import ResourceDetail from "@/pages/ResourceDetail";
import AuthPage from "@/pages/auth-page";
import OperationsConsole from "@/pages/OperationsConsole";
import AdminConsole from "@/pages/AdminConsole";
import ManagementConsole from "@/pages/ManagementConsole";
import MemberProfile from "@/pages/MemberProfile";
import GoodnessConsole from "@/pages/GoodnessConsole";
import QualityConsole from "@/pages/QualityConsole";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prototype" component={PrototypeLab} />
      <Route path="/observatory" component={HumanNeedsObservatory} />
      <Route path="/studio" component={VentureStudio} />
      <Route path="/office" component={SharedOffice} />
      <Route path="/participants" component={Participants} />
      <Route path="/commons" component={AICommons} />
      <Route path="/economy" component={FlourishingEconomy} />
      <Route path="/auth" component={AuthPage} />

      {/* Legacy surfaces remain available during the clean rebuild, but no longer define the product. */}
      <Route path="/legacy/mission" component={Mission} />
      <Route path="/legacy/resources" component={ResourceLibrary} />
      <Route path="/legacy/resources/:id">{(params) => <ResourceDetail params={params} />}</Route>
      <Route path="/legacy/learning-paths" component={LearningPaths} />
      <Route path="/legacy/learning-paths/:id">{() => <LearningPathDetail />}</Route>
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/profile" component={MemberProfile} />
      <ProtectedRoute path="/operations" component={OperationsConsole} />
      <ProtectedRoute path="/goodness" component={GoodnessConsole} />
      <ProtectedRoute path="/quality" component={QualityConsole} />
      <ProtectedRoute path="/management" component={ManagementConsole} />
      <ProtectedRoute path="/admin" component={AdminConsole} />
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
