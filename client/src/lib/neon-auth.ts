import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  throw new Error("VITE_NEON_AUTH_URL must be set for Neon Auth");
}

export const neonAuth = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});

export async function getNeonJwt(): Promise<string | null> {
  const tokenGetter = neonAuth.getJWTToken;
  if (!tokenGetter) {
    return null;
  }

  return (await tokenGetter()) ?? null;
}
