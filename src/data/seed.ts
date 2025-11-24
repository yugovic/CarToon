import { nanoid } from "nanoid";

import { Generation } from "@/lib/types";
import { makePlaceholderImage } from "@/lib/svg-placeholder";

const sampleTitles = [
  ["Neo Turbo Coupe", "Chrome-heavy realism bleeding into manga ink"],
  ["Desert Rally Mini", "Dust trails with cel-shaded highlights"],
  ["Night Runner", "Neon reflections and comic halftones"],
  ["Vintage Skyline", "Film grain realism to bold line art"],
];

export function seedGallery(): Generation[] {
  return sampleTitles.map(([title, subtitle], index) => {
    const url = makePlaceholderImage(title, subtitle, index);
    return {
      id: nanoid(),
      inputUrl: url,
      outputUrl: url,
      createdAt: new Date(Date.now() - (index + 1) * 3600 * 1000).toISOString(),
      promptUsed: subtitle,
      status: "completed",
      safe: true,
      likes: Math.floor(Math.random() * 20),
      message: "サンプル生成（モック）。実際は Functions 経由で Gemini を呼び出します。",
    };
  });
}
