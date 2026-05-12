# 三元玄空挨星排盤 — Xuan Kong Flying Stars

**功能：** 三元玄空挨星線上排盤 + 原生 Android APK（含 Google Sheets 雲端儲存）

---

## 專案結構

```
xuan-kong-app/
├── web/              ← Next.js 15 網頁（部屬至 Vercel）
├── gas/Code.gs       ← Google Apps Script 後端 API
└── android/          ← 原生 Android Kotlin App
```

---

## 一、Google Sheets + GAS 設定（先做）

1. 到 [Google Sheets](https://sheets.google.com) 建立新試算表，記下 URL 中的 **試算表 ID**（`/d/` 後面的字串）
2. 在試算表中：選單 → 「擴充功能」→「Apps Script」
3. 將 `gas/Code.gs` 的全部內容貼上
4. 將第 19 行的 `YOUR_GOOGLE_SHEET_ID` 替換為你的試算表 ID
5. 儲存後，點「部屬」→「新增部屬作業」→ 類型選「網頁應用程式」
   - 執行身份：**以我的身份**
   - 存取權限：**所有人**
6. 複製部屬後的 URL（格式如 `https://script.google.com/macros/s/xxx/exec`）

---

## 二、網頁前端（Vercel）

1. 在 GitHub 建立 repo，將本專案推送上去
   ```bash
   git init
   git add .
   git commit -m "init: 三元玄空挨星排盤專案"
   git remote add origin https://github.com/YOUR_USERNAME/xuan-kong-app.git
   git push -u origin main
   ```

2. 到 [Vercel](https://vercel.com) → New Project → Import 你的 GitHub repo
   - **Root Directory** 設定為 `web`（非根目錄）
   - Framework: **Next.js**（自動偵測）

3. 在 Vercel Project Settings → Environment Variables 新增：
   ```
   GAS_API_URL = （步驟一取得的 GAS 網址）
   ```

4. 重新部屬，即可使用網頁排盤功能

---

## 三、Android APK（Android Studio）

1. 開啟 **Android Studio**，選「Open」→ 選 `android/` 資料夾
2. 等待 Gradle 同步完成

3. 設定 GAS URL：開啟 `android/app/src/main/java/com/sanyuan/api/GasApiService.kt`
   - 第 29 行，將 `YOUR_GAS_DEPLOYMENT_ID` 替換為 GAS 部屬 ID

4. 建置 APK：選單 → **Build → Generate Signed Bundle / APK → APK**
   - 建立或選擇簽署金鑰（Keystore）
   - 選 `release` variant
   - APK 輸出至 `android/app/release/app-release.apk`

5. 安裝至 Android 手機（Android 7.0 以上）

---

## 排盤演算法說明

### 元旦盤
以**運N**為中宮，依洛書路徑**順飛**：中→乾→兌→艮→離→坎→坤→震→巽

### 山星盤
- 中宮值 = 元旦盤中「坐山宮」的星數
- **四正山**（坎/離/震/兌 各三山）= 陽山 → **順飛**
- **四隅山**（艮/巽/坤/乾 各三山）= 陰山 → **逆飛**

### 向星盤
- 中宮值 = 元旦盤中「朝向宮」的星數
- 同樣依朝向的陰陽決定順/逆飛（與山星獨立計算）

### 起星（替星法）
- 當坐山陰陽 ≠ 期星陰陽時，反轉飛行方向（替星修正）

### 三運顯示
- 選九運 → 顯示 **八運、九運、一運**（環狀循環）

---

## 本機開發

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

---

## 驗證演算法正確性

對照 [destiny.to/app/sanyuan/SanYuan](https://destiny.to/app/sanyuan/SanYuan)，輸入相同 運+山+視角，比對九宮格數字。
