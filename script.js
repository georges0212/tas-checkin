```javascript
// ========================================
// TAS 打卡系統
// VS Code 完整版
//
// 前端只有一個 script.js
//
// 但是後端維持兩套 Google Apps Script：
//
// ① TAS GAS
//    - Clock In
//    - 工作照片
//    - Lunch / Dinner
//    - Clock Out
//
// ② Teacher Feedback GAS
//    - 教師評語
//
// 兩套 GAS 完全獨立，不合併。
// ========================================


// ========================================
// ① TAS 打卡 Google Apps Script
// ========================================

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCM5fWJvQZkEmA2Jqt85p_tGf0n4ZkfrPS8Uw6dPTAMNcdACRf2YMmpw1QXY2_wUFQ/exec";


// ========================================
// ② Teacher Feedback Google Apps Script
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
// HTML 安全處理
// ========================================

function escapeHTML(str) {

    if (!str) {
        return "";
    }

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ========================================
// 教師評語文字清理
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
// ⭐ 圖片壓縮
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

                            const maxWidth =
                                1600;


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
// ⭐ Blob → Base64
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


                    if (!result) {

                        reject(
                            new Error(
                                "照片轉換失敗"
                            )
                        );

                        return;

                    }


                    const parts =
                        result.split(",");


                    if (parts.length < 2) {

                        reject(
                            new Error(
                                "無法取得照片 Base64"
                            )
                        );

                        return;

                    }


                    const base64 =
                        parts[1];


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
// ⭐ TAS GAS 共用 POST 函式
//
// 這裡只負責連接「TAS 打卡 GAS」
//
// Teacher Feedback 不會使用這個函式。
// ========================================

async function postToTAS(payload) {

    console.log(
        "📤 TAS GAS 傳送資料：",
        payload
    );


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


    console.log(
        "📡 TAS GAS HTTP Status：",
        response.status
    );


    const text =
        await response.text();


    console.log(
        "📥 TAS GAS 原始回傳：",
        text
    );


    let result;


    try {

        result =
            JSON.parse(text);

    }

    catch (parseError) {

        throw new Error(
            "Google Apps Script 回傳的不是 JSON：" +
            text.substring(0, 300)
        );

    }


    console.log(
        "📥 TAS GAS JSON 回傳：",
        result
    );


    if (!response.ok) {

        throw new Error(
            "HTTP " +
            response.status
        );

    }


    // ====================================
    // 同時支援：
    //
    // success: true
    //
    // 或
    //
    // status: "success"
    //
    // 讓前後端比較不容易因格式不同而失敗。
    // ====================================

    const isSuccess =
        (
            result &&
            result.success === true
        )
        ||
        (
            result &&
            result.status === "success"
        );


    if (!isSuccess) {

        throw new Error(
            result &&
            result.message
                ? result.message
                : "Google Apps Script 儲存失敗"
        );

    }


    return result;

}


// ========================================
// 首頁
// ========================================

function showHome() {

    currentStudent = null;

    selectedWorkplace = "";

    selectedPhotoFile = null;


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
// Start Work
// ========================================

function showStartWork() {

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


        <!-- =================================
             工作照片
        ================================== -->

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


    // ========================================
    // 工作場所
    // ========================================

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


    // ========================================
    // 照片
    // ========================================

    document
        .getElementById(
            "workPhoto"
        )
        .addEventListener(
            "change",
            handlePhotoSelect
        );


    // ========================================
    // Clock In
    // ========================================

    document
        .getElementById(
            "clockInButton"
        )
        .addEventListener(
            "click",
            clockIn
        );


    // ========================================
    // 返回
    // ========================================

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


    const selected =
        document.getElementById(
            "selectedWorkplace"
        );


    if (selected) {

        selected.textContent =
            "Selected: " +
            workplace;

    }


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


    // ====================================
    // 必須是圖片
    // ====================================

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


    // ====================================
    // 顯示照片預覽
    // ====================================

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
        selectedPhotoFile
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
//
// 使用：① TAS GAS
// ========================================

async function clockIn() {

    // ----------------------------------------
    // 檢查學生
    // ----------------------------------------

    if (!currentStudent) {

        alert(
            "找不到學生資料"
        );

        return;

    }


    // ----------------------------------------
    // 檢查工作場所
    // ----------------------------------------

    if (!selectedWorkplace) {

        alert(
            "請先選擇工作場所"
        );

        return;

    }


    // ----------------------------------------
    // 檢查照片
    // ----------------------------------------

    if (!selectedPhotoFile) {

        alert(
            "📷 請先拍攝／選擇工作照片，才能打卡！"
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


    if (!clockButton) {
        return;
    }


    // ----------------------------------------
    // 開始處理
    // ----------------------------------------

    clockButton.disabled =
        true;

    clockButton.textContent =
        "⏳ 照片處理中...";


    message.innerHTML = `

        <div class="loading">

            📷 正在處理工作照片...

        </div>

    `;


    try {

        // ====================================
        // 1. 壓縮照片
        // ====================================

        console.log(
            "📷 原始照片大小：",
            selectedPhotoFile.size
        );


        const compressedBlob =
            await compressImage(
                selectedPhotoFile
            );


        console.log(
            "📷 壓縮後照片大小：",
            compressedBlob.size
        );


        message.innerHTML = `

            <div class="loading">

                📷 照片處理完成<br>
                ⏳ 正在準備上傳...

            </div>

        `;


        // ====================================
        // 2. Base64
        // ====================================

        const photoBase64 =
            await blobToBase64(
                compressedBlob
            );


        console.log(
            "📷 Base64 長度：",
            photoBase64.length
        );


        console.log(
            "📷 Base64 前 50 字元：",
            photoBase64.substring(
                0,
                50
            )
        );


        // ====================================
        // 3. 建立 Payload
        // ====================================

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
                "image/jpeg"

        };


        console.log(
            "📤 準備傳送 Clock In：",
            {
                studentName:
                    payload.studentName,

                date:
                    payload.date,

                clockInTime:
                    payload.clockInTime,

                workplace:
                    payload.workplace,

                photoBase64Length:
                    payload.photoBase64.length

            }
        );


        // ====================================
        // 4. 傳送 TAS GAS
        // ====================================

        message.innerHTML = `

            <div class="loading">

                📤 正在上傳照片與簽到資料...<br>
                請不要關閉頁面

            </div>

        `;


        const result =
            await postToTAS(
                payload
            );


        // ====================================
        // 5. 成功
        // ====================================

        console.log(
            "✅ Clock In 成功：",
            result
        );


        console.log(
            "📷 Drive File ID：",
            result.photoFileId ||
            result.photoFileID ||
            result.fileId ||
            ""
        );


        console.log(
            "📷 Drive URL：",
            result.photoUrl ||
            result.fileUrl ||
            ""
        );


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
                    📷 工作照片已成功上傳
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
            "❌ Clock In Error:",
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

                <p>
                    請確認網路連線及 Google Apps Script 設定。
                </p>

            </div>

        `;

    }

}


// ========================================
// Lunch / Dinner
//
// 使用：① TAS GAS
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
// 儲存午餐／晚餐
//
// 使用：① TAS GAS
// ========================================

async function saveLunch() {

    if (!currentStudent) {

        alert(
            "找不到學生資料"
        );

        return;

    }


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

        // ====================================
        // 使用 TAS GAS
        // ====================================

        const result =
            await postToTAS(
                payload
            );


        console.log(
            "✅ Lunch 成功：",
            result
        );


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
            "❌ Lunch Error:",
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
//
// 使用：① TAS GAS
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


    if (!button) {
        return;
    }


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

        // ====================================
        // 使用 TAS GAS
        // ====================================

        const result =
            await postToTAS(
                payload
            );


        console.log(
            "✅ Clock Out 成功：",
            result
        );


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
            "❌ Clock Out Error:",
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
//
// 注意：
// 這裡完全使用「② Teacher Feedback GAS」
//
// 不使用 SCRIPT_URL。
// 不使用 TAS GAS。
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
//
// 使用：② Teacher Feedback GAS
// ========================================

async function fetchFeedback() {

    const message =
        document.getElementById(
            "feedbackMessage"
        );


    try {

        if (!currentStudent) {

            throw new Error(
                "目前沒有登入學生"
            );

        }


        // ====================================
        // 防止瀏覽器快取
        // ====================================

        const url =
            FEEDBACK_URL +
            "?nocache=" +
            Date.now();


        console.log(
            "📤 讀取 Teacher Feedback GAS：",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        console.log(
            "📡 Teacher Feedback HTTP Status：",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        // ====================================
        // 讀取回傳文字
        // ====================================

        const text =
            await response.text();


        console.log(
            "📥 Teacher Feedback 原始回傳：",
            text
        );


        let data;


        try {

            data =
                JSON.parse(text);

        }

        catch (parseError) {

            throw new Error(
                "Teacher Feedback API 回傳的不是 JSON：" +
                text.substring(0, 300)
            );

        }


        console.log(
            "📥 Teacher Feedback JSON：",
            data
        );


        // ====================================
        // 確認是陣列
        // ====================================

        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Teacher Feedback API 回傳的不是陣列"
            );

        }


        // ====================================
        // 目前學生
        // ====================================

        const targetName =
            String(
                currentStudent.name
            ).trim();


        // ====================================
        // 整理資料
        // ====================================

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


        console.log(
            "💬 目前學生評語數量：",
            records.length
        );


        // ====================================
        // 沒有評語
        // ====================================

        if (
            records.length === 0
        ) {

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


        // ====================================
        // 日期排序
        // 最新日期在前面
        // ====================================

        records.sort(
            function(a, b) {

                const dateA =
                    parseFeedbackDate(
                        a.date
                    );


                const dateB =
                    parseFeedbackDate(
                        b.date
                    );


                return dateB - dateA;

            }
        );


        // ====================================
        // 依日期分組
        // ====================================

        const groupedRecords = {};


        records.forEach(
            function(record) {

                let displayDate =
                    record.date ||
                    "日期未提供";


                displayDate =
                    String(displayDate)
                        .trim()
                        .replace(
                            /\//g,
                            "-"
                        );


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


        // ====================================
        // 日期排序
        // ====================================

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


        let feedbackHTML =
            "";


        // ====================================
        // 建立評語畫面
        // ====================================

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


        // ====================================
        // 顯示評語
        // ====================================

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
            "❌ Fetch Feedback Error:",
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
    function() {

        console.log(
            "🚀 TAS App 啟動"
        );

        console.log(
            "📌 TAS GAS：",
            SCRIPT_URL
        );

        console.log(
            "📌 Teacher Feedback GAS：",
            FEEDBACK_URL
        );

        showHome();

    }
);
```
