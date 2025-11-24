export type GenerationStatus = "completed" | "blocked" | "failed";

export interface Generation {
  id: string;
  inputUrl: string;
  outputUrl: string;
  createdAt: string;
  promptUsed: string;
  status: GenerationStatus;
  safe: boolean;
  likes: number;
  message?: string;
}

export interface Settings {
  promptTemplate: string;
  perUserDailyQuota: number;
  globalLifetimeQuota: number;
  noticeMessage: string;
}

export interface GenerationLog {
  id: string;
  generationId?: string;
  status: GenerationStatus;
  message: string;
  createdAt: string;
  cookieId?: string;
}
