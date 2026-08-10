import { useQuery } from "@tanstack/react-query";

export interface AuthorityStatus {
  isAdmin: boolean;
  email: string | null;
  domains: string[];
  capabilities: string[];
}

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
    can: (capability: string) => Boolean(query.data?.capabilities.includes(capability)),
  };
}
