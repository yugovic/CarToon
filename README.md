# MiniCartoon

ミニカー写真をアップロードして、リアルから漫画調に仕上げるWebアプリ（Next.js + Gemini API）。Vercelデプロイ対応済み。

## 構成
- Next.js 15 / TypeScript / Tailwind CSS / shadcn UI
- Gemini API による画像生成
- ローカルモックストアから本番APIへ移行済み
- レート制限・ギャラリー・Like機能完備

## セットアップ
```bash
npm install
npm run dev
```
http://localhost:3000 を開いて確認できます。管理画面は http://localhost:3000/admin 。

## 環境変数設定
### Vercel（本番環境）
1. Vercelダッシュボード → Project Settings → Environment Variables
2. 以下を追加：
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### ローカル開発
`.env.local` ファイルを作成（Gitには含まれません）：
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## 主要仕様
- 単枚アップロード（jpg/png/webp, 最大 5MB）
- 1日1回/ブラウザの生成制限＋全体生涯 50 枚の上限
- Gemini APIによるリアル→漫画調画像生成
- ギャラリー：新着順、自動横スクロール、Like機能
- 1:1正方形カード、スライダーでサイズ調整（320px-480px）
- 3秒間のプレビューアニメーション

## API機能
- `/api/generate` - Gemini APIで画像生成
- `/api/gallery` - ギャラリー取得
- `/api/gallery/[id]/like` - いいね機能
- `/api/settings` - 設定管理
- `/api/logs` - ログ確認

## デプロイ
### Vercelへのデプロイ
```bash
git add .
git commit -m "Update"
git push
```
Vercelが自動でデプロイします。

## 今後の拡張
- Firebase連携での永続化
- 複数画像アップロード
- 高度な画像編集機能
- ユーザー認証機能
