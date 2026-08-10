import { createInternalNeonAuth } from "@neondatabase/neon-js/auth";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  throw new Error("VITE_NEON_AUTH_URL must be set for Neon Auth");
}

const internalNeonAuth = createInternalNeonAuth(authUrl, {
  adapter: BetterAuthReactAdapter(),
});

export const neonAuth = internalNeonAuth.adapter;

export async function getNeonJwt(): Promise<string | null> {
  return await internalNeonAuth.getJWTToken();
}
