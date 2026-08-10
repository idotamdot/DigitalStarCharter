import { createPublicKey, verify } from "node:crypto";

interface NeonJwtPayload {
  sub: string;
  email?: string;
  name?: string;
  exp?: number;
  nbf?: number;
  iss?: string;
}

interface JsonWebKeyWithKid extends JsonWebKey {
  kid?: string;
}

interface JwksResponse {
  keys: JsonWebKeyWithKid[];
}

let cachedJwks: { expiresAt: number; keys: JsonWebKeyWithKid[] } | null = null;

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

async function getJwks(): Promise<JsonWebKeyWithKid[]> {
  if (cachedJwks && cachedJwks.expiresAt > Date.now()) {
    return cachedJwks.keys;
  }

  const jwksUrl = process.env.JWKS_URL;
  if (!jwksUrl) {
    throw new Error("JWKS_URL must be set for Neon Auth verification");
  }

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Unable to load Neon Auth JWKS (${response.status})`);
  }

  const body = (await response.json()) as JwksResponse;
  cachedJwks = {
    keys: body.keys,
    expiresAt: Date.now() + 5 * 60_000,
  };
  return body.keys;
}

export async function verifyNeonJwt(token: string): Promise<NeonJwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const header = JSON.parse(decodeBase64Url(parts[0]).toString("utf8")) as {
    alg?: string;
    kid?: string;
  };
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported JWT signing algorithm");
  }

  const keys = await getJwks();
  const jwk = keys.find((candidate) => candidate.kid === header.kid);
  if (!jwk) {
    cachedJwks = null;
    const refreshedKeys = await getJwks();
    const refreshed = refreshedKeys.find((candidate) => candidate.kid === header.kid);
    if (!refreshed) {
      throw new Error("JWT signing key not found");
    }
    return verifyWithKey(parts, refreshed);
  }

  return verifyWithKey(parts, jwk);
}

function verifyWithKey(parts: string[], jwk: JsonWebKeyWithKid): NeonJwtPayload {
  const publicKey = createPublicKey({ key: jwk, format: "jwk" });
  const signed = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = decodeBase64Url(parts[2]);
  const valid = verify("RSA-SHA256", signed, publicKey, signature);
  if (!valid) {
    throw new Error("Invalid JWT signature");
  }

  const payload = JSON.parse(decodeBase64Url(parts[1]).toString("utf8")) as NeonJwtPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp <= now) {
    throw new Error("JWT expired");
  }
  if (payload.nbf && payload.nbf > now) {
    throw new Error("JWT not active yet");
  }
  if (!payload.sub) {
    throw new Error("JWT subject missing");
  }

  return payload;
}
