// ========================================
// TAS 打卡系統 - 前端主程式
// ========================================

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCM5fWJvQZkEmA2Jqt85p_tGf0n4ZkfrPS8Uw6dPTAMNcdACRf2YMmpw1QXY2_wUFQ/exec";

const FEEDBACK_URL =
    "https://script.google.com/macros/s/AKfycbyMYhHKfukCsebFG0JkDPh-0KjUTJDkQIwjSTBIgEonihoEeSqzM_L8UB2BNGY1Jfh6/exec";

// ========================================
// 學生資料
// ========================================

const students = [
    { name: "王亭磬", icon: "👦", birthdayMonth: 9, birthdayDay: 3 },
    { name: "李昌祐", icon: "👦", birthdayMonth: 3, birthdayDay: 10 },
    { name: "周聖哲", icon: "👦", birthdayMonth: 8, birthdayDay: 12 },
    { name: "洪俊吉", icon: "👦", birthdayMonth: 12, birthdayDay: 22 },
    { name: "黃丞偉", icon: "👦", birthdayMonth: 6, birthdayDay: 2 },
    { name: "温力衡", icon: "👦", birthdayMonth: 1, birthdayDay: 30 },
    { name: "劉哲均", icon: "👦", birthdayMonth: 12, birthdayDay: 15 },
    { name: "顏鉦錕", icon: "👦", birthdayMonth: 12, birthdayDay: 3 },
    { name: "王秀蘋", icon: "👧", birthdayMonth: 3, birthdayDay: 21 },
    { name: "林妙蓉", icon: "👧", birthdayMonth: 1, birthdayDay: 10 },
    { name: "梅庭禎", icon: "👧", birthdayMonth: 12, birthdayDay: 18 },
    { name: "陳芸軒", icon: "👧", birthdayMonth: 3, birthdayDay: 26 },
    { name: "蔡宜珈", icon: "👧", birthdayMonth: 7, birthdayDay: 25 }
];

// ========================================
// 全域狀態
// ========================================

let currentStudent = null;
let selectedWorkplace = "";
let currentPhotoBase64 = "";
let currentPhotoMimeType = "image/jpeg";

// 初始化
document.addEventListener("DOMContentLoaded", () => {
    showHome();
});

// ========================================
// 輔助工具函式
// ========================================

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function cleanFeedbackText(text) {
    if (!text) return "";
    return String(text)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/^[ \t]+/gm, "")
        .replace(/[ \t]+$/gm, "")
        .replace(/^\n+/, "")
        .replace(/\n+$/, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatTime(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

// ========================================
// 1. 首頁：選擇學生
// ========================================

function showHome() {
    currentStudent = null;
    selectedWorkplace = "";
    currentPhotoBase64 = "";

    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>TAS 打卡系統</h1>
        <h2>Welcome! 歡迎使用！</h2>
        <p>Please select your name！<br>選擇你的名字！</p>
        <div class="student-grid" id="studentsContainer"></div>
    `;

    const container = document.getElementById("studentsContainer");
    students.forEach((student, index) => {
        const button = document.createElement("button");
        button.textContent = `${student.icon} ${student.name}`;
        button.addEventListener("click", () => showBirthdayVerification(index));
        container.appendChild(button);
    });
}

// ========================================
// 2. 生日驗證
// ========================================

function showBirthdayVerification(index) {
    currentStudent = students[index];
    const app = document.getElementById("app");

    app.innerHTML = `
        <h1>Hello ${escapeHTML(currentStudent.name)}! 👋</h1>
        <h2>Select your birthday</h2>
        <p>請選擇你的生日</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <select id="monthSelect">${createMonthOptions()}</select>
            <select id="daySelect">${createDayOptions()}</select>
        </div>
        <br>
        <button id="verifyButton" style="background-color: #2ec4b6; color: white;">Verify 驗證</button>
        <br><br>
        <button id="backHomeButton">⬅ Back 返回</button>
        <div id="errorMsg" class="error"></div>
    `;

    document.getElementById("verifyButton").addEventListener("click", verifyBirthday);
    document.getElementById("backHomeButton").addEventListener("click", showHome);
}

function createMonthOptions() {
    let html = "";
    for (let i = 1; i <= 12; i++) {
        html += `<option value="${i}">${i} 月</option>`;
    }
    return html;
}

function createDayOptions() {
    let html = "";
    for (let i = 1; i <= 31; i++) {
        html += `<option value="${i}">${i} 日</option>`;
    }
    return html;
}

function verifyBirthday() {
    const month = Number(document.getElementById("monthSelect").value);
    const day = Number(document.getElementById("daySelect").value);
    const errorMsg = document.getElementById("errorMsg");

    if (month === currentStudent.birthdayMonth && day === currentStudent.birthdayDay) {
        errorMsg.textContent = "";
        showMainMenu();
    } else {
        errorMsg.textContent = "❌ Incorrect birthday 輸入錯誤";
    }
}

// ========================================
// 3. 主選單
// ========================================

function showMainMenu() {
    selectedWorkplace = "";
    currentPhotoBase64 = "";

    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>Hello！哈囉！</h1>
        <h2>${escapeHTML(currentStudent.name)} 👋</h2>
        <p>What would you like to do?<br>你要做什麼？</p>

        <div class="menu">
            <button id="startWorkBtn">🟢 Start Work 開始工作</button>
            <button id="lunchBtn">🍱 Lunch / Dinner 午餐／晚餐</button>
            <button id="finishWorkBtn" style="background-color: #e74c3c;">🔴 Finish Work 打卡下班</button>
            <button id="feedbackBtn" style="background-color: #f39c12;">💬 Teacher Feedback 教師評語</button>
            <button id="logoutBtn" id="logoutButton">⬅ 回到學生選擇</button>
        </div>
    `;

    document.getElementById("startWorkBtn").addEventListener("click", showStartWork);
    document.getElementById("lunchBtn").addEventListener("click", showLunch);
    document.getElementById("finishWorkBtn").addEventListener("click", showFinishWork);
    document.getElementById("feedbackBtn").addEventListener("click", showFeedback);
    document.getElementById("logoutBtn").addEventListener("click", showHome);
}

// ========================================
// 4. 開始工作（含上傳照片）
// ========================================

function showStartWork() {
    selectedWorkplace = "";
    currentPhotoBase64 = "";

    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>Start Work 開始工作</h1>
        <h2>1. Select your workplace (選擇 workplace)</h2>
        
        <div class="workplace-grid">
            <button type="button" class="wp-btn" data-wp="門市">🛒 門市</button>
            <button type="button" class="wp-btn" data-wp="餐飲">🍽 餐飲</button>
            <button type="button" class="wp-btn" data-wp="醫院">🏥 醫院</button>
            <button type="button" class="wp-btn" data-wp="清潔">🧹 清潔</button>
        </div>
        
        <p id="selectedWorkplaceText" style="font-weight: bold; color: #2c3e50; margin-top: 15px;"></p>

        <div class="photo-upload-section">
            <h2 style="margin-bottom: 5px;">2. Upload Photo (上傳工作照片)</h2>
            <p style="margin-top: 0;">請選擇照片或開啟相機拍照</p>
            <input type="file" id="photoInput" accept="image/*" capture="environment" style="display: none;">
            <button type="button" id="selectPhotoBtn" style="background-color: #3498db; color: white;">📷 選擇/拍攝照片</button>
            <br>
            <img id="photoPreview" alt="預覽照片">
        </div>

        <button id="clockInButton" style="display:none; background-color: #2ecc71; color: white; font-weight: bold;">🟢 Clock In 打卡上班</button>
        <br><br>
        <button id="backMenuButton">⬅ 返回主選單</button>

        <div id="clockInMessage"></div>
    `;

    // 綁定職場選擇按鈕
    const wpBtns = document.querySelectorAll(".wp-btn");
    wpBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            wpBtns.forEach(b => b.style.backgroundColor = "");
            btn.style.backgroundColor = "#d1e7dd";
            chooseWorkplace(btn.getAttribute("data-wp"));
        });
    });

    // 綁定照片上傳邏輯
    const photoInput = document.getElementById("photoInput");
    const selectPhotoBtn = document.getElementById("selectPhotoBtn");
    const photoPreview = document.getElementById("photoPreview");

    selectPhotoBtn.addEventListener("click", () => photoInput.click());

    photoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            currentPhotoMimeType = file.type || "image/jpeg";
            const reader = new FileReader();
            reader.onload = function (event) {
                const dataUrl = event.target.result;
                photoPreview.src = dataUrl;
                photoPreview.style.display = "block";
                
                // 去除 base64 前綴
                currentPhotoBase64 = dataUrl.split(",")[1] || "";
                checkCanClockIn();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("clockInButton").addEventListener("click", clockIn);
    document.getElementById("backMenuButton").addEventListener("click", showMainMenu);
}

function chooseWorkplace(workplace) {
    selectedWorkplace = workplace;
    document.getElementById("selectedWorkplaceText").textContent = "Selected 選擇場所: " + workplace;
    checkCanClockIn();
}

function checkCanClockIn() {
    const clockInBtn = document.getElementById("clockInButton");
    if (selectedWorkplace && currentPhotoBase64) {
        clockInBtn.style.display = "inline-block";
    } else {
        clockInBtn.style.display = "none";
    }
}

async function clockIn() {
    if (!currentStudent || !selectedWorkplace || !currentPhotoBase64) {
        alert("請選擇工作場所並上傳照片！");
        return;
    }

    const now = new Date();
    const payload = {
        studentName: currentStudent.name,
        date: formatDate(now),
        clockInTime: formatTime(now),
        workplace: selectedWorkplace,
        photoBase64: currentPhotoBase64,
        photoMimeType: currentPhotoMimeType
    };

    const message = document.getElementById("clockInMessage");
    const clockButton = document.getElementById("clockInButton");

    clockButton.disabled = true;
    clockButton.textContent = "⏳ 打卡與照片傳送中...";
    message.innerHTML = `<div class="loading">正在上傳照片與打卡資料...</div>`;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (resData.status === "success") {
            message.innerHTML = `<div class="success">✅ 打卡成功！照片已同步備份。</div>`;
            setTimeout(() => showMainMenu(), 2000);
        } else {
            throw new Error(resData.message || "打卡失敗");
        }
    } catch (err) {
        message.innerHTML = `<div class="error">❌ 打卡失敗：${escapeHTML(err.message)}</div>`;
        clockButton.disabled = false;
        clockButton.textContent = "🟢 Clock In 打卡上班";
    }
}

// ========================================
// 5. 餐費 / 用餐紀錄
// ========================================

function showLunch() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>🍱 Lunch / Dinner</h1>
        <h2>午餐／晚餐紀錄</h2>
        
        <div style="text-align: left; margin-top: 15px;">
            <label>用餐類別 / 時間：</label>
            <input type="text" id="mealTime" placeholder="例如：午餐 / 12:30">
            
            <label>食物內容：</label>
            <input type="text" id="food" placeholder="例如：排骨便當">
            
            <label>花費金額：</label>
            <input type="number" id="cost" placeholder="例如：90">
        </div>

        <br>
        <button id="submitLunchBtn" style="background-color: #2ec4b6; color: white;">送出餐費紀錄</button>
        <br><br>
        <button id="backMenuButton">⬅ 返回主選單</button>
        <div id="lunchMessage"></div>
    `;

    document.getElementById("submitLunchBtn").addEventListener("click", submitLunch);
    document.getElementById("backMenuButton").addEventListener("click", showMainMenu);
}

async function submitLunch() {
    const mealTime = document.getElementById("mealTime").value.trim();
    const food = document.getElementById("food").value.trim();
    const cost = document.getElementById("cost").value.trim();
    const message = document.getElementById("lunchMessage");

    if (!mealTime && !food && !cost) {
        alert("請至少填寫一項內容！");
        return;
    }

    const now = new Date();
    const payload = {
        studentName: currentStudent.name,
        date: formatDate(now),
        mealTime: mealTime,
        food: food,
        cost: cost
    };

    message.innerHTML = `<div class="loading">傳送資料中...</div>`;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();
        if (resData.status === "success") {
            message.innerHTML = `<div class="success">✅ 用餐紀錄新增完成！</div>`;
            setTimeout(() => showMainMenu(), 2000);
        } else {
            throw new Error(resData.message || "提交失敗");
        }
    } catch (err) {
        message.innerHTML = `<div class="error">❌ 提交失敗：${escapeHTML(err.message)}</div>`;
    }
}

// ========================================
// 6. 打卡下班
// ========================================

function showFinishWork() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>Finish Work 下班打卡</h1>
        <p>確認結束今日工作並打卡？</p>
        
        <button id="clockOutBtn" style="background-color: #e74c3c; color: white; font-weight: bold;">🔴 Clock Out 下班打卡</button>
        <br><br>
        <button id="backMenuButton">⬅ 返回主選單</button>
        <div id="clockOutMessage"></div>
    `;

    document.getElementById("clockOutBtn").addEventListener("click", clockOut);
    document.getElementById("backMenuButton").addEventListener("click", showMainMenu);
}

async function clockOut() {
    const now = new Date();
    const payload = {
        studentName: currentStudent.name,
        date: formatDate(now),
        clockOutTime: formatTime(now)
    };

    const message = document.getElementById("clockOutMessage");
    message.innerHTML = `<div class="loading">處理下班打卡中...</div>`;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();
        if (resData.status === "success") {
            message.innerHTML = `<div class="success">✅ 下班打卡成功！辛苦了！</div>`;
            setTimeout(() => showMainMenu(), 2000);
        } else {
            throw new Error(resData.message || "打卡失敗");
        }
    } catch (err) {
        message.innerHTML = `<div class="error">❌ 下班打卡失敗：${escapeHTML(err.message)}</div>`;
    }
}

// ========================================
// 7. 教師評語閱讀
// ========================================

async function showFeedback() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>💬 Teacher Feedback</h1>
        <h2>教師評語紀錄</h2>
        <div id="feedbackContainer"><div class="loading">讀取評語中...</div></div>
        <br>
        <button id="backMenuButton">⬅ 返回主選單</button>
    `;

    document.getElementById("backMenuButton").addEventListener("click", showMainMenu);

    const container = document.getElementById("feedbackContainer");

    try {
        const response = await fetch(`${FEEDBACK_URL}?studentName=${encodeURIComponent(currentStudent.name)}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            container.innerHTML = "";
            data.forEach(item => {
                const card = document.createElement("div");
                card.className = "feedback-card";
                card.innerHTML = `
                    <div class="feedback-date">📅 ${escapeHTML(item.date || "未知日期")}</div>
                    <div class="feedback-content">${escapeHTML(cleanFeedbackText(item.feedback))}</div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `<p>目前沒有 ${escapeHTML(currentStudent.name)} 的評語紀錄。</p>`;
        }
    } catch (err) {
        container.innerHTML = `<div class="error">無法載入評語資料</div>`;
    }
}
