# 賽事看板（Next.js 版）

由原 Replit pnpm monorepo（`賽事看板/artifacts/sports-board` + `artifacts/api-server`）遷移而來。
Next.js 16 App Router + Tailwind CSS v4，前後端合併成單一專案，資料仍存放於 Ragic。

## 開發

```bash
cp .env.example .env.local   # 填入 Ragic / Google / SESSION_SECRET
npm install
npm run dev                  # http://localhost:3000
```

`npm run build` / `npm start` 為正式環境建置與啟動，`npm run lint` 執行 ESLint。

## 結構

```
src/
├─ app/
│  ├─ (public)/              前台：/、/events、/events/[id]（共用 PublicShell 版型）
│  ├─ admin/login/           後台登入
│  ├─ admin/(dashboard)/     後台各頁（AdminGate 未登入會導回 /admin/login）
│  ├─ api/                   Route Handlers（取代原本的 Express api-server）
│  ├─ layout.tsx             字型（next/font）、AuthProvider、DataProvider
│  ├─ globals.css            Tailwind 與自訂 CSS
│  ├─ error.tsx / not-found.tsx
├─ components/               public/、admin/ 各頁面元件與共用 ui.tsx
├─ lib/                      前端：型別、示範資料、Ragic 欄位對照、auth / data context
└─ server/                   僅限伺服器：Ragic API、session 簽章、Google OAuth、changelog
```

## 與原版的差異

- 路由：wouter → App Router 檔案路由；`useSearchParams` 的頁面包在 `<Suspense>` 中。
- API：Express routes → `src/app/api/**/route.ts`，路徑與行為相同（`/api/events` 等）。
- 登入 cookie：cookie-parser 的簽章 → 自行以 HMAC-SHA256 簽章（`src/server/session.ts`），舊 cookie 會失效需重新登入。
- Google redirect URI：原本寫死 `sportsboard-tw.replit.app`，改為 `GOOGLE_REDIRECT_URI` 環境變數。
- 變更紀錄寫入改為 `await`（serverless 環境回應後可能被凍結，fire-and-forget 會遺失）。
- 未搬移：`mcp-bridge`（Replit 遠端開發用）、`mockup-sandbox`、未使用的 shadcn/ui 元件與 `lib/db`（Drizzle 未被使用）。
