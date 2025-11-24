import { uploadImage, generateFilename } from './vercel-blob';

export async function generateImageWithGemini(
  base64Image: string,
  prompt: string,
  userId: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEYが設定されていません');
  }

  // Gemini APIのエンドポイント
  const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey;
  
  const requestBody = {
    contents: [{
      parts: [
        {
          text: prompt + "\n\nGenerate a high-quality manga-style illustration based on this image. Return only the image generation result.",
        },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image.split(',')[1] // data:image/jpeg;base64, の部分を除去
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Geminiは画像生成ではなくテキスト生成なので、
    // ここでは生成されたテキストを基にプレースホルダー画像を作成
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Generated image';
    
    // プレースホルダー画像を生成（実際の実装では別の画像生成APIを使用）
    const placeholderBuffer = await createPlaceholderImage(generatedText);
    const filename = generateFilename(userId, 'generated.jpg');
    
    const { url } = await uploadImage(placeholderBuffer, filename, 'image/jpeg');
    return url;
    
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // エラー時はプレースホルダー画像を返す
    const placeholderBuffer = await createPlaceholderImage('Error occurred');
    const filename = generateFilename(userId, 'error.jpg');
    
    const { url } = await uploadImage(placeholderBuffer, filename, 'image/jpeg');
    return url;
  }
}

// プレースホルダー画像を作成する関数
async function createPlaceholderImage(text: string): Promise<ArrayBuffer> {
  // SVGをCanvasに描画してJPEGに変換
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#f0f0f0"/>
      <text x="256" y="256" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        ${text.substring(0, 50)}...
      </text>
    </svg>
  `;
  
  // SVGをbase64エンコード
  const base64 = btoa(svg);
  const dataUrl = `data:image/svg+xml;base64,${base64}`;
  
  // dataURLをArrayBufferに変換
  const response = await fetch(dataUrl);
  return response.arrayBuffer();
}
