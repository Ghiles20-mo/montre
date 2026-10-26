import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "./supabase";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const SETTING_KEY = "admin_password_hash";

async function hash(password: string) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function verifyHash(password: string, stored: string) {
  const [, saltHex, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(derived, expected);
}

const sha = (s: string) => createHash("sha256").update(s).digest();

// Mot de passe en base s'il a été changé dans Réglages, sinon ADMIN_PASSWORD (mot de passe de départ).
export async function verifyAdminPassword(password: string) {
  const { data } = await db().from("app_settings").select("value").eq("key", SETTING_KEY).maybeSingle();
  if (data?.value) return verifyHash(password, data.value);
  const initial = process.env.ADMIN_PASSWORD;
  return !!initial && timingSafeEqual(sha(password), sha(initial));
}

export async function setAdminPassword(password: string) {
  const { error } = await db()
    .from("app_settings")
    .upsert({ key: SETTING_KEY, value: await hash(password) });
  if (error) throw new Error(error.message);
}
