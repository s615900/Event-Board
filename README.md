# 賽事看板（Next.js 版）

全台國小、國中、高中運動賽事的集中網站。Next.js 16 App Router + Tailwind CSS v4 + MongoDB。
由原 Replit 專案（Vite + Express + Ragic）遷移而來。

## 開發

```bash
cp .env.example .env.local   # 填入 MongoDB / SESSION_SECRET / Google
npm install
npm run db:init -- 你的Email  # 第一次使用：建立索引、前台設定與第一位管理者
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
│  ├─ api/                   Route Handlers（後台用，皆需登入；回報錯誤除外）
│  ├─ layout.tsx             字型（next/font）、AuthProvider
│  ├─ globals.css            Tailwind 與自訂 CSS
│  ├─ error.tsx / not-found.tsx
├─ components/               public/、admin/ 各頁面元件與共用 ui.tsx
├─ lib/                      前後端共用：型別、選項清單、日期與狀態計算、auth / 後台資料 context
└─ server/                   僅限伺服器：MongoDB 連線與查詢、輸入驗證、session 簽章、Google OAuth
scripts/init-db.mjs          資料庫初始化（npm run db:init）
```

## 資料

MongoDB 資料庫（`MONGODB_DB`，預設 `sports_board`）有以下 collection：
`events`、`sports`、`sources`、`members`、`changelog`、`reports`、`settings`。

- 前台頁面在伺服器端直接讀資料庫（每次請求都是最新資料），只會讀到「已發布」的賽事。
- 賽事狀態（即將舉行／進行中／已結束）依比賽日期與台灣時間自動計算，不存在資料庫。
- 後台 API 全部需要登入；權限：管理者（全部）、編輯者（新增／編輯，送出後一律待審核）、檢視者（唯讀）。
