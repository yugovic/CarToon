export async function generateImageWithGemini(
  base64Image: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEYが設定されていません');
  }

  // Gemini APIのエンドポイント（Vision Proモデル）
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey;
  
  const requestBody = {
    contents: [{
      parts: [
        {
          text: prompt,
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
    const response = await fetch(url, {
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
    
    // 生成された画像を取得（Geminiはテキスト生成なので、ここではモック画像URLを返す）
    // 実際の画像生成には別のAPIが必要なため、一旦生成されたテキストを含むレスポンスを返す
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '画像生成に成功しました';
    
    // 生成結果をベース64エンコードされたプレースホルダー画像として返す
    // 実際の実装では、生成された画像を保存してURLを返す必要があります
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
