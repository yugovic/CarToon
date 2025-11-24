import { NextResponse } from "next/server";

import { ensureUserCookie } from "@/lib/cookies";
import { checkRateLimit, registerGeneration } from "@/lib/store";
import { generateImageWithGemini } from "@/lib/gemini";

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

  try {
    // Gemini APIで画像生成
    const prompt = body.promptOverride || "Take the uploaded miniature car photo, cleanly cut out the car, render it in hyper-realistic detail, then stylize into manga/anime with crisp lines and subtle halftones. Preserve lighting and reflections.";
    const outputUrl = await generateImageWithGemini(body.image, prompt);

    const generation = registerGeneration({
      userId,
      inputUrl: body.image,
      prompt: body.promptOverride,
      message: body.message,
    });

    // 生成された画像URLで更新
    generation.outputUrl = outputUrl;

    return NextResponse.json({
      generation,
      message: "画像が正常に生成されました。",
    });
  } catch (error) {
    console.error('Generation error:', error);
    
    // エラー時はモック生成にフォールバック
    const generation = registerGeneration({
      userId,
      inputUrl: body.image,
      prompt: body.promptOverride,
      message: body.message,
    });

    return NextResponse.json({
      generation,
      message: "エラーが発生したため、モック画像を生成しました。",
    });
  }
}
