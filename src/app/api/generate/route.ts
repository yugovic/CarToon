import { NextResponse } from "next/server";

import { ensureUserCookie } from "@/lib/cookies";
import { checkRateLimit, registerGeneration } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.image) {
    return NextResponse.json({ error: "画像が見つかりませんでした。" }, { status: 400 });
  }

  const userId = await ensureUserCookie();
  const rate = checkRateLimit(userId);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.reason }, { status: 429 });
  }

  const generation = registerGeneration({
    userId,
    inputUrl: body.image,
    prompt: body.promptOverride,
    message: body.message,
  });

  return NextResponse.json({
    generation,
    message: "モック生成。実運用では Firebase Functions から Gemini を呼び出してください。",
  });
}
