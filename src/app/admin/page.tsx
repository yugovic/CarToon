"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut, Save, Shield, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "@/lib/types";

export default function AdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [logs, setLogs] = useState<
    { id: string; message: string; createdAt: string; status: string; cookieId?: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await fetch("/api/settings").then((r) => r.json()).catch(() => null);
      if (s?.settings) setSettings(s.settings);
      const l = await fetch("/api/logs").then((r) => r.json()).catch(() => null);
      if (l?.items) setLogs(l.items);
    })();
  }, []);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container space-y-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">管理画面（モック）</h1>
            <p className="text-slate-300">
              Google アカウントでのログインは Firebase Auth を接続してください。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/10 text-white">デモ</Badge>
            <Button variant="outline" className="border-white/20 bg-white/5 text-white">
              <Shield className="h-4 w-4" />
              Google でログイン（実装予定）
            </Button>
            <Button variant="ghost" className="text-slate-200">
              <LogOut className="h-4 w-4" />
              ログアウト
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-300" />
                生成設定
              </CardTitle>
              <CardDescription className="text-slate-200">
                プロンプト、回数上限、注意書きを編集できます（モック。Auth で保護してください）。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>プロンプトテンプレート</Label>
                <Textarea
                  value={settings?.promptTemplate ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, promptTemplate: e.target.value } : prev))
                  }
                  className="border-white/20 bg-white/5 text-white"
                  rows={4}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>1 ユーザー（日次）上限</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings?.perUserDailyQuota ?? 1}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? { ...prev, perUserDailyQuota: Number(e.target.value) || 1 }
                          : prev,
                      )
                    }
                    className="border-white/20 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>全体（生涯）上限</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings?.globalLifetimeQuota ?? 50}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? { ...prev, globalLifetimeQuota: Number(e.target.value) || 1 }
                          : prev,
                      )
                    }
                    className="border-white/20 bg-white/5 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>待機モーダル下部のメッセージ</Label>
                <Input
                  value={settings?.noticeMessage ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, noticeMessage: e.target.value } : prev))
                  }
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>
              <Button
                onClick={saveSettings}
                className="bg-sky-500 text-white hover:bg-sky-400"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                保存
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>生成ログ（最新 100 件）</CardTitle>
              <CardDescription className="text-slate-200">
                Firebase Firestore で永続化する前提の UI モックです。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.length === 0 && <p className="text-slate-200">ログがまだありません。</p>}
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.status}</span>
                      <span className="text-xs text-slate-300">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200">{log.message}</p>
                    {log.cookieId && (
                      <p className="text-xs text-slate-400">cookie: {log.cookieId}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
