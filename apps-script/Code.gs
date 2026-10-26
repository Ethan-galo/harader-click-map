/**
 * Google Apps Script backend for the Skåne progress map.
 *
 * The sheet gets two tabs:
 *   Progress: one row per area with its current percentage
 *   History:  one row for every change ever made
 *
 * Deploy as a web app (Execute as: Me, Who has access: Anyone).
 */

var PROGRESS_TAB = 'Progress';
var HISTORY_TAB = 'History';
// 10 stands for "pågående": started, but under 20%.
var ALLOWED_PCT = [0, 10, 20, 40, 60, 80, 100];

// Run this once from the editor to create the tabs and grant permissions.
function setup() {
  getTab_(PROGRESS_TAB, ['id', 'name', 'pct', 'updated']);
  getTab_(HISTORY_TAB, ['changed', 'id', 'name', 'old_pct', 'new_pct']);
}

function doGet(e) {
  try {
    return json_({ progress: readProgress_() });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    lock.waitLock(20000);
    if (body.action === 'set') return json_(setPct_(body));
    if (body.action === 'reset') return json_(resetAll_());
    return json_({ error: 'Unknown action' });
  } catch (err) {
    return json_({ error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function readProgress_() {
  var sheet = getTab_(PROGRESS_TAB, ['id', 'name', 'pct', 'updated']);
  var rows = sheet.getDataRange().getValues();
  var out = {};
  for (var i = 1; i < rows.length; i++) {
    var id = String(rows[i][0]);
    var pct = Number(rows[i][2]);
    if (id && pct > 0) out[id] = pct;
  }
  return out;
}

function setPct_(body) {
  var id = String(body.id || '');
  var name = String(body.name || '').slice(0, 100);
  var pct = Number(body.pct);
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return { error: 'Invalid id' };
  if (ALLOWED_PCT.indexOf(pct) === -1) return { error: 'pct must be 0, 10, 20, 40, 60, 80 or 100' };

  var sheet = getTab_(PROGRESS_TAB, ['id', 'name', 'pct', 'updated']);
  var rows = sheet.getDataRange().getValues();
  var now = new Date();
  var oldPct = 0;
  var rowIndex = -1;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === id) { rowIndex = i + 1; oldPct = Number(rows[i][2]) || 0; break; }
  }
  if (oldPct === pct) return { id: id, pct: pct };

  if (rowIndex === -1) {
    sheet.appendRow([id, name, pct, now]);
  } else {
    sheet.getRange(rowIndex, 2, 1, 3).setValues([[name || rows[rowIndex - 1][1], pct, now]]);
  }
  logChange_(now, id, name, oldPct, pct);
  return { id: id, pct: pct };
}

function resetAll_() {
  var sheet = getTab_(PROGRESS_TAB, ['id', 'name', 'pct', 'updated']);
  var rows = sheet.getDataRange().getValues();
  var now = new Date();
  for (var i = 1; i < rows.length; i++) {
    var oldPct = Number(rows[i][2]) || 0;
    if (oldPct > 0) {
      sheet.getRange(i + 1, 3, 1, 2).setValues([[0, now]]);
      logChange_(now, String(rows[i][0]), rows[i][1], oldPct, 0);
    }
  }
  return { ok: true };
}

function logChange_(when, id, name, oldPct, newPct) {
  getTab_(HISTORY_TAB, ['changed', 'id', 'name', 'old_pct', 'new_pct'])
    .appendRow([when, id, name, oldPct, newPct]);
}

function getTab_(title, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(title);
  if (!sheet) {
    sheet = ss.insertSheet(title);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    // Keep ids as text so codes like 0138 keep their leading zero.
    sheet.getRange('A:A').setNumberFormat('@');
    if (title === HISTORY_TAB) sheet.getRange('B:B').setNumberFormat('@');
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
