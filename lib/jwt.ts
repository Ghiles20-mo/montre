// Utilisable dans le middleware (edge) : pas d'import de next/headers ici.
import { SignJWT, jwtVerify } from "jose";

export type Session = { role: "admin" | "employee"; sub: string; name: string };

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 h

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum)");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (payload.role !== "admin" && payload.role !== "employee") return null;
    return { role: payload.role, sub: String(payload.sub), name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
