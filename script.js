const SPREADSHEET_ID = "1A_y-qEnuULO22t-z_ES2pgHOFEo1-GHePM5CGJYP9Cw";
const PHOTO_FOLDER_ID = "1fKlhdlwpvghqBYCbvIZEjNy66aF3qltd";
const SHEET_NAME = "實習紀錄";
const TIMEZONE = "Asia/Taipei";

/* ========================================
GET
======================================== */

function doGet(e) {

return createJsonResponse({
status: "success",
message: "TAS Google Apps Script 正常運作"
});

}

/* ========================================
POST
======================================== */

function doPost(e) {

try {

```
Logger.log("========================================");
Logger.log("TAS doPost 開始");
Logger.log("========================================");


if (!e) {

  throw new Error("沒有收到事件資料");

}


if (!e.postData) {

  throw new Error("沒有收到 POST 資料");

}


if (!e.postData.contents) {

  throw new Error("POST 內容是空的");

}


Logger.log("收到 POST 資料");
Logger.log("資料長度：" + e.postData.contents.length);


let data;


try {

  data = JSON.parse(e.postData.contents);

} catch (jsonError) {

  Logger.log("JSON 解析失敗：" + jsonError);

  throw new Error("POST 資料不是有效的 JSON");

}


Logger.log("學生：" + (data.studentName || ""));
Logger.log("日期：" + (data.date || ""));
Logger.log("工作場所：" + (data.workplace || ""));


/* ========================================
   開始工作
======================================== */

if (data.clockInTime) {

  return handleClockIn(data);

}


/* ========================================
   午餐／晚餐
======================================== */

if (data.mealTime) {

  return handleLunch(data);

}


/* ========================================
   完成工作
======================================== */

if (data.clockOutTime) {

  return handleClockOut(data);

}


throw new Error("找不到有效的操作指令");
```

} catch (error) {

```
Logger.log("========================================");
Logger.log("❌ TAS doPost 發生錯誤");
Logger.log(error);
Logger.log("========================================");


return createJsonResponse({

  status: "error",

  message: error.message || String(error)

});
```

}

}

/* ========================================
開始工作
======================================== */

function handleClockIn(data) {

Logger.log("開始處理 Clock In");

const studentName =
cleanText(data.studentName);

const date =
cleanText(data.date);

const clockInTime =
cleanText(data.clockInTime);

const workplace =
cleanText(data.workplace);

if (!studentName) {

```
throw new Error("缺少學生姓名");
```

}

if (!date) {

```
throw new Error("缺少日期");
```

}

if (!clockInTime) {

```
throw new Error("缺少開始工作時間");
```

}

if (!workplace) {

```
throw new Error("缺少工作場所");
```

}

Logger.log("學生：" + studentName);
Logger.log("日期：" + date);
Logger.log("開始時間：" + clockInTime);
Logger.log("工作場所：" + workplace);

/* ========================================
開啟 Google Sheet
======================================== */

const spreadsheet =
SpreadsheetApp.openById(SPREADSHEET_ID);

const sheet =
spreadsheet.getSheetByName(SHEET_NAME);

if (!sheet) {

```
throw new Error(
  "找不到工作表：「" + SHEET_NAME + "」"
);
```

}

Logger.log("Google Sheet 開啟成功");

/* ========================================
找照片
======================================== */

let photoResult = null;

if (data.photoBase64) {

```
Logger.log("收到照片 Base64");

Logger.log(
  "Base64 長度：" +
  String(data.photoBase64).length
);


try {

  photoResult =
    savePhotoToDrive(

      data.photoBase64,

      data.photoMimeType || "image/jpeg",

      date,

      studentName,

      clockInTime

    );


  Logger.log("照片儲存成功");

  Logger.log(
    "檔案名稱：" +
    photoResult.fileName
  );

  Logger.log(
    "檔案 ID：" +
    photoResult.fileId
  );


} catch (photoError) {

  Logger.log(
    "❌ 照片儲存失敗：" +
    photoError
  );


  throw new Error(
    "照片上傳失敗：" +
    photoError.message
  );

}
```

} else {

```
Logger.log("沒有收到照片");
```

}

/* ========================================
找學生當天紀錄
======================================== */

const row =
findStudentRow(
sheet,
date,
studentName
);

if (row > 0) {

```
Logger.log(
  "找到既有紀錄，第 " +
  row +
  " 列"
);


sheet.getRange(row, 1, 1, 4).setValues([

  [
    date,
    studentName,
    workplace,
    clockInTime
  ]

]);
```

} else {

```
Logger.log("沒有既有紀錄，新增資料");


sheet.appendRow([

  date,
  studentName,
  workplace,
  clockInTime,
  "",
  "",
  "",
  ""

]);
```

}

Logger.log("Clock In 寫入成功");

return createJsonResponse({

```
status: "success",

message: "開始工作成功",

studentName: studentName,

date: date,

clockInTime: clockInTime,

workplace: workplace,

photoUploaded:
  photoResult !== null,

photoFileName:
  photoResult
    ? photoResult.fileName
    : "",

photoFileId:
  photoResult
    ? photoResult.fileId
    : "",

photoUrl:
  photoResult
    ? photoResult.url
    : ""
```

});

}

/* ========================================
午餐／晚餐
======================================== */

function handleLunch(data) {

Logger.log("開始處理 Lunch");

const studentName =
cleanText(data.studentName);

const date =
cleanText(data.date);

const mealTime =
cleanText(data.mealTime);

const food =
cleanText(data.food);

const cost =
cleanText(data.cost);

if (!studentName) {

```
throw new Error("缺少學生姓名");
```

}

if (!date) {

```
throw new Error("缺少日期");
```

}

if (!mealTime) {

```
throw new Error("缺少用餐時間");
```

}

const spreadsheet =
SpreadsheetApp.openById(SPREADSHEET_ID);

const sheet =
spreadsheet.getSheetByName(SHEET_NAME);

if (!sheet) {

```
throw new Error(
  "找不到工作表：「" +
  SHEET_NAME +
  "」"
);
```

}

const row =
findStudentRow(
sheet,
date,
studentName
);

if (row <= 0) {

```
throw new Error(
  "找不到今天的開始工作紀錄，請先打卡開始工作"
);
```

}

sheet.getRange(row, 5, 1, 3).setValues([

```
[
  mealTime,
  food,
  cost
]
```

]);

Logger.log(
"Lunch 寫入成功，第 " +
row +
" 列"
);

return createJsonResponse({

```
status: "success",

message: "用餐紀錄儲存成功",

studentName: studentName,

date: date,

mealTime: mealTime,

food: food,

cost: cost
```

});

}

/* ========================================
完成工作
======================================== */

function handleClockOut(data) {

Logger.log("開始處理 Clock Out");

const studentName =
cleanText(data.studentName);

const date =
cleanText(data.date);

const clockOutTime =
cleanText(data.clockOutTime);

if (!studentName) {

```
throw new Error("缺少學生姓名");
```

}

if (!date) {

```
throw new Error("缺少日期");
```

}

if (!clockOutTime) {

```
throw new Error("缺少完成工作時間");
```

}

const spreadsheet =
SpreadsheetApp.openById(SPREADSHEET_ID);

const sheet =
spreadsheet.getSheetByName(SHEET_NAME);

if (!sheet) {

```
throw new Error(
  "找不到工作表：「" +
  SHEET_NAME +
  "」"
);
```

}

const row =
findStudentRow(
sheet,
date,
studentName
);

if (row <= 0) {

```
throw new Error(
  "找不到今天的開始工作紀錄"
);
```

}

sheet.getRange(row, 8).setValue(
clockOutTime
);

Logger.log(
"Clock Out 寫入成功，第 " +
row +
" 列"
);

return createJsonResponse({

```
status: "success",

message: "完成工作成功",

studentName: studentName,

date: date,

clockOutTime: clockOutTime
```

});

}

/* ========================================
⭐ 儲存照片到 Google Drive
======================================== */

function savePhotoToDrive(
base64Data,
mimeType,
date,
studentName,
clockInTime
) {

Logger.log("開始儲存照片");

if (!base64Data) {

```
throw new Error(
  "沒有收到照片資料"
);
```

}

/* ========================================
移除 Data URL 前綴
例如：
data:image/jpeg;base64,XXXX
======================================== */

if (
typeof base64Data === "string" &&
base64Data.indexOf(",") !== -1
) {

```
base64Data =
  base64Data.split(",")[1];
```

}

if (!base64Data) {

```
throw new Error(
  "照片 Base64 資料是空的"
);
```

}

Logger.log(
"Base64 清理完成"
);

/* ========================================
確認 MIME Type
======================================== */

mimeType =
mimeType || "image/jpeg";

if (
mimeType !== "image/jpeg" &&
mimeType !== "image/jpg" &&
mimeType !== "image/png"
) {

```
Logger.log(
  "未知圖片格式：" +
  mimeType +
  "，改用 image/jpeg"
);

mimeType = "image/jpeg";
```

}

/* ========================================
Base64 → Binary
======================================== */

let bytes;

try {

```
bytes =
  Utilities.base64Decode(base64Data);
```

} catch (decodeError) {

```
throw new Error(
  "照片 Base64 解碼失敗：" +
  decodeError.message
);
```

}

if (!bytes || bytes.length === 0) {

```
throw new Error(
  "照片解碼後沒有資料"
);
```

}

Logger.log(
"照片 Binary 大小：" +
bytes.length +
" bytes"
);

/* ========================================
開啟 Drive 資料夾
======================================== */

let folder;

try {

```
folder =
  DriveApp.getFolderById(
    PHOTO_FOLDER_ID
  );
```

} catch (folderError) {

```
throw new Error(
  "無法開啟 Google Drive 資料夾：" +
  folderError.message
);
```

}

Logger.log(
"Drive 資料夾：" +
folder.getName()
);

/* ========================================
建立檔案名稱
======================================== */

const safeDate =
sanitizeFileName(date);

const safeStudentName =
sanitizeFileName(studentName);

const safeTime =
sanitizeFileName(clockInTime);

const fileName =
safeDate +
"*" +
safeStudentName +
"*" +
safeTime +
".jpg";

Logger.log(
"照片檔名：" +
fileName
);

/* ========================================
建立 Blob
不管前端原本是什麼格式，
這裡統一以 JPG 儲存
======================================== */

const blob =
Utilities.newBlob(

```
  bytes,

  "image/jpeg",

  fileName

);
```

/* ========================================
寫入 Google Drive
======================================== */

let file;

try {

```
file =
  folder.createFile(blob);
```

} catch (driveError) {

```
throw new Error(
  "Google Drive 寫入失敗：" +
  driveError.message
);
```

}

Logger.log(
"========================================"
);

Logger.log(
"✅ 照片寫入成功"
);

Logger.log(
"檔案名稱：" +
file.getName()
);

Logger.log(
"檔案 ID：" +
file.getId()
);

Logger.log(
"========================================"
);

return {

```
fileId:
  file.getId(),

fileName:
  file.getName(),

url:
  file.getUrl()
```

};

}

/* ========================================
找學生當天紀錄
======================================== */

function findStudentRow(
sheet,
date,
studentName
) {

const lastRow =
sheet.getLastRow();

if (lastRow < 2) {

```
return 0;
```

}

const data =
sheet
.getRange(
2,
1,
lastRow - 1,
2
)
.getValues();

const targetDate =
normalizeDate(date);

const targetStudent =
normalizeValue(studentName);

for (
let i = 0;
i < data.length;
i++
) {

```
const rowDate =
  normalizeDate(data[i][0]);

const rowStudent =
  normalizeValue(data[i][1]);


if (
  rowDate === targetDate &&
  rowStudent === targetStudent
) {

  return i + 2;

}
```

}

return 0;

}

/* ========================================
日期標準化
======================================== */

function normalizeDate(value) {

if (value instanceof Date) {

```
return Utilities.formatDate(
  value,
  TIMEZONE,
  "yyyy/MM/dd"
);
```

}

if (
value === null ||
value === undefined
) {

```
return "";
```

}

return String(value)

```
.trim()

.replace(/-/g, "/")

.replace(/\s+/g, "");
```

}

/* ========================================
文字標準化
======================================== */

function normalizeValue(value) {

if (
value === null ||
value === undefined
) {

```
return "";
```

}

return String(value)

```
.replace(/\s+/g, "")

.trim();
```

}

/* ========================================
清除文字
======================================== */

function cleanText(value) {

if (
value === null ||
value === undefined
) {

```
return "";
```

}

return String(value)

```
.trim();
```

}

/* ========================================
清理檔案名稱
======================================== */

function sanitizeFileName(value) {

if (
value === null ||
value === undefined
) {

```
return "";
```

}

return String(value)

```
.replace(/[\\\/:*?"<>|]/g, "_")

.replace(/\s+/g, "_")

.trim();
```

}

/* ========================================
JSON Response
======================================== */

function createJsonResponse(data) {

return ContentService

```
.createTextOutput(
  JSON.stringify(data)
)

.setMimeType(
  ContentService.MimeType.JSON
);
```

}

/* ========================================
測試 Drive 資料夾
======================================== */

function testDriveFolder() {

try {

```
const folder =
  DriveApp.getFolderById(
    PHOTO_FOLDER_ID
  );


Logger.log(
  "========================================"
);

Logger.log(
  "✅ Drive 資料夾取得成功"
);

Logger.log(
  "資料夾名稱：" +
  folder.getName()
);

Logger.log(
  "資料夾 ID：" +
  folder.getId()
);

Logger.log(
  "========================================"
);
```

} catch (error) {

```
Logger.log(
  "❌ Drive 資料夾測試失敗"
);

Logger.log(error);
```

}

}

/* ========================================
測試 Drive 寫入
======================================== */

function testDriveWrite() {

try {

```
const folder =
  DriveApp.getFolderById(
    PHOTO_FOLDER_ID
  );


Logger.log(
  "取得資料夾成功：" +
  folder.getName()
);


const file =
  folder.createFile(

    "TAS 寫入測試",

    "這是一個 TAS Google Drive 測試檔案。",

    MimeType.PLAIN_TEXT

  );


Logger.log(
  "========================================"
);

Logger.log(
  "✅ 寫入成功！"
);

Logger.log(
  "檔案名稱：" +
  file.getName()
);

Logger.log(
  "檔案 ID：" +
  file.getId()
);

Logger.log(
  "========================================"
);
```

} catch (error) {

```
Logger.log(
  "❌ Drive 寫入測試失敗"
);

Logger.log(error);
```

}

}

/* ========================================
測試真正的照片儲存
======================================== */

function testPhotoSave() {

try {

```
const folder =
  DriveApp.getFolderById(
    PHOTO_FOLDER_ID
  );


Logger.log(
  "Drive 資料夾：" +
  folder.getName()
);


const testText =
  "TAS PHOTO TEST";


const blob =
  Utilities.newBlob(

    testText,

    "image/jpeg",

    "TAS_Test.jpg"

  );


const file =
  folder.createFile(blob);


Logger.log(
  "========================================"
);

Logger.log(
  "✅ 測試照片檔案建立成功"
);

Logger.log(
  "檔案名稱：" +
  file.getName()
);

Logger.log(
  "檔案 ID：" +
  file.getId()
);

Logger.log(
  "========================================"
);
```

} catch (error) {

```
Logger.log(
  "❌ 測試照片失敗"
);

Logger.log(error);
```

}

}

/* ========================================
初始化 TAS
======================================== */

function initializeTAS() {

try {

```
Logger.log(
  "========================================"
);

Logger.log(
  "TAS 初始化測試開始"
);

Logger.log(
  "========================================"
);


/* Google Sheet */

const spreadsheet =
  SpreadsheetApp.openById(
    SPREADSHEET_ID
  );


Logger.log(
  "✅ Spreadsheet：" +
  spreadsheet.getName()
);


/* 工作表 */

const sheet =
  spreadsheet.getSheetByName(
    SHEET_NAME
  );


if (!sheet) {

  throw new Error(
    "找不到工作表：" +
    SHEET_NAME
  );

}


Logger.log(
  "✅ 工作表：" +
  sheet.getName()
);


/* Drive */

const folder =
  DriveApp.getFolderById(
    PHOTO_FOLDER_ID
  );


Logger.log(
  "✅ Drive：" +
  folder.getName()
);


Logger.log(
  "========================================"
);

Logger.log(
  "✅ TAS 初始化測試完成"
);

Logger.log(
  "========================================"
);
```

} catch (error) {

```
Logger.log(
  "❌ TAS 初始化失敗"
);

Logger.log(error);
```

}

}
