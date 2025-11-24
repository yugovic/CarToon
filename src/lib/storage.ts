import { nanoid } from 'nanoid';
import { uploadImage, generateFilename } from './vercel-blob';

// 簡易的なインメモリストア（本番ではVercel KVやDB推奨）
type Generation = {
  id: string;
  userId: string;
  inputUrl: string;
  outputUrl: string;
  promptUsed: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  safe: boolean;
  likes: number;
  createdAt: string;
  message?: string;
};

type User = {
  id: string;
  dailyCount: number;
  lastGenerationDate: string;
  totalGenerations: number;
  likedGenerations: string[];
};

type Settings = {
  promptTemplate: string;
  perUserDailyQuota: number;
  globalLifetimeQuota: number;
  noticeMessage: string;
};

// 簡易ストア（本番ではDBに置き換え）
const store = {
  generations: [] as Generation[],
  users: new Map<string, User>(),
  settings: {
    promptTemplate: "Take the uploaded miniature car photo, cleanly cut out the car, render it in hyper-realistic detail, then stylize into manga/anime with crisp lines and subtle halftones. Preserve lighting and reflections.",
    perUserDailyQuota: 1,
    globalLifetimeQuota: 50,
    noticeMessage: "生成コンテンツは全ユーザーに公開されます。",
  } as Settings,
};

export async function saveGeneration(data: {
  userId: string;
  inputUrl: string;
  prompt?: string;
  message?: string;
}): Promise<Generation> {
  const id = nanoid();
  const now = new Date().toISOString();
  
  const generation: Generation = {
    id,
    userId: data.userId,
    inputUrl: data.inputUrl,
    outputUrl: '', // 後で更新
    promptUsed: data.prompt || store.settings.promptTemplate,
    status: 'processing',
    safe: false,
    likes: 0,
    createdAt: now,
    message: data.message
  };
  
  store.generations.unshift(generation);
  return generation;
}

export async function updateGenerationOutput(
  id: string, 
  outputUrl: string, 
  status: 'completed' | 'error' = 'completed'
): Promise<Generation | null> {
  const generation = store.generations.find(g => g.id === id);
  if (!generation) return null;
  
  generation.outputUrl = outputUrl;
  generation.status = status;
  generation.safe = status === 'completed';
  
  return generation;
}

export async function getGallery(limit = 60): Promise<Generation[]> {
  return store.generations
    .filter(g => g.status === 'completed' && g.safe)
    .slice(0, limit);
}

export async function toggleLike(generationId: string, userId: string): Promise<Generation | null> {
  const generation = store.generations.find(g => g.id === generationId);
  if (!generation) return null;
  
  let user = store.users.get(userId);
  if (!user) {
    user = {
      id: userId,
      dailyCount: 0,
      lastGenerationDate: '',
      totalGenerations: 0,
      likedGenerations: []
    };
    store.users.set(userId, user);
  }
  
  const alreadyLiked = user.likedGenerations.includes(generationId);
  
  if (alreadyLiked) {
    generation.likes = Math.max(0, generation.likes - 1);
    user.likedGenerations = user.likedGenerations.filter(id => id !== generationId);
  } else {
    generation.likes += 1;
    user.likedGenerations.push(generationId);
  }
  
  return generation;
}

export async function checkRateLimit(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const user = store.users.get(userId);
  const today = new Date().toISOString().slice(0, 10);
  
  // 全体上限チェック
  if (store.generations.length >= store.settings.globalLifetimeQuota) {
    return { ok: false, reason: `全体の生成上限（${store.settings.globalLifetimeQuota}件）に達しました。` };
  }
  
  // ユーザー日次上限チェック
  if (user && user.lastGenerationDate === today && user.dailyCount >= store.settings.perUserDailyQuota) {
    return { ok: false, reason: `本日はこれ以上生成できません（1日${store.settings.perUserDailyQuota}回）。` };
  }
  
  return { ok: true };
}

export async function updateUserGenerationCount(userId: string): Promise<void> {
  const user = store.users.get(userId);
  const today = new Date().toISOString().slice(0, 10);
  
  if (user) {
    user.dailyCount = user.lastGenerationDate === today ? user.dailyCount + 1 : 1;
    user.lastGenerationDate = today;
    user.totalGenerations += 1;
  } else {
    store.users.set(userId, {
      id: userId,
      dailyCount: 1,
      lastGenerationDate: today,
      totalGenerations: 1,
      likedGenerations: []
    });
  }
}

export function getSettings(): Settings {
  return store.settings;
}

export function updateSettings(updates: Partial<Settings>): Settings {
  store.settings = { ...store.settings, ...updates };
  return store.settings;
}
