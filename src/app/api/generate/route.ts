import { NextResponse } from "next/server";

import { ensureUserCookie } from "@/lib/cookies";
import { generateImageWithGemini } from "@/lib/gemini";
import { 
  saveGeneration, 
  updateGenerationOutput,
  checkRateLimit, 
  updateUserGenerationCount,
  getSettings
} from "@/lib/storage";

export async function POST(request: Request) {
  const startTime = Date.now();
  const body = await request.json().catch(() => null);
  
  if (!body?.image) {
    return NextResponse.json({ error: "画像が見つかりませんでした。" }, { status: 400 });
  }

  try {
    const userId = await ensureUserCookie();
    const rate = await checkRateLimit(userId);
    
    if (!rate.ok) {
      return NextResponse.json({ error: rate.reason }, { status: 429 });
    }

    const settings = getSettings();
    const prompt = body.promptOverride || settings.promptTemplate;
    
    // 生成データを保存
    const generation = await saveGeneration({
      userId,
      inputUrl: body.image,
      prompt: body.promptOverride,
      message: body.message
    });

    try {
      // Gemini APIで画像生成
      const outputUrl = await generateImageWithGemini(body.image, prompt, userId);
      
      // 生成完了を更新
      const updatedGeneration = await updateGenerationOutput(generation.id, outputUrl, 'completed');
      
      if (!updatedGeneration) {
        throw new Error('生成データの更新に失敗しました');
      }

      // ユーザーの生成回数を更新
      await updateUserGenerationCount(userId);

      console.log(`Generation completed in ${Date.now() - startTime}ms`);

      return NextResponse.json({
        generation: updatedGeneration,
        message: "画像が正常に生成されました。",
      });

    } catch (error) {
      console.error('Generation error:', error);
      
      // エラーを更新
      await updateGenerationOutput(generation.id, '', 'error');

      return NextResponse.json({
        generation: {
          ...generation,
          status: 'error' as const
        },
        error: "画像生成に失敗しました。",
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: "サーバーエラーが発生しました。" 
    }, { status: 500 });
  }
}
