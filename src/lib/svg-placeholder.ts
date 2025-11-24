const palette = [
  "#6bc8ff",
  "#ff76ad",
  "#ffc857",
  "#7af0c4",
  "#b3a5ff",
] as const;

export function makePlaceholderImage(title: string, subtitle: string, index = 0) {
  const color = palette[index % palette.length];
  const accent = palette[(index + 2) % palette.length];
  const svg = `
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0.8"/>
        </linearGradient>
        <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="#0b0c10"/>
      <rect x="30" y="30" width="1140" height="740" rx="40" fill="url(#g1)" />
      <circle cx="200" cy="620" r="220" fill="url(#g2)" opacity="0.75"/>
      <circle cx="960" cy="200" r="220" fill="url(#g2)" opacity="0.55"/>
      <text x="100" y="210" fill="#eaf2ff" font-family="Inter, 'Helvetica Neue', Arial" font-size="58" font-weight="700">${title}</text>
      <text x="100" y="280" fill="#fdfdfd" font-family="Inter, 'Helvetica Neue', Arial" font-size="34" font-weight="500">${subtitle}</text>
      <rect x="160" y="360" width="880" height="280" rx="44" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
      <text x="200" y="470" fill="#f8fafc" font-family="Inter, 'Helvetica Neue', Arial" font-size="32" font-weight="600">Gemini-driven render (placeholder)</text>
      <text x="200" y="520" fill="#d6e3ff" font-family="Inter, 'Helvetica Neue', Arial" font-size="22" font-weight="500">Realistic → Manga pipeline sample</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
