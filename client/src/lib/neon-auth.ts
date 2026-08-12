import { createAuthClient, createInternalNeonAuth } from "@neondatabase/neon-js/auth";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

export const isNeonAuthConfigured = Boolean(authUrl);

export const neonAuth = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null;

const internalNeonAuth = authUrl
  ? createInternalNeonAuth(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null;

export async function getNeonJwt(): Promise<string | null> {
  if (!internalNeonAuth) return null;
  return await internalNeonAuth.getJWTToken();
}
