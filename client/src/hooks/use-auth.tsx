import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { Member } from "@shared/identity-schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { neonAuth } from "@/lib/neon-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextValue {
  member: Member | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: UseMutationResult<void, Error, void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const session = neonAuth.useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [isResolvingMember, setIsResolvingMember] = useState(false);
  const [memberError, setMemberError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveMember() {
      if (!session.data?.user) {
        setMember(null);
        setMemberError(null);
        return;
      }

      setIsResolvingMember(true);
      setMemberError(null);
      try {
        const response = await apiRequest("GET", "/api/member");
        const resolvedMember = (await response.json()) as Member;
        if (!cancelled) {
          setMember(resolvedMember);
          queryClient.setQueryData(["/api/member"], resolvedMember);
        }
      } catch (error) {
        if (!cancelled) {
          setMember(null);
          setMemberError(error instanceof Error ? error : new Error("Unable to load member profile"));
        }
      } finally {
        if (!cancelled) setIsResolvingMember(false);
      }
    }

    void resolveMember();
    return () => {
      cancelled = true;
    };
  }, [session.data?.user?.id]);

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const result = await neonAuth.signOut();
      if (result.error) throw new Error(result.error.message || "Unable to sign out");
    },
    onSuccess: () => {
      setMember(null);
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
        member,
        isLoading: session.isPending || isResolvingMember,
        error: memberError || sessionError,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
