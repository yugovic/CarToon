import { nanoid } from "nanoid";

import { seedGallery } from "@/data/seed";
import { makePlaceholderImage } from "@/lib/svg-placeholder";
import { Generation, GenerationLog, Settings } from "@/lib/types";

type RateRecord = {
  dateKey: string;
  count: number;
  lifetime: number;
};

type Store = {
  settings: Settings;
  gallery: Generation[];
  logs: GenerationLog[];
  stats: {
    total: number;
    perUser: Record<string, RateRecord>;
    likesByUser: Record<string, Set<string>>;
  };
};

const defaultSettings: Settings = {
  promptTemplate:
    "Take the uploaded miniature car photo, cleanly cut out the car, render it in hyper-realistic detail, then stylize into manga/anime with crisp lines and subtle halftones. Preserve lighting and reflections.",
  perUserDailyQuota: 1,
  globalLifetimeQuota: 50,
  noticeMessage: "生成コンテンツは全ユーザーに公開されます。",
};

declare global {
  var __toycarStore: Store | undefined;
}

function buildStore(): Store {
  const seeded = seedGallery();
  return {
    settings: { ...defaultSettings },
    gallery: seeded,
    logs: [],
    stats: {
      total: seeded.length,
      perUser: {},
      likesByUser: {},
    },
  };
}

export function getStore(): Store {
  if (!globalThis.__toycarStore) {
    globalThis.__toycarStore = buildStore();
  }
  return globalThis.__toycarStore;
}

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function checkRateLimit(userId: string, now = new Date()) {
  const store = getStore();
  if (store.stats.total >= store.settings.globalLifetimeQuota) {
    return {
      ok: false,
      reason: "全体の生成上限（50件）に達しました。管理画面で上限を調整してください。",
    };
  }

  const today = getTodayKey(now);
  const record =
    store.stats.perUser[userId] ??
    {
      dateKey: today,
      count: 0,
      lifetime: 0,
    };

  if (record.dateKey === today && record.count >= store.settings.perUserDailyQuota) {
    return { ok: false, reason: "本日はこれ以上生成できません（1日1回）。" };
  }

  return { ok: true };
}

export function registerGeneration({
  userId,
  inputUrl,
  prompt,
  message,
}: {
  userId: string;
  inputUrl: string;
  prompt?: string;
  message?: string;
}): Generation {
  const store = getStore();
  const now = new Date();
  const today = getTodayKey(now);
  const record =
    store.stats.perUser[userId] ??
    ({
      dateKey: today,
      count: 0,
      lifetime: 0,
    } satisfies RateRecord);

  const promptUsed = prompt || store.settings.promptTemplate;
  const outputUrl =
    inputUrl ||
    makePlaceholderImage("Manga Render", "Gemini output mock", store.gallery.length);

  const generation: Generation = {
    id: nanoid(),
    inputUrl,
    outputUrl,
    createdAt: now.toISOString(),
    promptUsed,
    status: "completed",
    safe: true,
    likes: 0,
    message,
  };

  store.gallery.unshift(generation);
  store.stats.total += 1;
  const updated: RateRecord = {
    dateKey: today,
    count: record.dateKey === today ? record.count + 1 : 1,
    lifetime: record.lifetime + 1,
  };
  store.stats.perUser[userId] = updated;

  store.logs.unshift({
    id: nanoid(),
    generationId: generation.id,
    status: "completed",
    message: "Generated (mock) via local store. Wire to Firebase Functions for real calls.",
    createdAt: now.toISOString(),
    cookieId: userId,
  });

  return generation;
}

export function toggleLike(generationId: string, userId: string) {
  const store = getStore();
  const item = store.gallery.find((g) => g.id === generationId);
  if (!item) return undefined;

  const liked = store.stats.likesByUser[userId] ?? new Set<string>();
  const already = liked.has(generationId);
  if (already) {
    liked.delete(generationId);
    item.likes = Math.max(0, item.likes - 1);
  } else {
    liked.add(generationId);
    item.likes += 1;
  }
  store.stats.likesByUser[userId] = liked;
  return item;
}

export function getGallery(limit = 60) {
  const store = getStore();
  return store.gallery.slice(0, limit);
}

export function getLogs(limit = 100) {
  const store = getStore();
  return store.logs.slice(0, limit);
}

export function getSettings() {
  return getStore().settings;
}

export function updateSettings(partial: Partial<Settings>) {
  const store = getStore();
  store.settings = {
    ...store.settings,
    ...partial,
    perUserDailyQuota: Math.max(1, partial.perUserDailyQuota ?? store.settings.perUserDailyQuota),
    globalLifetimeQuota: Math.max(
      1,
      partial.globalLifetimeQuota ?? store.settings.globalLifetimeQuota,
    ),
  };
  return store.settings;
}
