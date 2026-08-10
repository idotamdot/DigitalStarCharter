import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { AuthorityStatus, CharterCapability } from "@shared/access";

export function useAuthority() {
  const { member } = useAuth();
  const query = useQuery<AuthorityStatus>({
    queryKey: ["/api/admin/status"],
    enabled: Boolean(member),
    retry: false,
  });

  return {
    ...query,
    isAdmin: query.data?.isAdmin ?? false,
    domains: query.data?.domains ?? [],
    capabilities: query.data?.capabilities ?? [],
    can: (capability: CharterCapability) => Boolean(query.data?.capabilities.includes(capability)),
  };
}
