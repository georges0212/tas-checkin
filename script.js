// ============================================================
// TAS 打卡系統
// JavaScript Version
//
// 功能：
// 1. 學生選擇
// 2. 生日驗證
// 3. 主選單
// 4. 開始工作 / Clock In
// 5. 選擇工作場所
// 6. 午餐 / 晚餐紀錄
// 7. 下班 / Clock Out
// 8. 教師評語
// 9. Google Apps Script POST
// 10. Google Apps Script GET
// ============================================================


// ============================================================
// 1. Google Apps Script URL
// ============================================================

// ------------------------------------------------------------
// POST：寫入打卡資料
// ------------------------------------------------------------

const POST_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCM5fWJvQZkEmA2Jqt85p_tGf0n4ZkfrPS8Uw6dPTAMNcdACRf2YMmpw1QXY2_wUFQ/exec";


// ------------------------------------------------------------
// GET：讀取教師評語
// ------------------------------------------------------------

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


// ============================================================
// 23. 讀取教師評語
// ============================================================

async function fetchFeedback() {

    if (!currentStudent) {

        showStudentPage();

        return;

    }


    console.log(
        "========================================"
    );

    console.log(
        "🌐 開始讀取 Google Apps Script"
    );

    console.log(
        "Student:",
        currentStudent.name
    );

    console.log(
        "URL:",
        GET_SCRIPT_URL
    );


    try {

        const response =
            await fetch(
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


        const data =
            await response.json();


        console.log(
            "📦 Google 回傳：",
            data
        );


        if (!Array.isArray(data)) {

            throw new Error(
                "Google 回傳的資料不是陣列"
            );

        }


        console.log(
            "資料筆數：",
            data.length
        );


        const targetName =
            currentStudent.name
                .trim();


        let matchedRecord = null;


        // ----------------------------------------------------
        // 從最後一筆開始找
        // ----------------------------------------------------

        for (
            let i = data.length - 1;
            i >= 0;
            i--
        ) {

            const record =
                data[i];


            if (!record) {
                continue;
            }


            const name =
                record.studentName
                    ? String(
                        record.studentName
                    ).trim()
                    : "";


            const feedback =
                record.feedback
                    ? String(
                        record.feedback
                    ).trim()
                    : "";


            if (

                name === targetName &&

                feedback !== ""

            ) {

                matchedRecord =
                    record;

                break;

            }

        }


        console.log(
            "👤 學生：",
            targetName
        );


        if (matchedRecord) {

            console.log(
                "💬 找到評語：",
                matchedRecord.feedback
            );

            console.log(
                "📅 日期：",
                matchedRecord.date
            );

        } else {

            console.log(
                "⚠️ 找不到這位學生的評語"
            );

        }


        showFeedbackResult(
            matchedRecord
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
// 24. 顯示教師評語
// ============================================================

function showFeedbackResult(
    record
) {

    const app =
        document.getElementById("app");


    let feedbackHTML = "";


    if (

        record &&

        record.feedback &&

        String(record.feedback).trim() !== ""

    ) {

        feedbackHTML = `

            <div
                style="
                    text-align:left;
                    white-space:pre-wrap;
                    font-size:20px;
                    line-height:1.8;
                "
            >

                ${escapeHTML(
                    String(
                        record.feedback
                    ).trim()
                )}

            </div>

        `;

    } else {

        feedbackHTML = `

            <p
                style="
                    color:#777;
                "
            >

                目前尚無老師評語喔！

            </p>

        `;

    }


    const dateHTML =

        record && record.date

            ? `

                <span
                    style="
                        color:#777;
                        font-size:16px;
                    "
                >
                    ${escapeHTML(
                        String(record.date)
                    )}
                </span>

            `

            : "";


    app.innerHTML = `

        <h1>
            Teacher Feedback 💬
        </h1>


        <div
            style="
                text-align:left;
                background:rgba(0,0,0,0.05);
                padding:20px;
                border-radius:18px;
                margin-top:20px;
            "
        >


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:10px;
                    margin-bottom:15px;
                "
            >

                <strong
                    style="
                        font-size:22px;
                    "
                >
                    ${escapeHTML(
                        currentStudent.name
                    )}
                </strong>


                ${dateHTML}

            </div>


            <hr>


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
