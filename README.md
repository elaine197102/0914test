# 質量指標操作定義查詢系統 MVP

這是依照 `SPEC.md` 建立的零依賴前端 MVP，包含：

- 省分必選查詢
- 指標名稱、代碼、定義關鍵字與分類篩選
- 查詢結果與指標詳情
- 同一指標跨省比較
- 內容管理狀態列表
- 省分、指標、版本、操作定義與參考資訊種子資料

## 啟動方式

可直接雙擊 `index.html` 開啟。若希望透過本地 HTTP 伺服器啟動，在 PowerShell 執行：

```powershell
python -m http.server 8000
```

再開啟 `http://localhost:8000/`。

## 目前限制

目前前端的指標查詢已改接 Vercel Serverless API 與 Neon Postgres。原始 DOC／PDF 與 OCR 內容存放於私有 Vercel Blob，不會放入本 repo；匯入資料會保留來源文件、頁碼及 `needs_review` 校對狀態。網站使用 Vercel Authentication 保護，只有授權團隊成員可查詢。
