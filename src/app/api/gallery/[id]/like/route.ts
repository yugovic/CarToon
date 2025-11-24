import { NextResponse } from "next/server";

import { ensureUserCookie } from "@/lib/cookies";
import { toggleLike } from "@/lib/store";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const userId = ensureUserCookie();
  const updated = toggleLike(params.id, userId);
  if (!updated) {
    return NextResponse.json({ error: "対象が見つかりませんでした。" }, { status: 404 });
  }
  return NextResponse.json({ generation: updated });
}
