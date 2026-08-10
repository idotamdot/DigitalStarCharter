import { useQuery } from "@tanstack/react-query";
import type { AuthorityStatus, CharterCapability } from "@shared/access";

export function useAuthority() {
  const query = useQuery<AuthorityStatus>({
    queryKey: ["/api/admin/status"],
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
