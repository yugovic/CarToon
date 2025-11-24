# MiniCartoon

ミニカー写真をアップロードして、リアルから漫画調に仕上げるデモ UI（Next.js + shadcn/ui）。Firebase/Gemini 連携を前提にしたモック API が入っています。

## 構成
- Next.js 16 / TypeScript / Tailwind CSS 3 / shadcn UI コンポーネント
- Firebase を前提とした設計（Auth: 管理者 Google ログイン、Firestore: uploads/generations/settings/logs、Storage: 原本と生成画像、Functions: Gemini 呼び出し＆安全チェック）
- 現在はローカルのモックストアで動作。`/api/generate` がダミー出力を返し、ギャラリー・Like・設定・ログが同一プロセス内で保持されます。

## セットアップ
```bash
npm install
npm run dev
```
http://localhost:3000 を開いて確認できます。管理画面は http://localhost:3000/admin 。

## 主要仕様
- 単枚アップロード（jpg/png/webp, 最大 10MB）
- 1日1回/ブラウザの生成制限＋全体生涯 50 枚の上限（Firestore 連携前提だが、モックでも同等の挙動）
- 生成フロー: アップロード安全チェック → Gemini 生成（リアル→漫画調） → 生成後安全チェック
- ギャラリー: 新着順、自動横スクロール、Like（クッキー/ブラウザ単位）
- 待機 UI: モーダル＋進捗＋カスタムメッセージ欄
- 管理画面: プロンプト・上限・注意書き編集、ログ一覧（モック）

## 本番接続のTODO
- Firebase Auth（管理者のみ Google ログイン）で `/api/settings` などを保護
- Firestore + Storage + Functions への接続:
  - Functions: アップロード安全チェック → Gemini 呼び出し → 生成後チェック → Firestore へ記録
  - クライアントは Functions の Callable API を叩く形に差し替え
  - Firestore に生成履歴・Like・設定・ログを保存し、サーバーサイドでレート制限を検証
- API キーは Vercel 環境変数＋ Functions の環境変数で管理し、フロントには露出させない

## 環境変数例（想定）
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
GOOGLE_GENAI_API_KEY= # Gemini (NanoBanana2/Pro)
```
Functions 側で `GOOGLE_GENAI_API_KEY` を安全に持たせ、フロントは Functions 経由のみで呼び出してください。
