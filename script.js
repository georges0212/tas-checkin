// ============================================================
// TAS 打卡系統
// script.js
// ============================================================

// ============================================================
// 1. Google Apps Script 網址
// ============================================================

const POST_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCM5fWJvQZkEmA2Jqt85p_tGf0n4ZkfrPS8Uw6dPTAMNcdACRf2YMmpw1QXY2_wUFQ/exec";

const GET_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyMYhHKfukCsebFG0JkDPh-0KjUTJDkQIwjSTBIgEonihoEeSqzM_L8UB2BNGY1Jfh6/exec";


// ============================================================
// 2. 學生資料
// ============================================================

const students = [
    {
        name: "王亭磬",
        icon: "👦",
        birthdayMonth: 9,
        birthdayDay: 3
    },
    {
        name: "李昌祐",
        icon: "👦",
        birthdayMonth: 3,
        birthdayDay: 10
    },
    {
        name: "周聖哲",
        icon: "👦",
        birthdayMonth: 8,
        birthdayDay: 12
    },
    {
        name: "洪俊吉",
        icon: "👦",
        birthdayMonth: 12,
        birthdayDay: 22
    },
    {
        name: "黃丞偉",
        icon: "👦",
        birthdayMonth: 6,
        birthdayDay: 2
    },
    {
        name: "温力衡",
        icon: "👦",
        birthdayMonth: 1,
        birthdayDay: 30
    },
    {
        name: "劉哲均",
        icon: "👦",
        birthdayMonth: 12,
        birthdayDay: 15
    },
    {
        name: "顏鉦錕",
        icon: "👦",
        birthdayMonth: 12,
        birthdayDay: 3
    },
    {
        name: "王秀蘋",
        icon: "👧",
        birthdayMonth: 3,
        birthdayDay: 21
    },
    {
        name: "林妙蓉",
        icon: "👧",
        birthdayMonth: 1,
        birthdayDay: 10
    },
    {
        name: "梅庭禎",
        icon: "👧",
        birthdayMonth: 12,
        birthdayDay: 18
    },
    {
        name: "陳芸軒",
        icon: "👧",
        birthdayMonth: 3,
        birthdayDay: 26
    },
    {
        name: "蔡宜珈",
        icon: "👧",
        birthdayMonth: 7,
        birthdayDay: 25
    }
];


// ============================================================
// 3. 系統狀態
// ============================================================

let currentStudent = null;
let currentWorkplace = "";

let currentClockInTime = null;
let currentClockOutTime = null;


// ============================================================
// 4. 網頁載入
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
    showStudentPage();
});


// ============================================================
// 5. 日期 / 時間
// ============================================================

function formattedDate(date = new Date()) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formattedTime(date = new Date()) {

    const hours = String(
        date.getHours()
    ).padStart(2, "0");

    const minutes = String(
        date.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
        date.getSeconds()
    ).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}


// ============================================================
// 6. HTML 安全處理
// ============================================================

function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// 7. 清理文字
// ============================================================

function cleanText(text) {

    return String(text ?? "")
        .replace(/\s+/g, " ")
        .trim();
}


// ============================================================
// 8. 顯示學生選擇頁面
// ============================================================

function showStudentPage() {

    const app = document.getElementById("app");

    let html = `
        <h1>請選擇你的名字</h1>

        <p>
            請點選自己的名字
        </p>

        <div class="student-grid">
    `;

    students.forEach(function (student) {

        html += `
            <button
                onclick="selectStudent('${student.name}')"
            >
                ${student.icon}
                ${escapeHTML(student.name)}
            </button>
        `;
    });

    html += `
        </div>
    `;

    app.innerHTML = html;
}


// ============================================================
// 9. 選擇學生
// ============================================================

function selectStudent(name) {

    currentStudent = students.find(function (student) {
        return student.name === name;
    });

    if (!currentStudent) {
        showErrorPage("找不到學生資料");
        return;
    }

    showBirthdayPage();
}


// ============================================================
// 10. 生日驗證
// ============================================================

function showBirthdayPage() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <h1>生日驗證</h1>

        <p>
            ${escapeHTML(currentStudent.name)}
        </p>

        <p>
            請輸入你的生日
        </p>

        <div>
            <select id="birthdayMonth">
                <option value="">月份</option>
                ${createMonthOptions()}
            </select>

            <select id="birthdayDay">
                <option value="">日期</option>
                ${createDayOptions()}
            </select>
        </div>

        <div class="menu">
            <button onclick="verifyBirthday()">
                確認
            </button>

            <button onclick="showStudentPage()">
                返回
            </button>
        </div>
    `;
}


// ============================================================
// 11. 月份選項
// ============================================================

function createMonthOptions() {

    let html = "";

    for (let i = 1; i <= 12; i++) {

        html += `
            <option value="${i}">
                ${i} 月
            </option>
        `;
    }

    return html;
}


// ============================================================
// 12. 日期選項
// ============================================================

function createDayOptions() {

    let html = "";

    for (let i = 1; i <= 31; i++) {

        html += `
            <option value="${i}">
                ${i} 日
            </option>
        `;
    }

    return html;
}


// ============================================================
// 13. 驗證生日
// ============================================================

function verifyBirthday() {

    const month =
        Number(
            document.getElementById("birthdayMonth").value
        );

    const day =
        Number(
            document.getElementById("birthdayDay").value
        );

    if (!month || !day) {

        showErrorPage(
            "請選擇完整的生日"
        );

        return;
    }

    if (
        month === currentStudent.birthdayMonth &&
        day === currentStudent.birthdayDay
    ) {

        showMainMenu();

    } else {

        showErrorPage(
            "生日不正確，請再試一次"
        );
    }
}


// ============================================================
// 14. 主選單
// ============================================================

function showMainMenu() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <h1>
            ${escapeHTML(currentStudent.name)}
        </h1>

        <p>
            請選擇功能
        </p>

        <div class="menu">

            <button onclick="showWorkplacePage()">
                🏢 開始工作
            </button>

            <button onclick="showMealPage()">
                🍱 午餐／晚餐
            </button>

            <button onclick="clockOut()">
                🏁 完成工作
            </button>

            <button onclick="fetchFeedback()">
                💬 教師評語
            </button>

        </div>
    `;
}


// ============================================================
// 15. 工作場所選擇
// ============================================================

function showWorkplacePage() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <h1>選擇工作場所</h1>

        <div class="workplace-grid">

            <button onclick="clockIn('門市')">
                🏪 門市
            </button>

            <button onclick="clockIn('餐飲')">
                🍳 餐飲
            </button>

            <button onclick="clockIn('醫院')">
                🏥 醫院
            </button>

            <button onclick="clockIn('清潔')">
                🧹 清潔
            </button>

        </div>

        <div class="menu">
            <button onclick="showMainMenu()">
                返回
            </button>
        </div>
    `;
}


// ============================================================
// 16. 上班打卡
// ============================================================

async function clockIn(workplace) {

    currentWorkplace = workplace;

    const now = new Date();

    currentClockInTime = now;

    const payload = {

        studentName:
            cleanText(currentStudent.name),

        date:
            formattedDate(now),

        clockInTime:
            formattedTime(now),

        workplace:
            cleanText(workplace)
    };

    showLoading("正在打卡，請稍候...");

    try {

        await sendDataToGoogleSheet(payload);

        showSuccessPage(
            "上班打卡成功",
            `
            <p>
                工作場所：${escapeHTML(workplace)}
            </p>

            <p>
                上班時間：${formattedTime(now)}
            </p>
            `
        );

    } catch (error) {

        console.error(error);

        showErrorPage(
            "上班打卡失敗，請確認網路連線"
        );
    }
}


// ============================================================
// 17. 午餐 / 晚餐
// ============================================================

function showMealPage() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <h1>午餐／晚餐</h1>

        <p>
            請輸入今天吃的食物
        </p>

        <input
            id="foodInput"
            type="text"
            placeholder="例如：雞腿便當"
        >

        <p>
            請輸入花費
        </p>

        <input
            id="costInput"
            type="number"
            inputmode="decimal"
            placeholder="例如：80"
        >

        <div class="menu">

            <button onclick="saveMeal()">
                確認
            </button>

            <button onclick="showMainMenu()">
                返回
            </button>

        </div>
    `;
}


// ============================================================
// 18. 儲存用餐資料
// ============================================================

async function saveMeal() {

    const foodInput =
        document.getElementById("foodInput");

    const costInput =
        document.getElementById("costInput");

    const food =
        cleanText(foodInput.value);

    const cost =
        cleanText(costInput.value);

    if (!food) {

        showErrorPage(
            "請輸入食物名稱"
        );

        return;
    }

    if (!cost) {

        showErrorPage(
            "請輸入花費"
        );

        return;
    }

    const now = new Date();

    const payload = {

        studentName:
            cleanText(currentStudent.name),

        date:
            formattedDate(now),

        mealTime:
            formattedTime(now),

        food:
            food,

        cost:
            cost
    };

    showLoading("正在記錄用餐資料...");

    try {

        await sendDataToGoogleSheet(payload);

        showSuccessPage(
            "用餐資料已記錄",
            `
            <p>
                食物：${escapeHTML(food)}
            </p>

            <p>
                花費：${escapeHTML(cost)}
            </p>

            <p>
                時間：${formattedTime(now)}
            </p>
            `
        );

    } catch (error) {

        console.error(error);

        showErrorPage(
            "用餐資料記錄失敗"
        );
    }
}


// ============================================================
// 19. 下班打卡
// ============================================================

async function clockOut() {

    const now = new Date();

    currentClockOutTime = now;

    const payload = {

        studentName:
            cleanText(currentStudent.name),

        date:
            formattedDate(now),

        clockOutTime:
            formattedTime(now)
    };

    showLoading("正在完成下班打卡...");

    try {

        await sendDataToGoogleSheet(payload);

        showSuccessPage(
            "下班打卡成功",
            `
            <p>
                下班時間：${formattedTime(now)}
            </p>
            `
        );

    } catch (error) {

        console.error(error);

        showErrorPage(
            "下班打卡失敗，請確認網路連線"
        );
    }
}


// ============================================================
// 20. 傳送資料到 Google Apps Script
// ============================================================

async function sendDataToGoogleSheet(payload) {

    const response =
        await fetch(
            POST_SCRIPT_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify(payload)
            }
        );

    if (!response.ok) {

        throw new Error(
            "HTTP Error: " +
            response.status
        );
    }

    return response;
}


// ============================================================
// 21. 教師評語
// ============================================================

async function fetchFeedback() {

    if (!currentStudent) {

        showErrorPage(
            "尚未選擇學生"
        );

        return;
    }

    showLoading("正在讀取教師評語...");

    try {

        const response =
            await fetch(
                GET_SCRIPT_URL +
                "?studentName=" +
                encodeURIComponent(
                    currentStudent.name
                ) +
                "&t=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "Google Apps Script 回傳資料：",
            data
        );

        let records = [];

        if (Array.isArray(data)) {

            records = data;

        } else if (
            data &&
            Array.isArray(data.records)
        ) {

            records = data.records;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            records = data.data;

        } else if (
            data &&
            typeof data === "object"
        ) {

            records = [data];
        }

        showFeedbackResult(records);

    } catch (error) {

        console.error(
            "讀取教師評語失敗：",
            error
        );

        showErrorPage(
            "教師評語讀取失敗，請確認網路連線"
        );
    }
}


// ============================================================
// 22. 取得評語日期
// ============================================================

function getFeedbackDate(record) {

    if (!record) {
        return "";
    }

    const date =
        cleanText(record.date);

    return date;
}


// ============================================================
// 23. 日期轉成可排序格式
// ============================================================

function getSortableDate(record) {

    const date =
        getFeedbackDate(record);

    if (!date) {
        return 0;
    }

    // 支援：
    // 2026-09-09
    // 2026/09/09
    // 2026.09.09

    const normalized =
        date.replace(
            /[/.]/g,
            "-"
        );

    const match =
        normalized.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

    if (!match) {

        const timestamp =
            Date.parse(date);

        return isNaN(timestamp)
            ? 0
            : timestamp;
    }

    const year =
        Number(match[1]);

    const month =
        Number(match[2]);

    const day =
        Number(match[3]);

    return new Date(
        year,
        month - 1,
        day
    ).getTime();
}


// ============================================================
// 24. 顯示教師評語
// ============================================================

function showFeedbackResult(records) {

    const app =
        document.getElementById("app");

    const targetName =
        cleanText(currentStudent.name);

    // --------------------------------------------------------
    // 第一步：
    // 只留下目前學生
    // --------------------------------------------------------

    let filteredRecords =
        records.filter(function (record) {

            if (!record) {
                return false;
            }

            const studentName =
                cleanText(
                    record.studentName
                );

            return studentName === targetName;
        });


    // --------------------------------------------------------
    // 第二步：
    // 去除空白評語
    // --------------------------------------------------------

    filteredRecords =
        filteredRecords.filter(
            function (record) {

                const feedback =
                    cleanText(
                        record.feedback
                    );

                return feedback.length > 0;
            }
        );


    // --------------------------------------------------------
    // 第三步：
    // 最新日期排最前面
    // --------------------------------------------------------

    filteredRecords.sort(
        function (a, b) {

            return (
                getSortableDate(b) -
                getSortableDate(a)
            );
        }
    );


    // --------------------------------------------------------
    // 如果完全沒有評語
    // --------------------------------------------------------

    if (
        filteredRecords.length === 0
    ) {

        app.innerHTML = `
            <h1>教師評語</h1>

            <p>
                ${escapeHTML(targetName)}
            </p>

            <div class="success">
                <h2>
                    目前沒有教師評語
                </h2>
            </div>

            <div class="menu">
                <button onclick="showMainMenu()">
                    返回
                </button>
            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // 第四步：
    // 建立評語畫面
    // --------------------------------------------------------

    let html = `
        <h1>教師評語</h1>

        <p>
            ${escapeHTML(targetName)}
        </p>

        <div
            style="
                display:flex;
                flex-direction:column;
                gap:12px;
                margin-top:20px;
            "
        >
    `;


    filteredRecords.forEach(
        function (record) {

            const date =
                cleanText(
                    record.date
                );

            const feedback =
                cleanText(
                    record.feedback
                );

            // 再次保險：
            // 如果評語空白就完全不建立 HTML
            if (!feedback) {
                return;
            }

            html += `
                <div
                    style="
                        text-align:left;
                        background:white;
                        border-radius:16px;
                        padding:14px 16px;
                        box-shadow:0 2px 8px rgba(0,0,0,0.08);
                    "
                >

                    <div
                        style="
                            font-size:16px;
                            color:#666;
                            margin-bottom:6px;
                        "
                    >
                        ${escapeHTML(date)}
                    </div>

                    <div
                        style="
                            font-size:19px;
                            line-height:1.5;
                            color:#222;
                            white-space:pre-wrap;
                            overflow-wrap:anywhere;
                        "
                    >
                        ${escapeHTML(feedback)}
                    </div>

                </div>
            `;
        }
    );


    html += `
        </div>

        <div class="menu">
            <button onclick="showMainMenu()">
                返回
            </button>
        </div>
    `;


    app.innerHTML = html;
}


// ============================================================
// 25. Loading 畫面
// ============================================================

function showLoading(message) {

    const app =
        document.getElementById("app");

    app.innerHTML = `
        <div class="loading">
            ${escapeHTML(message)}
        </div>
    `;
}


// ============================================================
// 26. 成功畫面
// ============================================================

function showSuccessPage(
    title,
    content
) {

    const app =
        document.getElementById("app");

    app.innerHTML = `
        <div class="success">

            <h2>
                ${escapeHTML(title)}
            </h2>

            ${content}

        </div>

        <div class="menu">

            <button onclick="showMainMenu()">
                返回主選單
            </button>

        </div>
    `;
}


// ============================================================
// 27. 錯誤畫面
// ============================================================

function showErrorPage(message) {

    const app =
        document.getElementById("app");

    app.innerHTML = `
        <h1>⚠️</h1>

        <div class="error">
            ${escapeHTML(message)}
        </div>

        <div class="menu">

            <button onclick="goBackFromError()">
                返回
            </button>

        </div>
    `;
}


// ============================================================
// 28. 錯誤頁返回
// ============================================================

function goBackFromError() {

    if (currentStudent) {

        showMainMenu();

    } else {

        showStudentPage();
    }
}
