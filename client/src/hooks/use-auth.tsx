import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { neonAuth, getNeonJwt } from "@/lib/neon-auth";
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
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeError, setBridgeError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bridgeSession() {
      if (!session.data?.user) {
        setAppUser(null);
        setBridgeError(null);
        return;
      }

      setIsBridging(true);
      setBridgeError(null);

      try {
        const token = await getNeonJwt();
        if (!token) {
          throw new Error("Neon Auth did not provide a JWT for this session");
        }

        const response = await fetch("/api/auth/neon/session", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(body?.message || "Unable to establish application session");
        }

        const user = (await response.json()) as User;
        if (!cancelled) {
          setAppUser(user);
          queryClient.setQueryData(["/api/user"], user);
          queryClient.setQueryData(["/api/users/me"], user);
        }
      } catch (error) {
        if (!cancelled) {
          setAppUser(null);
          setBridgeError(error instanceof Error ? error : new Error("Authentication bridge failed"));
        }
      } finally {
        if (!cancelled) {
          setIsBridging(false);
        }
      }
    }

    void bridgeSession();

    return () => {
      cancelled = true;
    };
  }, [session.data?.user?.id]);

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await neonAuth.signOut();
      try {
        await apiRequest("POST", "/api/logout");
      } catch {
        // Neon is authoritative; a missing legacy session does not block logout.
      }
    },
    onSuccess: () => {
      setAppUser(null);
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "Your session has ended.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sessionError = session.error instanceof Error ? session.error : null;

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        isLoading: session.isPending || isBridging,
        error: bridgeError || sessionError,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
