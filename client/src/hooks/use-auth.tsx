import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { neonAuth } from "@/lib/neon-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: UseMutationResult<void, Error, void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const session = neonAuth.useSession();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isResolvingUser, setIsResolvingUser] = useState(false);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveUser() {
      if (!session.data?.user) {
        setAppUser(null);
        setUserError(null);
        return;
      }

      setIsResolvingUser(true);
      setUserError(null);
      try {
        const response = await apiRequest("GET", "/api/user");
        const user = (await response.json()) as User;
        if (!cancelled) {
          setAppUser(user);
          queryClient.setQueryData(["/api/user"], user);
          queryClient.setQueryData(["/api/users/me"], user);
        }
      } catch (error) {
        if (!cancelled) {
          setAppUser(null);
          setUserError(error instanceof Error ? error : new Error("Unable to load user profile"));
        }
      } finally {
        if (!cancelled) setIsResolvingUser(false);
      }
    }

    void resolveUser();
    return () => {
      cancelled = true;
    };
  }, [session.data?.user?.id]);

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const result = await neonAuth.signOut();
      if (result.error) {
        throw new Error(result.error.message || "Unable to sign out");
      }
    },
    onSuccess: () => {
      setAppUser(null);
      queryClient.clear();
      toast({ title: "Signed out", description: "Your Neon Auth session has ended." });
    },
    onError: (error) => {
      toast({ title: "Sign out failed", description: error.message, variant: "destructive" });
    },
  });

  const sessionError = session.error instanceof Error ? session.error : null;

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        isLoading: session.isPending || isResolvingUser,
        error: userError || sessionError,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
