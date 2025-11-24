import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { ensureUserCookie } from "@/lib/cookies";
import { toggleLike } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = await ensureUserCookie();
  const updated = await toggleLike(id, userId);
  if (!updated) {
    return NextResponse.json({ error: "対象が見つかりませんでした。" }, { status: 404 });
  }
  return NextResponse.json({ generation: updated });
}
