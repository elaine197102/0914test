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

目前為前端 MVP，資料位於 `data.js`，尚未接上真正資料庫、登入驗證及後端 API。後續可依 `SPEC.md` 第 9 節建立 `/api/v1`，並將 `app.js` 的 `QMI_DATA` 替換為 API 查詢。
