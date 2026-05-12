/**
 * 三元玄空挨星排盤 — Google Apps Script 後端
 *
 * 部屬步驟：
 * 1. 在 Google Sheets 建立一個新試算表，記下試算表 ID
 * 2. 將 SHEET_ID 替換為你的試算表 ID
 * 3. 在 Apps Script 編輯器部屬為「網頁應用程式」
 *    - 執行身份：以我的身份
 *    - 存取權限：所有人
 * 4. 複製部屬後的網址，設定到 Vercel 的 GAS_API_URL 環境變數
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // ← 替換為你的試算表 ID
const SHEET_NAME = '排盤紀錄';

const HEADERS = [
  'id', 'date', 'owner', 'address', 'angle',
  'yun', 'mountain', 'shijiao', 'firePit', 'qiXing',
  'notes', 'createdAt'
];

// ── 初始化 ────────────────────────────────────────────────

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── CORS 回應 ─────────────────────────────────────────────

function corsOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET 處理 ──────────────────────────────────────────────

function doGet(e) {
  try {
    const action = e.parameter.action || 'list';
    if (action !== 'list') {
      return corsOutput({ success: false, error: 'unknown action' });
    }

    const q = (e.parameter.q || '').toLowerCase().trim();
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return corsOutput({ success: true, records: [] });
    }

    const rows = data.slice(1); // 跳過標題列
    const records = rows
      .map(row => {
        const obj = {};
        HEADERS.forEach((h, i) => { obj[h] = row[i]; });
        obj.yun = Number(obj.yun) || 0;
        obj.firePit = obj.firePit === true || obj.firePit === 'TRUE';
        obj.qiXing  = obj.qiXing  === true || obj.qiXing  === 'TRUE';
        return obj;
      })
      .filter(r => r.id) // 過濾空列
      .filter(r => {
        if (!q) return true;
        return (
          String(r.owner).toLowerCase().includes(q) ||
          String(r.address).toLowerCase().includes(q)
        );
      })
      .reverse(); // 最新在前

    return corsOutput({ success: true, records });
  } catch (err) {
    return corsOutput({ success: false, error: String(err) });
  }
}

// ── POST 處理 ─────────────────────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'save') {
      return handleSave(body);
    } else if (action === 'delete') {
      return handleDelete(body.id);
    } else {
      return corsOutput({ success: false, error: 'unknown action' });
    }
  } catch (err) {
    return corsOutput({ success: false, error: String(err) });
  }
}

function handleSave(body) {
  const sheet = getSheet();
  const id = Utilities.getUuid();
  const now = new Date().toISOString();

  const row = [
    id,
    body.date || '',
    body.owner || '',
    body.address || '',
    body.angle || '',
    Number(body.yun) || 0,
    body.mountain || '',
    body.shijiao || '',
    body.firePit ? 'TRUE' : 'FALSE',
    body.qiXing  ? 'TRUE' : 'FALSE',
    body.notes || '',
    now,
  ];

  sheet.appendRow(row);
  return corsOutput({ success: true, id });
}

function handleDelete(id) {
  if (!id) return corsOutput({ success: false, error: 'missing id' });

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1); // +1 因為 getDataRange 從 row 1 開始
      return corsOutput({ success: true });
    }
  }
  return corsOutput({ success: false, error: 'record not found' });
}
