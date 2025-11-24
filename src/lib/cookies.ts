import { cookies } from "next/headers";
import { nanoid } from "nanoid";

import { COOKIE_USER_ID } from "@/lib/constants";

export async function ensureUserCookie(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_USER_ID)?.value;
  if (existing) return existing;

  const newId = `toy-${nanoid(12)}`;
  cookieStore.set(COOKIE_USER_ID, newId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return newId;
}
