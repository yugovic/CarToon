import { NextResponse } from "next/server";

import { getSettings, updateSettings } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ settings: getSettings() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "設定内容が空です。" }, { status: 400 });
  }

  // TODO: Firebase Auth（管理者）で保護する。現状はモック環境のため制限なし。
  const updated = updateSettings({
    promptTemplate: body.promptTemplate,
    perUserDailyQuota: body.perUserDailyQuota,
    globalLifetimeQuota: body.globalLifetimeQuota,
    noticeMessage: body.noticeMessage,
  });

  return NextResponse.json({ settings: updated });
}
