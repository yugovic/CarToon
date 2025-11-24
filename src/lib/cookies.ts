import { cookies } from "next/headers";
import { nanoid } from "nanoid";

import { COOKIE_USER_ID } from "@/lib/constants";

export function ensureUserCookie(): string {
  const store = cookies();
  const existing = store.get(COOKIE_USER_ID)?.value;
  if (existing) return existing;

  const newId = `toy-${nanoid(12)}`;
  store.set(COOKIE_USER_ID, newId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return newId;
}
