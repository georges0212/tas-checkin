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
// 3. 全域狀態
// ============================================================

let currentStudent = null;

let currentWorkplace = "";

let currentClockInTime = null;

let currentClockOutTime = null;


// ============================================================
// 4. 初始化
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("========================================");
    console.log("TAS 打卡系統啟動");
    console.log("========================================");

    showStudentPage();

});


// ============================================================
// 5. 日期與時間
// ============================================================

function formattedDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formattedTime(date) {

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
// 6. 安全 HTML
// ============================================================

function escapeHTML(text) {

    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// 7. 顯示學生選擇頁
// ============================================================

function showStudentPage() {

    currentStudent = null;

    currentWorkplace = "";

    currentClockInTime = null;

    currentClockOutTime = null;

    const app = document.getElementById("app");

    app.innerHTML = `

        <img
            src="students.png"
            alt="Students"
            style="
                width: 350px;
                height: 200px;
                object-fit: cover;
                border-radius: 20px;
                margin-bottom: 20px;
            "
            onerror="this.style.display='none';"
        >

        <h1>TAS 打卡系統</h1>

        <h2>Welcome! 歡迎使用！</h2>

        <p>
            Please select your name！<br>
            選擇你的名字！
        </p>

        <div class="student-grid">

            ${students.map(function (student, index) {

                return `

                    <button
                        type="button"
                        onclick="selectStudent(${index})"
                    >
                        ${student.icon}
                        ${escapeHTML(student.name)}
                    </button>

                `;

            }).join("")}

        </div>

    `;

}


// ============================================================
// 8. 選擇學生
// ============================================================

function selectStudent(index) {

    const student = students[index];

    if (!student) {

        console.error("找不到學生");

        return;

    }

    currentStudent = student;

    console.log(
        "選擇學生：",
        currentStudent.name
    );

    showBirthdayVerification();

}


// ============================================================
// 9. 生日驗證
// ============================================================

function showBirthdayVerification() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }

    const app = document.getElementById("app");

    const monthOptions = Array.from(
        { length: 12 },
        function (_, index) {

            const month = index + 1;

            return `
                <option value="${month}">
                    ${month}
                </option>
            `;

        }
    ).join("");


    const dayOptions = Array.from(
        { length: 31 },
        function (_, index) {

            const day = index + 1;

            return `
                <option value="${day}">
                    ${day}
                </option>
            `;

        }
    ).join("");


    app.innerHTML = `

        <h1>
            Hello ${escapeHTML(currentStudent.name)}! 👋
        </h1>

        <p>
            Select your birthday<br>
            請選擇你的生日
        </p>

        <div>

            <label>
                <strong>Month 月</strong>
            </label>

            <br>

            <select id="birthdayMonth">

                ${monthOptions}

            </select>


            <select id="birthdayDay">

                ${dayOptions}

            </select>

        </div>


        <br>


        <button
            type="button"
            onclick="verifyBirthday()"
        >
            Verify 驗證
        </button>


        <div
            id="birthdayError"
            class="error"
        ></div>


        <br>


        <button
            type="button"
            onclick="showStudentPage()"
        >
            ⬅ Back 返回
        </button>

    `;

}


// ============================================================
// 10. 驗證生日
// ============================================================

function verifyBirthday() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }


    const monthElement =
        document.getElementById("birthdayMonth");

    const dayElement =
        document.getElementById("birthdayDay");


    const selectedMonth =
        Number(monthElement.value);

    const selectedDay =
        Number(dayElement.value);


    if (

        selectedMonth === currentStudent.birthdayMonth &&

        selectedDay === currentStudent.birthdayDay

    ) {

        console.log(
            "✅ 生日驗證成功：",
            currentStudent.name
        );

        showMainMenu();

    } else {

        console.log(
            "❌ 生日驗證失敗：",
            currentStudent.name
        );

        const errorElement =
            document.getElementById("birthdayError");

        errorElement.textContent =
            "❌ Incorrect birthday 輸入錯誤";

    }

}


// ============================================================
// 11. 主選單
// ============================================================

function showMainMenu() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }


    const app =
        document.getElementById("app");


    app.innerHTML = `

        <h1>
            Hello！哈囉！<br>
            ${escapeHTML(currentStudent.name)}! 👋
        </h1>

        <p>
            What would you like to do?<br>
            你要做什麼？
        </p>


        <div class="menu">


            <!-- 開始工作 -->

            <button
                type="button"
                onclick="showStartWork()"
            >

                🟢

                <br>

                Start Work
                開始工作

                <br>

                <small>
                    Clock in 打卡上班
                </small>

            </button>


            <!-- 午餐 / 晚餐 -->

            <button
                type="button"
                onclick="showLunchBreak()"
            >

                🍱

                <br>

                Lunch / Dinner
                午餐 / 晚餐時間

                <br>

                <small>
                    Record your meal
                    紀錄你的花費
                </small>

            </button>


            <!-- 下班 -->

            <button
                type="button"
                onclick="showFinishWork()"
            >

                🔴

                <br>

                Finish Work
                準備下班

                <br>

                <small>
                    Clock out 打卡下班
                </small>

            </button>


            <!-- 教師評語 -->

            <button
                type="button"
                onclick="showFeedback()"
            >

                💬

                <br>

                Teacher Feedback
                教師評語

                <br>

                <small>
                    Check messages
                    查閱教師評論
                </small>

            </button>


        </div>


        <br>


        <button
            type="button"
            onclick="showStudentPage()"
        >
            🔙 Change Student
            更換學生
        </button>

    `;

}


// ============================================================
// 12. 開始工作頁面
// ============================================================

function showStartWork() {

    currentWorkplace = "";

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <h1>
            Start Work
            開始工作
        </h1>


        <p>
            Select your workplace
            <br>
            選擇你的職場
        </p>


        <div class="workplace-grid">


            <button
                type="button"
                onclick="selectWorkplace('門市')"
            >
                🛒 門市
            </button>


            <button
                type="button"
                onclick="selectWorkplace('餐飲')"
            >
                🍽 餐飲
            </button>


            <button
                type="button"
                onclick="selectWorkplace('醫院')"
            >
                🏥 醫院
            </button>


            <button
                type="button"
                onclick="selectWorkplace('清潔')"
            >
                🧹 清潔
            </button>


        </div>


        <div
            id="selectedWorkplace"
            style="margin-top:25px;"
        ></div>


        <div
            id="startWorkError"
            class="error"
        ></div>


        <br>


        <button
            type="button"
            onclick="showMainMenu()"
        >
            ⬅ Back 返回
        </button>

    `;

}


// ============================================================
// 13. 選擇工作場所
// ============================================================

function selectWorkplace(workplace) {

    currentWorkplace = workplace;

    console.log(
        "選擇工作場所：",
        workplace
    );


    const element =
        document.getElementById(
            "selectedWorkplace"
        );


    element.innerHTML = `

        <p>

            Selected:
            <strong>
                ${escapeHTML(workplace)}
            </strong>

        </p>


        <button
            type="button"
            onclick="clockIn()"
        >

            🟢
            Clock In
            打卡上班

        </button>

    `;

}


// ============================================================
// 14. 上班打卡
// ============================================================

async function clockIn() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }


    if (!currentWorkplace) {

        const errorElement =
            document.getElementById(
                "startWorkError"
            );

        if (errorElement) {

            errorElement.textContent =
                "請先選擇工作場所";

        }

        return;

    }


    const now = new Date();

    currentClockInTime = now;


    const payload = {

        studentName:
            currentStudent.name,

        date:
            formattedDate(now),

        clockInTime:
            formattedTime(now),

        workplace:
            currentWorkplace

    };


    console.log(
        "📤 Clock In payload:",
        payload
    );


    showLoading(
        "正在打卡...<br>請稍候..."
    );


    const result =
        await sendDataToGoogleSheet(payload);


    if (result.success) {

        showClockInSuccess();

    } else {

        showErrorPage(
            "❌ Clock In 失敗",
            result.message,
            function () {

                showStartWork();

            }
        );

    }

}


// ============================================================
// 15. 上班成功
// ============================================================

function showClockInSuccess() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="success">

            <div
                style="
                    font-size:70px;
                "
            >
                ✅
            </div>


            <h2>
                Clock-in completed!
            </h2>


            <p>

                <strong>
                    Workplace:
                </strong>

                <br>

                ${escapeHTML(currentWorkplace)}

            </p>


            <p>

                <strong>
                    Date:
                </strong>

                <br>

                ${formattedDate(currentClockInTime)}

            </p>


            <p>

                <strong>
                    Time:
                </strong>

                <br>

                ${formattedTime(currentClockInTime)}

            </p>

        </div>

    `;


    setTimeout(function () {

        showMainMenu();

    }, 3000);

}


// ============================================================
// 16. 午餐 / 晚餐頁面
// ============================================================

function showLunchBreak() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <h1>
            Lunch / Dinner
            午 / 晚餐 🍱
        </h1>


        <p>
            What did you eat?
            <br>
            你今天的午餐 / 晚餐吃什麼？
        </p>


        <input
            id="food"
            type="text"
            placeholder="Food 食物"
        >


        <p>
            How much did you spend?
            <br>
            你花了多少錢？
        </p>


        <input
            id="cost"
            type="number"
            inputmode="numeric"
            min="0"
            placeholder="Cost 價錢"
        >


        <br><br>


        <div
            id="mealError"
            class="error"
        ></div>


        <button
            type="button"
            onclick="saveMeal()"
        >

            💾
            Save 儲存

        </button>


        <br><br>


        <button
            type="button"
            onclick="showMainMenu()"
        >
            ⬅ Back 返回
        </button>

    `;

}


// ============================================================
// 17. 儲存午餐 / 晚餐
// ============================================================

async function saveMeal() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }


    const foodElement =
        document.getElementById("food");


    const costElement =
        document.getElementById("cost");


    const errorElement =
        document.getElementById("mealError");


    const food =
        foodElement.value.trim();


    const cost =
        costElement.value.trim();


    if (!food) {

        errorElement.textContent =
            "請輸入今天吃的食物";

        return;

    }


    if (!cost) {

        errorElement.textContent =
            "請輸入花費";

        return;

    }


    const now = new Date();


    const payload = {

        studentName:
            currentStudent.name,

        date:
            formattedDate(now),

        mealTime:
            formattedTime(now),

        food:
            food,

        cost:
            cost

    };


    console.log(
        "📤 Meal payload:",
        payload
    );


    showLoading(
        "正在儲存餐點資料...<br>請稍候..."
    );


    const result =
        await sendDataToGoogleSheet(payload);


    if (result.success) {

        showMealSuccess(
            food,
            cost,
            now
        );

    } else {

        showErrorPage(
            "❌ 儲存失敗",
            result.message,
            function () {

                showLunchBreak();

            }
        );

    }

}


// ============================================================
// 18. 午餐成功
// ============================================================

function showMealSuccess(
    food,
    cost,
    date
) {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="success">

            <div
                style="
                    font-size:60px;
                "
            >
                ✅
            </div>


            <h2>
                Saved!
                儲存成功！
            </h2>


            <p>

                <strong>
                    Food 食物：
                </strong>

                <br>

                ${escapeHTML(food)}

            </p>


            <p>

                <strong>
                    Cost 花費：
                </strong>

                <br>

                $${escapeHTML(cost)}

            </p>


            <p>

                <strong>
                    Time 時間：
                </strong>

                <br>

                ${formattedTime(date)}

            </p>

        </div>

    `;


    setTimeout(function () {

        showMainMenu();

    }, 2500);

}


// ============================================================
// 19. 下班頁面
// ============================================================

function showFinishWork() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <h1>
            Finish Work
            打卡下班
        </h1>


        <p>
            Ready to finish work?
            <br>
            準備下班？
        </p>


        <br>


        <button
            type="button"
            onclick="clockOut()"
        >

            🔴
            Clock Out
            打卡下班

        </button>


        <br><br>


        <button
            type="button"
            onclick="showMainMenu()"
        >
            ⬅ Back 返回
        </button>

    `;

}


// ============================================================
// 20. 下班打卡
// ============================================================

async function clockOut() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }


    const now = new Date();

    currentClockOutTime = now;


    const payload = {

        studentName:
            currentStudent.name,

        date:
            formattedDate(now),

        clockOutTime:
            formattedTime(now)

    };


    console.log(
        "📤 Clock Out payload:",
        payload
    );


    showLoading(
        "正在打卡下班...<br>請稍候..."
    );


    const result =
        await sendDataToGoogleSheet(payload);


    if (result.success) {

        showClockOutSuccess();

    } else {

        showErrorPage(
            "❌ Clock Out 失敗",
            result.message,
            function () {

                showFinishWork();

            }
        );

    }

}


// ============================================================
// 21. 下班成功
// ============================================================

function showClockOutSuccess() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="success">

            <div
                style="
                    font-size:70px;
                "
            >
                ✅
            </div>


            <h2>
                Clock-out completed!
            </h2>


            <p>

                <strong>
                    Date:
                </strong>

                <br>

                ${formattedDate(currentClockOutTime)}

            </p>


            <p>

                <strong>
                    Time:
                </strong>

                <br>

                ${formattedTime(currentClockOutTime)}

            </p>

        </div>

    `;


    setTimeout(function () {

        showMainMenu();

    }, 3000);

}


// ============================================================
// 22. 教師評語頁面
// ============================================================

async function showFeedback() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }


    const app =
        document.getElementById("app");


    app.innerHTML = `

        <h1>
            Teacher Feedback 💬
        </h1>


        <div
            class="loading"
        >
            讀取評語中...
        </div>

    `;


    await fetchFeedback();

}


//
// ============================================================
// 23. 讀取教師評語
// ============================================================

async function fetchFeedback() {

    if (!currentStudent) {
        showStudentPage();
        return;
    }

    console.log("========================================");
    console.log("🌐 開始讀取 Google Apps Script");
    console.log("學生：", currentStudent.name);
    console.log("========================================");


    try {

        const response = await fetch(
            GET_SCRIPT_URL,
            {
                method: "GET",
                cache: "no-store"
            }
        );


        console.log(
            "📡 HTTP Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `伺服器回應異常：HTTP ${response.status}`
            );

        }


        const data = await response.json();


        console.log(
            "📦 Google 回傳資料：",
            data
        );


        if (!Array.isArray(data)) {

            throw new Error(
                "Google 回傳的資料格式不是陣列"
            );

        }


        console.log(
            "📊 原始資料筆數：",
            data.length
        );


        // ====================================================
        // 1. 找出目前學生的所有評語
        // ====================================================

        const targetName =
            currentStudent.name
                .trim();


        const studentFeedbacks = data.filter(
            function (record) {

                if (!record) {
                    return false;
                }


                // ------------------------------------------------
                // 姓名
                // ------------------------------------------------

                const name =
                    record.studentName
                        ? String(
                            record.studentName
                        ).trim()
                        : "";


                // ------------------------------------------------
                // 評語
                // ------------------------------------------------

                const feedback =
                    record.feedback
                        ? String(
                            record.feedback
                        ).trim()
                        : "";


                // ------------------------------------------------
                // 必須：
                // 1. 是目前學生
                // 2. 評語不能是空白
                // ------------------------------------------------

                return (
                    name === targetName &&
                    feedback !== ""
                );

            }
        );


        console.log(
            "👤 學生：",
            targetName
        );


        console.log(
            "💬 有效評語筆數：",
            studentFeedbacks.length
        );


        // ====================================================
        // 2. 按日期＋時間排序
        //
        // 最新 → 最舊
        // ====================================================

        studentFeedbacks.sort(
            function (a, b) {

                const dateTimeA =
                    getFeedbackDateTime(a);


                const dateTimeB =
                    getFeedbackDateTime(b);


                return (
                    dateTimeB - dateTimeA
                );

            }
        );


        // ====================================================
        // 3. Debug：確認排序結果
        // ====================================================

        studentFeedbacks.forEach(
            function (record, index) {

                console.log(
                    `${index + 1}.`,
                    record.date,
                    record.time,
                    record.feedback
                );

            }
        );


        // ====================================================
        // 4. 顯示畫面
        // ====================================================

        showFeedbackResult(
            studentFeedbacks
        );


    } catch (error) {

        console.error(
            "❌ 讀取評語失敗：",
            error
        );


        showErrorPage(
            "⚠️ 讀取失敗",
            error.message,
            function () {
                showFeedback();
            }
        );

    }

}


// ============================================================
// 23-1. 取得評語的日期＋時間
// ============================================================
//
// Google Sheet 可能出現：
//
// date:
// 2026-09-09
//
// time:
// 14:30:25
//
// 或：
//
// date:
// 2026/09/09
//
// 因此這裡統一處理。
//
// ============================================================

function getFeedbackDateTime(record) {

    if (!record) {
        return 0;
    }


    let dateString =
        record.date
            ? String(record.date).trim()
            : "";


    let timeString =
        record.time
            ? String(record.time).trim()
            : "";


    // --------------------------------------------------------
    // 如果沒有 time，但 date 本身包含時間
    // 例如：
    //
    // 2026-09-09 14:30:25
    //
    // --------------------------------------------------------

    if (
        dateString &&
        !timeString &&
        dateString.includes(" ")
    ) {

        const parts =
            dateString.split(" ");


        dateString =
            parts[0];


        timeString =
            parts.slice(1).join(" ");

    }


    // --------------------------------------------------------
    // 日期格式統一
    // --------------------------------------------------------

    dateString =
        dateString.replace(/\//g, "-");


    // --------------------------------------------------------
    // 時間格式統一
    // --------------------------------------------------------

    if (!timeString) {

        timeString =
            "00:00:00";

    }


    // --------------------------------------------------------
    // 如果時間只有 HH:mm
    // 自動補成 HH:mm:00
    // --------------------------------------------------------

    if (
        /^\d{1,2}:\d{2}$/.test(timeString)
    ) {

        timeString += ":00";

    }


    // --------------------------------------------------------
    // 建立 Date
    // --------------------------------------------------------

    const dateTime =
        new Date(
            `${dateString}T${timeString}`
        );


    // --------------------------------------------------------
    // 如果解析成功
    // --------------------------------------------------------

    if (
        !isNaN(dateTime.getTime())
    ) {

        return dateTime.getTime();

    }


    // --------------------------------------------------------
    // 如果無法解析
    // 就使用日期本身
    // --------------------------------------------------------

    const dateOnly =
        new Date(dateString);


    if (
        !isNaN(dateOnly.getTime())
    ) {

        return dateOnly.getTime();

    }


    return 0;

}


// ============================================================
// 24. 顯示所有教師評語
// ============================================================

function showFeedbackResult(
    records
) {

    const app =
        document.getElementById("app");


    // ========================================================
    // 沒有評語
    // ========================================================

    if (
        !records ||
        records.length === 0
    ) {

        app.innerHTML = `

            <h1>
                Teacher Feedback 💬
            </h1>

            <div class="success">

                <p>
                    目前尚無老師評語喔！
                </p>

            </div>

            <br>

            <button
                type="button"
                onclick="showMainMenu()"
            >
                ⬅ Back 返回
            </button>

        `;

        return;

    }


    // ========================================================
    // 有評語
    // ========================================================

    let feedbackHTML = "";


    records.forEach(
        function (record, index) {

            const feedback =
                record.feedback
                    ? String(
                        record.feedback
                    ).trim()
                    : "";


            if (!feedback) {
                return;
            }


            const date =
                record.date
                    ? String(
                        record.date
                    ).trim()
                    : "";


            const time =
                record.time
                    ? String(
                        record.time
                    ).trim()
                    : "";


            // ------------------------------------------------
            // 日期顯示
            // ------------------------------------------------

            let dateTimeText = "";


            if (date && time) {

                dateTimeText =
                    `${date} ${time}`;

            } else if (date) {

                dateTimeText =
                    date;

            } else if (time) {

                dateTimeText =
                    time;

            }


            feedbackHTML += `

                <div
                    style="
                        text-align:left;
                        background:white;
                        padding:18px;
                        border-radius:16px;
                        margin-bottom:12px;
                        box-shadow:
                            0 2px 8px
                            rgba(0,0,0,0.06);
                    "
                >


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:10px;
                            margin-bottom:10px;
                        "
                    >

                        <strong
                            style="
                                font-size:18px;
                            "
                        >
                            ${escapeHTML(
                                currentStudent.name
                            )}
                        </strong>


                        ${
                            dateTimeText
                                ? `
                                    <span
                                        style="
                                            color:#777;
                                            font-size:14px;
                                            white-space:nowrap;
                                        "
                                    >
                                        ${escapeHTML(
                                            dateTimeText
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <div
                        style="
                            border-top:
                                1px solid #ddd;
                            padding-top:10px;
                            font-size:19px;
                            line-height:1.7;
                            white-space:pre-wrap;
                            word-break:break-word;
                        "
                    >

                        ${escapeHTML(
                            feedback
                        )}

                    </div>


                </div>

            `;

        }
    );


    // ========================================================
    // 最終畫面
    // ========================================================

    app.innerHTML = `

        <h1>
            Teacher Feedback 💬
        </h1>


        <p
            style="
                margin-bottom:15px;
            "
        >
            ${escapeHTML(
                currentStudent.name
            )}
        </p>


        <div
            style="
                background:
                    rgba(0,0,0,0.03);
                padding:10px;
                border-radius:18px;
            "
        >

            ${feedbackHTML}

        </div>


        <br>


        <button
            type="button"
            onclick="showMainMenu()"
        >
            ⬅ Back 返回
        </button>

    `;

}

// ============================================================
// 25. 傳送資料到 Google Sheet
// ============================================================

async function sendDataToGoogleSheet(
    payload
) {

    console.log(
        "========================================"
    );

    console.log(
        "📤 傳送資料到 Google Sheet"
    );

    console.log(
        payload
    );


    try {

        // ----------------------------------------------------
        // 注意：
        //
        // Google Apps Script Web App 使用 POST 時，
        // 為了避免瀏覽器 CORS preflight，
        // 這裡使用 text/plain。
        //
        // Apps Script 的 doPost(e) 仍然可以從
        // e.postData.contents 取得 JSON。
        // ----------------------------------------------------

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


        console.log(
            "📡 HTTP Status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "📦 Google Apps Script Response:",
            responseText
        );


        if (!response.ok) {

            return {

                success: false,

                message:
                    `HTTP ${response.status}`

            };

        }


        // ----------------------------------------------------
        // 嘗試解析 Google 回傳 JSON
        // ----------------------------------------------------

        let responseJSON = null;


        try {

            responseJSON =
                JSON.parse(responseText);

        } catch (jsonError) {

            // 有些 Apps Script 可能只回傳文字
            responseJSON = null;

        }


        // ----------------------------------------------------
        // 如果 Apps Script 回傳 success:false
        // ----------------------------------------------------

        if (

            responseJSON &&

            responseJSON.success === false

        ) {

            return {

                success: false,

                message:
                    responseJSON.message ||
                    "Google Apps Script 寫入失敗"

            };

        }


        // ----------------------------------------------------
        // 成功
        // ----------------------------------------------------

        return {

            success: true,

            message:
                "資料成功送出"

        };


    } catch (error) {

        console.error(
            "❌ Google Sheet 傳送失敗：",
            error
        );


        return {

            success: false,

            message:
                error.message ||
                "網路連線失敗"

        };

    }

}


// ============================================================
// 26. Loading 畫面
// ============================================================

function showLoading(
    message
) {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="loading">

            ⏳

            <br><br>

            ${message}

        </div>

    `;

}


// ============================================================
// 27. 錯誤頁面
// ============================================================

function showErrorPage(
    title,
    message,
    retryFunction
) {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div
            class="error"
            style="
                margin-top:40px;
                padding:20px;
            "
        >

            <h2>
                ${escapeHTML(title)}
            </h2>


            <p
                style="
                    font-size:16px;
                    color:#666;
                    word-break:break-word;
                "
            >
                ${escapeHTML(message)}
            </p>


            <br>


            <button
                type="button"
                id="retryButton"
            >
                🔄 Try Again 再試一次
            </button>


            <br><br>


            <button
                type="button"
                onclick="showMainMenu()"
            >
                ⬅ Back 返回
            </button>

        </div>

    `;


    const retryButton =
        document.getElementById(
            "retryButton"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            retryFunction
        );

    }

}


// ============================================================
// 28. 防止 Enter 送出奇怪資料
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            event.target.tagName === "INPUT"
        ) {

            // 讓 input 可以正常輸入
            // 不自動觸發其他功能

            return;

        }

    }
);


// ============================================================
// 29. Console 測試工具
// ============================================================

console.log(
    "TAS JavaScript loaded successfully."
);

console.log(
    "Students:",
    students.length
);

console.log(
    "POST URL:",
    POST_SCRIPT_URL
);

console.log(
    "GET URL:",
    GET_SCRIPT_URL
);
