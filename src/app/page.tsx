"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Heart, Loader2, Sparkles, Upload, Wand2 } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_MB } from "@/lib/constants";
import { Generation } from "@/lib/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardSize, setCardSize] = useState(320); // 320px, 400px, 480px の範囲
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [isPreviewHiding, setIsPreviewHiding] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshGallery();
  }, []);

  async function refreshGallery() {
    try {
      const res = await fetch("/api/gallery", { cache: "no-cache" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: Generation[] };
      setGallery(data.items ?? []);
    } catch {
      // ignore
    }
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(nextFile.type)) {
      setError("画像形式は jpg / png / webp のいずれかにしてください。");
      return;
    }

    if (nextFile.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`ファイルサイズは ${MAX_UPLOAD_MB}MB 以下にしてください。`);
      return;
    }

    const url = URL.createObjectURL(nextFile);
    setPreview(url);
    setFile(nextFile);
    setError(null);
    
    // アップロードプレビューを表示
    setShowUploadPreview(true);
    setIsPreviewHiding(false);
    
    // 2.5秒後にフェードアウト開始
    setTimeout(() => {
      setIsPreviewHiding(true);
    }, 2500);
    
    // 3.5秒後にプレビューを非表示
    setTimeout(() => {
      setShowUploadPreview(false);
      setIsPreviewHiding(false);
    }, 3500);
  }

  async function fileToDataUrl(target: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(target);
    });
  }

  async function runGeneration() {
    if (!file) {
      setError("画像を選択してください。");
      return;
    }

    setModalOpen(true);
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const base64 = await fileToDataUrl(file);
      await new Promise((r) => setTimeout(r, 300)); // モーダル表示を滑らかに

      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          image: base64,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "生成に失敗しました。");
      }

      const data = (await res.json()) as { generation: Generation };
      setResult(data.generation);
      await refreshGallery();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
      setTimeout(() => setModalOpen(false), 600);
    }
  }

  async function toggleLike(id: string) {
    try {
      const res = await fetch(`/api/gallery/${id}/like`, { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as { generation: Generation };
      setGallery((prev) =>
        prev.map((g) => (g.id === data.generation.id ? data.generation : g)),
      );
    } catch {
      // ignore
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(125,196,255,0.18),_transparent_26%),radial-gradient(circle_at_80%_10%,_rgba(255,220,120,0.14),_transparent_24%)]" />
      <section className="relative z-10 container flex flex-col gap-8 pb-14 pt-12">
        <header className="space-y-3 max-w-4xl">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Mini CarTOON
          </h1>
          <p className="text-slate-600">
            明るい画面でかんたんアップロード。お気に入りのミニカーを楽しく変身させよう。
          </p>
        </header>

        <Card className="border-slate-200 bg-white/90 shadow-lg shadow-slate-200/60">
          <CardContent className="space-y-4 p-5" ref={previewContainerRef}>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center">
              <div className="flex-1 relative">
                <input
                  id="file"
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={onFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
                  {file ? `📎 ${file.name}` : "画像をえらぶか、ここにドロップしてね"}
                </div>
              </div>
              {preview ? (
                <div className="group relative">
                  <div 
                    className="relative w-12 h-12 overflow-hidden rounded-xl border border-slate-200 flex-shrink-0 cursor-pointer bg-white shadow-sm"
                    onClick={() => setPreviewModalOpen(true)}
                  >
                    <Image
                      src={preview}
                      alt="preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="relative w-48 h-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                      <Image
                        src={preview}
                        alt="preview large"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 text-white text-xs p-2">
                        {file?.name} • {file ? `${(file.size / 1024 / 1024).toFixed(1)}MB` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl border border-dashed border-slate-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Upload className="h-5 w-5 text-slate-400" />
                </div>
              )}
              <Button
                className="h-11 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600"
                onClick={runGeneration}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "GO"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-rose-600" role="alert">
                {error}
              </p>
            )}
            {result && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-sm text-emerald-700">
                新しい画像をギャラリーに追加しました。
              </div>
            )}
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">ギャラリー</h2>
              <Badge className="bg-slate-100 text-slate-700">新着が自動で流れます</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 min-w-[40px]">Size</span>
              <input
                type="range"
                min="320"
                max="480"
                step="40"
                value={cardSize}
                onChange={(e) => setCardSize(Number(e.target.value))}
                className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
          <GalleryStrip
            items={gallery}
            onLike={toggleLike}
            cardSize={cardSize}
          />
        </section>
      </section>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-slate-900" />
              生成中...
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              モーダルを閉じてもバックグラウンドで進みます。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
            生成しています…
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="bg-white text-slate-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle>アップロードした画像</DialogTitle>
            <DialogDescription className="text-slate-600">
              {file?.name} • {file ? `${(file.size / 1024 / 1024).toFixed(1)}MB` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <Image
              src={preview || ''}
              alt="preview full"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* アップロードプレビューオーバーレイ */}
      {showUploadPreview && preview && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-white/90 transition-opacity duration-500 ${
            isPreviewHiding ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className={`relative w-[80vw] h-[80vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-500 ${
              isPreviewHiding ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <Image
              src={preview}
              alt="upload preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </main>
  );
}

function GalleryStrip({
  items,
  onLike,
  cardSize,
}: {
  items: Generation[];
  onLike: (id: string) => void;
  cardSize: number;
}) {
  const duplicated = useMemo(() => [...items, ...items], [items]);
  const rows = [duplicated, duplicated];

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
        まだ生成画像がありません。最初の 1 枚を作ってみましょう。
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
      <div className="flex flex-col gap-2 py-2">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex w-max gap-2 animate-marquee group-hover:[animation-play-state:paused]"
            style={{ ["--marquee-duration" as string]: "18s" }}
          >
            {row.map((item, idx) => (
              <GalleryCard
                key={`${item.id}-${rowIdx}-${idx}`}
                item={item}
                onLike={onLike}
                cardSize={cardSize}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryCard({
  item,
  onLike,
  cardSize,
}: {
  item: Generation;
  onLike: (id: string) => void;
  cardSize: number;
}) {
  const height = cardSize; // 1:1 アスペクト比

  return (
    <div 
      className="relative flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 transition"
      style={{ width: `${cardSize}px`, height: `${height}px` }}
    >
      <div className="relative flex-1 w-full overflow-hidden">
        <Image src={item.outputUrl} alt={item.promptUsed} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/60" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-3 text-sm text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-200" />
            <span className="line-clamp-1">{item.promptUsed}</span>
          </div>
          <button
            onClick={() => onLike(item.id)}
            className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/30"
          >
            <Heart className="h-3.5 w-3.5" />
            {item.likes}
          </button>
        </div>
      </div>
    </div>
  );
}
