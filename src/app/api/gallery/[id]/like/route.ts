import { NextResponse } from "next/server";

import { ensureUserCookie } from "@/lib/cookies";
import { toggleLike } from "@/lib/storage";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await ensureUserCookie();
  const updated = await toggleLike(id, userId);
  if (!updated) {
    return NextResponse.json({ error: "対象が見つかりませんでした。" }, { status: 404 });
  }
  return NextResponse.json({ generation: updated });
}
