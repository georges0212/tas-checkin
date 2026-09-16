```javascript
// ========================================
// TAS 打卡系統
// VS Code 完整版
// 一天只能 Clock In 一次
// ========================================


// ========================================
// Google Apps Script
// ========================================

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyYNfbGy5H-W7XKlnTBWFBcKzmwX041tIUuk3j8DjFGMOR0pSG_MZG3vo4Zxs3lGADcgw/exec";


// ========================================
// 照片專用 Google Apps Script
// ========================================

const PHOTO_UPLOAD_URL =
    "https://script.google.com/macros/s/AKfycby8PNvrI67ViPBKGeeaKDe0exeXoY2Eu2CHYErNKbxaqf_z3HrFVvWP3g8oJDrlga5MwA/exec";


// ========================================
// Teacher Feedback Google Apps Script
// ========================================

const FEEDBACK_URL =
    "https://script.google.com/macros/s/AKfycbyMYhHKfukCsebFG0JkDPh-0KjUTJDkQIwjSTBIgEonihoEeSqzM_L8UB2BNGY1Jfh6/exec";


// ========================================
// 學生資料
// ========================================

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


// ========================================
// 系統狀態
// ========================================

let currentStudent = null;

let selectedWorkplace = "";

let selectedPhotoFile = null;


// ========================================
// ⭐ 今天是否已經 Clock In
// ========================================

let todayAlreadyClockedIn = false;


// ========================================
// 輔助工具
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


// ========================================
// 清除教師評語空白
// ========================================

function cleanFeedbackText(text) {

    if (!text) {
        return "";
    }

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


// ========================================
// 日期
// ========================================

function formatDate(date) {

    const y =
        date.getFullYear();

    const m =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const d =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${y}-${m}-${d}`;

}


// ========================================
// 時間
// ========================================

function formatTime(date) {

    const h =
        String(
            date.getHours()
        ).padStart(2, "0");

    const m =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    const s =
        String(
            date.getSeconds()
        ).padStart(2, "0");

    return `${h}:${m}:${s}`;

}


// ========================================
// 教師評語日期解析
// ========================================

function parseFeedbackDate(dateValue) {

    if (
        dateValue === null ||
        dateValue === undefined ||
        dateValue === ""
    ) {

        return 0;

    }

    let value =
        String(dateValue).trim();

    value =
        value.replace(/\//g, "-");

    const match =
        value.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
        );

    if (match) {

        const year =
            Number(match[1]);

        const month =
            Number(match[2]);

        const day =
            Number(match[3]);

        const hour =
            Number(match[4] || 0);

        const minute =
            Number(match[5] || 0);

        const second =
            Number(match[6] || 0);

        return new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
            second
        ).getTime();

    }

    const parsed =
        new Date(value);

    if (!isNaN(parsed.getTime())) {

        return parsed.getTime();

    }

    return 0;

}


// ========================================
// 圖片壓縮
// ========================================

function compressImage(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    const img =
                        new Image();

                    img.onload =
                        function() {

                            const maxWidth = 1600;

                            let width =
                                img.width;

                            let height =
                                img.height;

                            if (
                                width >
                                maxWidth
                            ) {

                                height =
                                    Math.round(
                                        height *
                                        maxWidth /
                                        width
                                    );

                                width =
                                    maxWidth;

                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                width;

                            canvas.height =
                                height;

                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );

                            ctx.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );

                            canvas.toBlob(
                                function(blob) {

                                    if (!blob) {

                                        reject(
                                            new Error(
                                                "照片壓縮失敗"
                                            )
                                        );

                                        return;

                                    }

                                    resolve(blob);

                                },
                                "image/jpeg",
                                0.75
                            );

                        };

                    img.onerror =
                        function() {

                            reject(
                                new Error(
                                    "無法讀取照片"
                                )
                            );

                        };

                    img.src =
                        event.target.result;

                };

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "照片讀取失敗"
                        )
                    );

                };

            reader.readAsDataURL(file);

        }
    );

}


// ========================================
// Blob → Base64
// ========================================

function blobToBase64(blob) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onloadend =
                function() {

                    const result =
                        reader.result;

                    const base64 =
                        result.split(",")[1];

                    resolve(base64);

                };

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "照片轉換失敗"
                        )
                    );

                };

            reader.readAsDataURL(blob);

        }
    );

}


// ========================================
// ⭐ 檢查今天是否已經 Clock In
// ========================================

async function checkTodayClockIn() {

    if (!currentStudent) {

        return false;

    }

    const today =
        formatDate(
            new Date()
        );


    const url =
        SCRIPT_URL +
        "?action=checkClockIn" +
        "&studentName=" +
        encodeURIComponent(
            currentStudent.name
        ) +
        "&date=" +
        encodeURIComponent(
            today
        ) +
        "&nocache=" +
        Date.now();


    try {

        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "檢查打卡狀態 HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "🔍 今天打卡檢查結果：",
            result
        );


        if (
            result.status !==
            "success"
        ) {

            throw new Error(
                result.message ||
                "無法取得今天的打卡狀態"
            );

        }


        todayAlreadyClockedIn =
            result.alreadyClockedIn === true;


        return todayAlreadyClockedIn;

    }
    catch (error) {

        console.error(
            "Check Clock In Error:",
            error
        );

        throw error;

    }

}


// ========================================
// 首頁
// ========================================

function showHome() {

    currentStudent = null;

    selectedWorkplace = "";

    selectedPhotoFile = null;

    todayAlreadyClockedIn = false;


    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <h1>
            TAS 打卡系統
        </h1>

        <h2>
            Welcome! 歡迎使用！
        </h2>

        <p>
            Please select your name！
        </p>

        <p>
            選擇你的名字！
        </p>

        <div
            class="student-grid"
            id="students"
        ></div>

    `;


    const container =
        document.getElementById(
            "students"
        );


    students.forEach(
        function(student, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.textContent =
                `${student.icon} ${student.name}`;

            button.addEventListener(
                "click",
                function() {

                    showBirthdayVerification(
                        index
                    );

                }
            );

            container.appendChild(
                button
            );

        }
    );

}


// ========================================
// 生日驗證
// ========================================

function showBirthdayVerification(index) {

    currentStudent =
        students[index];


    todayAlreadyClockedIn = false;


    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <h1>
            Hello
            ${escapeHTML(
                currentStudent.name
            )}
            ! 👋
        </h1>

        <h2>
            Select your birthday
        </h2>

        <p>
            請選擇你的生日
        </p>

        <div>

            <select id="month">
                ${createMonthOptions()}
            </select>

            <select id="day">
                ${createDayOptions()}
            </select>

        </div>

        <br>

        <button id="verifyButton">
            Verify 驗證
        </button>

        <br><br>

        <button id="backButton">
            ⬅ Back 返回
        </button>

        <div
            id="error"
            class="error"
        ></div>

    `;


    document
        .getElementById(
            "verifyButton"
        )
        .addEventListener(
            "click",
            verifyBirthday
        );


    document
        .getElementById(
            "backButton"
        )
        .addEventListener(
            "click",
            showHome
        );

}


// ========================================
// 月份
// ========================================

function createMonthOptions() {

    let html = "";

    for (
        let i = 1;
        i <= 12;
        i++
    ) {

        html += `
            <option value="${i}">
                ${i} 月
            </option>
        `;

    }

    return html;

}


// ========================================
// 日期
// ========================================

function createDayOptions() {

    let html = "";

    for (
        let i = 1;
        i <= 31;
        i++
    ) {

        html += `
            <option value="${i}">
                ${i} 日
            </option>
        `;

    }

    return html;

}


// ========================================
// 驗證生日
// ========================================

function verifyBirthday() {

    const month =
        Number(
            document
                .getElementById(
                    "month"
                )
                .value
        );


    const day =
        Number(
            document
                .getElementById(
                    "day"
                )
                .value
        );


    const error =
        document.getElementById(
            "error"
        );


    if (
        month ===
            currentStudent.birthdayMonth
        &&
        day ===
            currentStudent.birthdayDay
    ) {

        error.textContent =
            "";

        showMainMenu();

    }

    else {

        error.textContent =
            "❌ Incorrect birthday 輸入錯誤";

    }

}


// ========================================
// 主選單
// ========================================

function showMainMenu() {

    selectedWorkplace = "";

    selectedPhotoFile = null;


    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <h1>
            Hello！哈囉！
        </h1>

        <h2>
            ${escapeHTML(
                currentStudent.name
            )}
            👋
        </h2>

        <p>
            What would you like to do?
        </p>

        <p>
            你要做什麼？
        </p>

        <div class="menu">

            <button id="startWorkButton">
                🟢 Start Work 開始工作
            </button>

            <button id="lunchButton">
                🍱 Lunch / Dinner 午餐／晚餐
            </button>

            <button id="finishWorkButton">
                🔴 Finish Work 打卡下班
            </button>

            <button id="feedbackButton">
                💬 Teacher Feedback 教師評語
            </button>

            <button id="logoutButton">
                ⬅ 回到學生選擇
            </button>

        </div>

    `;


    document
        .getElementById(
            "startWorkButton"
        )
        .addEventListener(
            "click",
            showStartWork
        );


    document
        .getElementById(
            "lunchButton"
        )
        .addEventListener(
            "click",
            showLunch
        );


    document
        .getElementById(
            "finishWorkButton"
        )
        .addEventListener(
            "click",
            showFinishWork
        );


    document
        .getElementById(
            "feedbackButton"
        )
        .addEventListener(
            "click",
            showFeedback
        );


    document
        .getElementById(
            "logoutButton"
        )
        .addEventListener(
            "click",
            showHome
        );

}


// ========================================
// ⭐ Start Work
// 進入前先檢查今天是否已經打卡
// ========================================

async function showStartWork() {

    selectedWorkplace = "";

    selectedPhotoFile = null;


    const app =
        document.getElementById(
            "app"
        );


    // ========================================
    // 先顯示檢查畫面
    // ========================================

    app.innerHTML = `

        <h1>
            Start Work 開始工作
        </h1>

        <div
            class="loading"
            style="
                margin:30px auto;
                max-width:500px;
                padding:30px;
                text-align:center;
            "
        >

            <h2>
                🔍 Checking...
            </h2>

            <p>
                正在確認今天是否已經打卡...
            </p>

        </div>

        <button id="backCheckingButton">
            ⬅ 返回主選單
        </button>

    `;


    document
        .getElementById(
            "backCheckingButton"
        )
        .addEventListener(
            "click",
            showMainMenu
        );


    try {

        const alreadyClockedIn =
            await checkTodayClockIn();


        // ========================================
        // ⭐ 已經打卡
        // ========================================

        if (alreadyClockedIn) {

            app.innerHTML = `

                <h1>
                    Start Work 開始工作
                </h1>

                <div
                    style="
                        max-width:600px;
                        margin:30px auto;
                        padding:35px 25px;
                        text-align:center;
                        background:#f8fafc;
                        border-radius:20px;
                        border:2px solid #e2e8f0;
                    "
                >

                    <div
                        style="
                            font-size:65px;
                            margin-bottom:15px;
                        "
                    >
                        ✅
                    </div>

                    <h2>
                        Today’s Clock In is completed!
                    </h2>

                    <h2>
                        今天已經完成上班打卡！
                    </h2>

                    <p>
                        你今天已經打卡過了。
                    </p>

                    <p>
                        每位學生每天只能 Clock In 一次。
                    </p>

                    <br>

                    <button id="backAlreadyButton">
                        ⬅ 返回主選單
                    </button>

                </div>

            `;


            document
                .getElementById(
                    "backAlreadyButton"
                )
                .addEventListener(
                    "click",
                    showMainMenu
                );


            return;

        }


        // ========================================
        // ⭐ 尚未打卡
        // 顯示原本的打卡畫面
        // ========================================

        showStartWorkForm();

    }

    catch (error) {

        app.innerHTML = `

            <h1>
                Start Work 開始工作
            </h1>

            <div class="error">

                <h2>
                    ❌ 無法確認打卡狀態
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <p>
                    請確認網路連線後再試一次。
                </p>

            </div>

            <br>

            <button id="backCheckErrorButton">
                ⬅ 返回主選單
            </button>

        `;


        document
            .getElementById(
                "backCheckErrorButton"
            )
            .addEventListener(
                "click",
                showMainMenu
            );

    }

}


// ========================================
// ⭐ Start Work 表單
// 只有今天尚未 Clock In 才會出現
// ========================================

function showStartWorkForm() {

    selectedWorkplace = "";

    selectedPhotoFile = null;


    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <h1>
            Start Work 開始工作
        </h1>

        <h2>
            Select your workplace
        </h2>

        <p>
            選擇你的職場
        </p>


        <div class="workplace-grid">

            <button id="storeButton">
                🛒 門市
            </button>

            <button id="restaurantButton">
                🍽 餐飲
            </button>

            <button id="hospitalButton">
                🏥 醫院
            </button>

            <button id="cleaningButton">
                🧹 清潔
            </button>

        </div>


        <p id="selectedWorkplace"></p>


        <div
            style="
                margin:25px auto;
                max-width:500px;
                padding:20px;
                background:#f8fafc;
                border-radius:18px;
                border:2px dashed #cbd5e1;
            "
        >

            <h3>
                📷 工作照片
            </h3>

            <p>
                上班打卡前必須拍照
            </p>

            <input
                id="workPhoto"
                type="file"
                accept="image/*"
                capture="environment"
            >

            <p
                id="photoStatus"
                style="
                    color:#64748b;
                    margin-top:12px;
                "
            >
                尚未選擇照片
            </p>

            <img
                id="photoPreview"
                style="
                    display:none;
                    max-width:100%;
                    max-height:300px;
                    margin:15px auto;
                    border-radius:12px;
                "
            >

        </div>


        <button
            id="clockInButton"
            style="display:none;"
        >
            🟢 Clock In 打卡上班
        </button>


        <br><br>


        <button id="backMenuButton">
            ⬅ 返回主選單
        </button>


        <div id="clockInMessage"></div>

    `;


    document
        .getElementById(
            "storeButton"
        )
        .addEventListener(
            "click",
            function() {

                chooseWorkplace("門市");

            }
        );


    document
        .getElementById(
            "restaurantButton"
        )
        .addEventListener(
            "click",
            function() {

                chooseWorkplace("餐飲");

            }
        );


    document
        .getElementById(
            "hospitalButton"
        )
        .addEventListener(
            "click",
            function() {

                chooseWorkplace("醫院");

            }
        );


    document
        .getElementById(
            "cleaningButton"
        )
        .addEventListener(
            "click",
            function() {

                chooseWorkplace("清潔");

            }
        );


    document
        .getElementById(
            "workPhoto"
        )
        .addEventListener(
            "change",
            handlePhotoSelect
        );


    document
        .getElementById(
            "clockInButton"
        )
        .addEventListener(
            "click",
            clockIn
        );


    document
        .getElementById(
            "backMenuButton"
        )
        .addEventListener(
            "click",
            showMainMenu
        );

}


// ========================================
// 選擇工作場所
// ========================================

function chooseWorkplace(workplace) {

    selectedWorkplace =
        workplace;


    document
        .getElementById(
            "selectedWorkplace"
        )
        .textContent =
            "Selected: " +
            workplace;


    updateClockInButton();

}


// ========================================
// 選擇照片
// ========================================

function handlePhotoSelect(event) {

    const file =
        event.target.files[0];


    const status =
        document.getElementById(
            "photoStatus"
        );


    const preview =
        document.getElementById(
            "photoPreview"
        );


    if (!file) {

        selectedPhotoFile = null;

        status.textContent =
            "尚未選擇照片";

        preview.style.display =
            "none";

        updateClockInButton();

        return;

    }


    if (
        !file.type.startsWith("image/")
    ) {

        selectedPhotoFile = null;

        status.textContent =
            "❌ 請選擇照片檔案";

        preview.style.display =
            "none";

        updateClockInButton();

        return;

    }


    selectedPhotoFile =
        file;


    status.innerHTML =
        "✅ 已選擇照片：<br>" +
        escapeHTML(file.name);


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            preview.src =
                e.target.result;

            preview.style.display =
                "block";

        };


    reader.readAsDataURL(file);


    updateClockInButton();

}


// ========================================
// 控制 Clock In 按鈕
// ========================================

function updateClockInButton() {

    const button =
        document.getElementById(
            "clockInButton"
        );


    if (!button) {
        return;
    }


    if (
        selectedWorkplace &&
        selectedPhotoFile &&
        !todayAlreadyClockedIn
    ) {

        button.style.display =
            "inline-block";

        button.disabled =
            false;

    }

    else {

        button.style.display =
            "none";

    }

}


// ========================================
// ⭐ Clock In
// ========================================

async function clockIn() {

    if (!currentStudent) {

        alert(
            "找不到學生資料"
        );

        return;

    }


    if (!selectedWorkplace) {

        alert(
            "請先選擇工作場所"
        );

        return;

    }


    if (!selectedPhotoFile) {

        alert(
            "📷 請先拍攝／選擇工作照片，才能打卡！"
        );

        return;

    }


    // ========================================
    // ⭐ 再檢查一次
    // 防止學生開兩個頁面／快速重複按
    // ========================================

    try {

        const alreadyClockedIn =
            await checkTodayClockIn();


        if (alreadyClockedIn) {

            todayAlreadyClockedIn =
                true;


            alert(
                "⛔ 今天已經完成上班打卡！"
            );


            showStartWork();

            return;

        }

    }
    catch (error) {

        alert(
            "無法確認今天的打卡狀態。\n" +
            "為避免重複打卡，系統暫時不會送出資料。"
        );

        return;

    }


    const now =
        new Date();


    const message =
        document.getElementById(
            "clockInMessage"
        );


    const clockButton =
        document.getElementById(
            "clockInButton"
        );


    clockButton.disabled =
        true;


    clockButton.textContent =
        "⏳ 照片上傳中...";


    message.innerHTML = `
        <div class="loading">
            📷 正在準備照片...
        </div>
    `;


    try {

        const originalFile =
            selectedPhotoFile;


        console.log(
            "📷 原始檔名：",
            originalFile.name
        );


        console.log(
            "📷 原始格式：",
            originalFile.type
        );


        console.log(
            "📷 原始大小：",
            originalFile.size
        );


        // ========================================
        // 建立照片檔名
        // ========================================

        const newPhotoFileName =
            formatDate(now) +
            "_" +
            currentStudent.name +
            "_" +
            originalFile.name;


        console.log(
            "📷 雲端檔名：",
            newPhotoFileName
        );


        // ========================================
        // 原始照片轉 Base64
        // ========================================

        const photoBase64 =
            await blobToBase64(
                originalFile
            );


        // ========================================
        // Clock In payload
        // ========================================

        const payload = {

            studentName:
                currentStudent.name,

            date:
                formatDate(now),

            clockInTime:
                formatTime(now),

            workplace:
                selectedWorkplace,

            photoBase64:
                photoBase64,

            photoMimeType:
                originalFile.type,

            photoFileName:
                newPhotoFileName

        };


        message.innerHTML = `
            <div class="loading">
                📝 正在儲存打卡資料...
            </div>
        `;


        // ========================================
        // ⭐ Clock In
        // ========================================

        const attendanceResponse =
            await fetch(
                SCRIPT_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!attendanceResponse.ok) {

            throw new Error(
                "打卡系統 HTTP " +
                attendanceResponse.status
            );

        }


        const attendanceResult =
            await attendanceResponse.json();


        console.log(
            "📝 Clock In API 回傳：",
            attendanceResult
        );


        // ========================================
        // ⭐⭐⭐ 後端發現重複
        // ========================================

        if (
            attendanceResult.alreadyClockedIn ===
            true
        ) {

            todayAlreadyClockedIn =
                true;


            throw new Error(
                attendanceResult.message ||
                "今天已經完成上班打卡！"
            );

        }


        if (
            attendanceResult.status !==
            "success"
        ) {

            throw new Error(
                attendanceResult.message ||
                "打卡資料儲存失敗"
            );

        }


        // ========================================
        // 成功
        // ========================================

        todayAlreadyClockedIn =
            true;


        message.innerHTML = `

            <div class="success">

                <h2>
                    ✅ Clock-in completed!
                </h2>

                <p>
                    打卡成功！
                </p>

                <p>
                    Student:
                    ${escapeHTML(
                        currentStudent.name
                    )}
                </p>

                <p>
                    Workplace:
                    ${escapeHTML(
                        selectedWorkplace
                    )}
                </p>

                <p>
                    Date:
                    ${formatDate(now)}
                </p>

                <p>
                    Time:
                    ${formatTime(now)}
                </p>

                <p>
                    📷 工作照片已上傳到雲端
                </p>

                <br>

                <button
                    id="backAfterClockIn"
                >
                    返回主選單
                </button>

            </div>

        `;


        clockButton.style.display =
            "none";


        selectedPhotoFile =
            null;


        document
            .getElementById(
                "backAfterClockIn"
            )
            .addEventListener(
                "click",
                showMainMenu
            );

    }

    catch (error) {

        console.error(
            "Clock In Error:",
            error
        );


        clockButton.disabled =
            false;


        clockButton.textContent =
            "🟢 Clock In 打卡上班";


        message.innerHTML = `

            <div class="error">

                <h2>
                    ❌ 打卡失敗
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


// ========================================
// Lunch / Dinner
// ========================================

function showLunch() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <h1>
            Lunch / Dinner 🍱
        </h1>

        <h2>
            午餐／晚餐
        </h2>

        <p>
            What did you eat?
        </p>

        <p>
            你今天吃什麼？
        </p>

        <input
            id="food"
            type="text"
            placeholder="Food 食物"
        >

        <br><br>

        <p>
            How much did you spend?
        </p>

        <p>
            你花了多少錢？
        </p>

        <input
            id="cost"
            type="number"
            min="0"
            step="1"
            placeholder="Cost 價錢"
        >

        <br><br>

        <button
            id="saveLunchButton"
        >
            💾 Save 儲存
        </button>

        <br><br>

        <button
            id="backLunchButton"
        >
            ⬅ 返回主選單
        </button>

        <div id="lunchMessage"></div>

    `;


    document
        .getElementById(
            "saveLunchButton"
        )
        .addEventListener(
            "click",
            saveLunch
        );


    document
        .getElementById(
            "backLunchButton"
        )
        .addEventListener(
            "click",
            showMainMenu
        );

}


// ========================================
// 儲存午餐
// ========================================

async function saveLunch() {

    const food =
        document
            .getElementById(
                "food"
            )
            .value
            .trim();


    const cost =
        document
            .getElementById(
                "cost"
            )
            .value
            .trim();


    const message =
        document.getElementById(
            "lunchMessage"
        );


    const saveButton =
        document.getElementById(
            "saveLunchButton"
        );


    if (!food) {

        message.innerHTML = `
            <div class="error">
                ❌ 請輸入吃了什麼
            </div>
        `;

        return;

    }


    if (!cost) {

        message.innerHTML = `
            <div class="error">
                ❌ 請輸入花費金額
            </div>
        `;

        return;

    }


    const now =
        new Date();


    const payload = {

        studentName:
            currentStudent.name,

        date:
            formatDate(now),

        mealTime:
            formatTime(now),

        food:
            food,

        cost:
            cost

    };


    saveButton.disabled =
        true;


    saveButton.textContent =
        "⏳ 儲存中...";


    message.innerHTML = `
        <div class="loading">
            正在儲存資料...
        </div>
    `;


    try {

        const response =
            await fetch(
                SCRIPT_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            result.status !==
            "success"
        ) {

            throw new Error(
                result.message ||
                "儲存失敗"
            );

        }


        message.innerHTML = `

            <div class="success">

                <h2>
                    ✅ Saved!
                </h2>

                <p>
                    午餐／晚餐紀錄成功！
                </p>

                <p>
                    Student:
                    ${escapeHTML(
                        currentStudent.name
                    )}
                </p>

                <p>
                    Food:
                    ${escapeHTML(
                        food
                    )}
                </p>

                <p>
                    Cost:
                    $${escapeHTML(
                        cost
                    )}
                </p>

                <p>
                    Time:
                    ${formatTime(now)}
                </p>

                <br>

                <button
                    id="backAfterLunch"
                >
                    返回主選單
                </button>

            </div>

        `;


        saveButton.style.display =
            "none";


        document
            .getElementById(
                "backAfterLunch"
            )
            .addEventListener(
                "click",
                showMainMenu
            );

    }

    catch (error) {

        console.error(
            "Lunch Error:",
            error
        );


        saveButton.disabled =
            false;


        saveButton.textContent =
            "💾 Save 儲存";


        message.innerHTML = `

            <div class="error">

                <h2>
                    ❌ 儲存失敗
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


// ========================================
// Finish Work
// ========================================

function showFinishWork() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <h1>
            Finish Work 🔴
        </h1>

        <h2>
            打卡下班
        </h2>

        <p>
            Ready to finish work?
        </p>

        <p>
            準備下班了嗎？
        </p>

        <br>

        <button
            id="clockOutButton"
        >
            🔴 Clock Out 打卡下班
        </button>

        <br><br>

        <button
            id="backFinishButton"
        >
            ⬅ 返回主選單
        </button>

        <div id="clockOutMessage"></div>

    `;


    document
        .getElementById(
            "clockOutButton"
        )
        .addEventListener(
            "click",
            clockOut
        );


    document
        .getElementById(
            "backFinishButton"
        )
        .addEventListener(
            "click",
            showMainMenu
        );

}


// ========================================
// Clock Out
// ========================================

async function clockOut() {

    if (!currentStudent) {

        alert(
            "找不到學生資料"
        );

        return;

    }


    const now =
        new Date();


    const payload = {

        studentName:
            currentStudent.name,

        date:
            formatDate(now),

        clockOutTime:
            formatTime(now)

    };


    const button =
        document.getElementById(
            "clockOutButton"
        );


    const message =
        document.getElementById(
            "clockOutMessage"
        );


    button.disabled =
        true;


    button.textContent =
        "⏳ 打卡中...";


    message.innerHTML = `
        <div class="loading">
            正在傳送下班資料...
        </div>
    `;


    try {

        const response =
            await fetch(
                SCRIPT_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            result.status !==
            "success"
        ) {

            throw new Error(
                result.message ||
                "打卡失敗"
            );

        }


        message.innerHTML = `

            <div class="success">

                <h2>
                    ✅ Clock-out completed!
                </h2>

                <p>
                    下班打卡成功！
                </p>

                <p>
                    Student:
                    ${escapeHTML(
                        currentStudent.name
                    )}
                </p>

                <p>
                    Date:
                    ${formatDate(now)}
                </p>

                <p>
                    Time:
                    ${formatTime(now)}
                </p>

                <br>

                <button
                    id="backAfterClockOut"
                >
                    返回主選單
                </button>

            </div>

        `;


        button.style.display =
            "none";


        document
            .getElementById(
                "backAfterClockOut"
            )
            .addEventListener(
                "click",
                showMainMenu
            );

    }

    catch (error) {

        console.error(
            "Clock Out Error:",
            error
        );


        button.disabled =
            false;


        button.textContent =
            "🔴 Clock Out 打卡下班";


        message.innerHTML = `

            <div class="error">

                <h2>
                    ❌ 打卡失敗
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


// ========================================
// Teacher Feedback
// ========================================

function showFeedback() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <h1>
            Teacher Feedback 💬
        </h1>

        <h2>
            教師評語
        </h2>

        <div
            id="feedbackMessage"
            class="loading"
        >
            ⏳ 讀取所有評語中...
        </div>

        <br>

        <button
            id="backFeedbackButton"
        >
            ⬅ 返回主選單
        </button>

    `;


    document
        .getElementById(
            "backFeedbackButton"
        )
        .addEventListener(
            "click",
            showMainMenu
        );


    fetchFeedback();

}


// ========================================
// 取得教師評語
// ========================================

async function fetchFeedback() {

    const message =
        document.getElementById(
            "feedbackMessage"
        );


    try {

        const url =
            FEEDBACK_URL +
            "?nocache=" +
            Date.now();


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Teacher Feedback API 回傳的不是陣列"
            );

        }


        if (!currentStudent) {

            throw new Error(
                "目前沒有登入學生"
            );

        }


        const targetName =
            String(
                currentStudent.name
            ).trim();


        const records =
            data

                .map(
                    function(record) {

                        const studentName =
                            String(
                                record.studentName ||
                                ""
                            ).trim();


                        const date =
                            String(
                                record.date ||
                                ""
                            ).trim();


                        const feedback =
                            cleanFeedbackText(
                                record.feedback ||
                                record.teacherFeedback ||
                                ""
                            );


                        return {

                            studentName:
                                studentName,

                            date:
                                date,

                            feedback:
                                feedback

                        };

                    }
                )

                .filter(
                    function(record) {

                        return (
                            record.studentName ===
                            targetName
                            &&
                            record.feedback !== ""
                        );

                    }
                );


        if (records.length === 0) {

            message.className = "";

            message.innerHTML = `

                <div
                    style="
                        max-width:600px;
                        margin:0 auto;
                        padding:35px 20px;
                        text-align:center;
                        background:#f8fafc;
                        border-radius:18px;
                        border:1px solid #e2e8f0;
                    "
                >

                    <div
                        style="
                            font-size:55px;
                        "
                    >
                        💬
                    </div>

                    <h2>
                        目前尚無老師評語
                    </h2>

                    <p>
                        老師還沒有留下評語喔！
                    </p>

                </div>

            `;

            return;

        }


        records.sort(
            function(a, b) {

                return (
                    parseFeedbackDate(b.date)
                    -
                    parseFeedbackDate(a.date)
                );

            }
        );


        const groupedRecords = {};


        records.forEach(
            function(record) {

                let displayDate =
                    record.date ||
                    "日期未提供";


                displayDate =
                    String(displayDate)
                        .trim()
                        .replace(/\//g, "-");


                if (
                    !groupedRecords[
                        displayDate
                    ]
                ) {

                    groupedRecords[
                        displayDate
                    ] = [];

                }


                groupedRecords[
                    displayDate
                ].push(record);

            }
        );


        const sortedDates =
            Object.keys(
                groupedRecords
            )
            .sort(
                function(a, b) {

                    return (
                        parseFeedbackDate(b)
                        -
                        parseFeedbackDate(a)
                    );

                }
            );


        let feedbackHTML = "";


        sortedDates.forEach(
            function(date) {

                const dateRecords =
                    groupedRecords[
                        date
                    ];


                feedbackHTML += `

                    <div
                        style="
                            margin-bottom:30px;
                        "
                    >

                        <div
                            style="
                                background:
                                    linear-gradient(
                                        135deg,
                                        #2563eb,
                                        #3b82f6
                                    );
                                color:white;
                                padding:14px 20px;
                                border-radius:14px;
                                font-size:18px;
                                font-weight:bold;
                                margin-bottom:14px;
                                box-shadow:
                                    0 3px 10px
                                    rgba(
                                        37,
                                        99,
                                        235,
                                        0.20
                                    );
                            "
                        >
                            📅 ${escapeHTML(date)}
                        </div>

                `;


                dateRecords.forEach(
                    function(record, index) {

                        feedbackHTML += `

                            <div
                                style="
                                    background:#ffffff;
                                    padding:20px;
                                    margin-bottom:12px;
                                    border-radius:16px;
                                    border:1px solid #dbeafe;
                                    box-shadow:
                                        0 3px 10px
                                        rgba(
                                            0,
                                            0,
                                            0,
                                            0.07
                                        );
                                    text-align:left;
                                "
                            >

                                <div
                                    style="
                                        color:#64748b;
                                        font-size:13px;
                                        margin-bottom:10px;
                                    "
                                >
                                    💬 第 ${index + 1} 則評語
                                </div>

                                <div
                                    style="
                                        font-size:16px;
                                        color:#1e293b;
                                        line-height:1.7;
                                        white-space:pre-line;
                                        overflow-wrap:break-word;
                                        word-break:break-word;
                                    "
                                >
                                    ${escapeHTML(
                                        record.feedback
                                    )}
                                </div>

                            </div>

                        `;

                    }
                );


                feedbackHTML += `

                    </div>

                `;

            }
        );


        message.className = "";


        message.innerHTML = `

            <div
                style="
                    max-width:600px;
                    margin:0 auto;
                "
            >

                ${feedbackHTML}

            </div>

        `;

    }

    catch (error) {

        console.error(
            "Fetch Feedback Error:",
            error
        );


        message.className =
            "error";


        message.innerHTML = `

            <h2>
                ❌ 讀取評語失敗
            </h2>

            <p>
                ${escapeHTML(
                    error.message
                )}
            </p>

        `;

    }

}


// ========================================
// 初始化
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    showHome
);
```
