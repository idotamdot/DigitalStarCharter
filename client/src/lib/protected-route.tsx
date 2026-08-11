import type { ComponentType } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType;
}) {
  const { member, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!member) {
          const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
          return <Redirect to={`/auth?returnTo=${returnTo}`} />;
        }

        return <Component />;
      }}
    </Route>
  );
}
