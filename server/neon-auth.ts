import { constants, createPublicKey, verify, type JsonWebKey } from "node:crypto";

interface NeonJwtPayload {
  sub: string;
  email?: string;
  name?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
}

type JsonWebKeyWithKid = JsonWebKey & { kid?: string };

interface JwksResponse {
  keys: JsonWebKeyWithKid[];
}

let cachedJwks: { expiresAt: number; keys: JsonWebKeyWithKid[] } | null = null;

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function normalizedAuthUrl(): string | null {
  const value = process.env.AUTH_URL?.trim();
  return value ? value.replace(/\/$/, "") : null;
}

async function getJwks(): Promise<JsonWebKeyWithKid[]> {
  if (cachedJwks && cachedJwks.expiresAt > Date.now()) return cachedJwks.keys;

  const jwksUrl = process.env.JWKS_URL?.trim();
  if (!jwksUrl) throw new Error("JWKS_URL must be set for Neon Auth verification");

  const response = await fetch(jwksUrl, { redirect: "error" });
  if (!response.ok) throw new Error(`Unable to load Neon Auth JWKS (${response.status})`);

  const body = (await response.json()) as JwksResponse;
  if (!Array.isArray(body.keys) || body.keys.length === 0) throw new Error("Neon Auth JWKS contains no signing keys");

  cachedJwks = { keys: body.keys, expiresAt: Date.now() + 5 * 60_000 };
  return body.keys;
}

function verifySignature(algorithm: string, signed: Buffer, signature: Buffer, jwk: JsonWebKeyWithKid): boolean {
  const publicKey = createPublicKey({ key: jwk, format: "jwk" });

  if (algorithm === "EdDSA") return verify(null, signed, publicKey, signature);
  if (algorithm === "RS256") return verify("RSA-SHA256", signed, publicKey, signature);
  if (algorithm === "PS256") {
    return verify("RSA-SHA256", signed, {
      key: publicKey,
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    }, signature);
  }
  if (algorithm === "ES256") {
    return verify("sha256", signed, { key: publicKey, dsaEncoding: "ieee-p1363" }, signature);
  }

  throw new Error(`Unsupported JWT signing algorithm: ${algorithm}`);
}

function validateClaims(payload: NeonJwtPayload) {
  const now = Math.floor(Date.now() / 1000);
  if (!payload.sub) throw new Error("JWT subject missing");
  if (payload.exp && payload.exp <= now) throw new Error("JWT expired");
  if (payload.nbf && payload.nbf > now) throw new Error("JWT not active yet");

  const expected = normalizedAuthUrl();
  if (!expected) throw new Error("AUTH_URL must be set for Neon Auth verification");

  const issuer = payload.iss?.replace(/\/$/, "");
  if (issuer !== expected) throw new Error("JWT issuer does not match AUTH_URL");

  const audiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
  if (!audiences.map((audience) => audience.replace(/\/$/, "")).includes(expected)) {
    throw new Error("JWT audience does not match AUTH_URL");
  }
}

function decodeJson<T>(segment: string): T {
  return JSON.parse(decodeBase64Url(segment).toString("utf8")) as T;
}

export async function verifyNeonJwt(token: string): Promise<NeonJwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson<{ alg?: string; kid?: string }>(encodedHeader);
  if (!header.alg) throw new Error("JWT signing algorithm missing");

  let keys = await getJwks();
  let key = header.kid ? keys.find((candidate) => candidate.kid === header.kid) : keys[0];
  if (!key && header.kid) {
    cachedJwks = null;
    keys = await getJwks();
    key = keys.find((candidate) => candidate.kid === header.kid);
  }
  if (!key) throw new Error("JWT signing key not found");

  const signed = Buffer.from(`${encodedHeader}.${encodedPayload}`);
  const signature = decodeBase64Url(encodedSignature);
  if (!verifySignature(header.alg, signed, signature, key)) throw new Error("JWT signature verification failed");

  const payload = decodeJson<NeonJwtPayload>(encodedPayload);
  validateClaims(payload);
  return payload;
}
