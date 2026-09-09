// ========================================
// TAS 打卡系統
// ========================================


// ========================================
// Google Apps Script
// ========================================

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCM5fWJvQZkEmA2Jqt85p_tGf0n4ZkfrPS8Uw6dPTAMNcdACRf2YMmpw1QXY2_wUFQ/exec";


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


// ========================================
// ⭐ 清除教師評語多餘空白
// ========================================

function cleanFeedbackText(text) {

    if (!text) {
        return "";
    }


    return String(text)

        // 把 Windows 換行統一
        .replace(/\r\n/g, "\n")

        // 把單獨的 \r 統一
        .replace(/\r/g, "\n")

        // 清除每一行最前面的空白
        .replace(/^[ \t]+/gm, "")

        // 清除每一行最後面的空白
        .replace(/[ \t]+$/gm, "")

        // 最前面多餘空白行刪掉
        .replace(/^\n+/, "")

        // 最後面多餘空白行刪掉
        .replace(/\n+$/, "")

        // 避免連續太多空白行
        .replace(/\n{3,}/g, "\n\n")

        .trim();

}


// ========================================
// 日期格式
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
// 時間格式
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
// ⭐ 教師評語日期解析
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
        String(dateValue)
            .trim();


    // ------------------------------------
    // Google Sheet 常見格式
    // 2026/09/08
    // 2026-09-08
    // ------------------------------------

    value =
        value.replace(
            /\//g,
            "-"
        );


    // ------------------------------------
    // 如果是
    // 2026-09-08 10:30:00
    // ------------------------------------

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


    // ------------------------------------
    // 嘗試一般日期格式
    // ------------------------------------

    const parsed =
        new Date(value);


    if (
        !isNaN(
            parsed.getTime()
        )
    ) {

        return parsed.getTime();

    }


    // ------------------------------------
    // 無法解析
    // 放到最後面
    // ------------------------------------

    return 0;

}


// ========================================
// 首頁
// ========================================

function showHome() {

    currentStudent = null;

    selectedWorkplace = "";


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
        (student, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.textContent =
                `${student.icon} ${student.name}`;


            button.addEventListener(
                "click",
                () => {

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
// 月份選項
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
// 日期選項
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


        <p
            id="selectedWorkplace"
            style="
                font-weight:bold;
                font-size:18px;
                margin-top:20px;
            "
        ></p>


        <!-- ================================= -->
        <!-- 📷 照片上傳 -->
        <!-- ================================= -->

        <div
            id="photoSection"
            style="
                margin-top:25px;
                padding:20px;
                background:#f8fafc;
                border-radius:18px;
                border:1px solid #e2e8f0;
            "
        >

            <h3>
                📷 工作照片
            </h3>

            <p>
                請拍攝或選擇今天的工作照片
            </p>

            <input
                id="workPhotoInput"
                type="file"
                accept="image/*"
                capture="environment"
                style="
                    width:100%;
                    max-width:400px;
                "
            >

            <div
                id="photoPreview"
                style="
                    margin-top:15px;
                "
            ></div>

        </div>


        <br>


        <!-- ================================= -->
        <!-- Clock In -->
        <!-- ================================= -->

        <button
            id="clockInButton"
            style="
                display:none;
            "
        >
            🟢 Clock In 打卡上班
        </button>


        <br><br>


        <button id="backMenuButton">
            ⬅ 返回主選單
        </button>


        <div
            id="clockInMessage"
            style="
                margin-top:20px;
            "
        ></div>

    `;


    // ========================================
    // 工作場所按鈕
    // ========================================

    document
        .getElementById(
            "storeButton"
        )
        .addEventListener(
            "click",
            () => chooseWorkplace("門市")
        );


    document
        .getElementById(
            "restaurantButton"
        )
        .addEventListener(
            "click",
            () => chooseWorkplace("餐飲")
        );


    document
        .getElementById(
            "hospitalButton"
        )
        .addEventListener(
            "click",
            () => chooseWorkplace("醫院")
        );


    document
        .getElementById(
            "cleaningButton"
        )
        .addEventListener(
            "click",
            () => chooseWorkplace("清潔")
        );


    // ========================================
    // 照片選擇
    // ========================================

    document
        .getElementById(
            "workPhotoInput"
        )
        .addEventListener(
            "change",
            handleWorkPhoto
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

function chooseWorkplace(
    workplace
) {

    selectedWorkplace =
        workplace;


    const selectedElement =
        document.getElementById(
            "selectedWorkplace"
        );


    if (selectedElement) {

        selectedElement.textContent =
            "Selected: " +
            workplace;

    }


    updateClockInButton();

}


// ========================================
// 📷 儲存照片資料
// ========================================

let selectedWorkPhoto = null;


// ========================================
// 📷 處理工作照片
// ========================================

function handleWorkPhoto(
    event
) {

    const file =
        event.target.files &&
        event.target.files[0];


    const preview =
        document.getElementById(
            "photoPreview"
        );


    if (!file) {

        selectedWorkPhoto = null;

        if (preview) {

            preview.innerHTML = "";

        }

        updateClockInButton();

        return;

    }


    // ====================================
    // 確認是不是圖片
    // ====================================

    if (
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "請選擇照片檔案"
        );

        event.target.value = "";

        selectedWorkPhoto = null;

        updateClockInButton();

        return;

    }


    // ====================================
    // 顯示原始照片預覽
    // ====================================

    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            if (!preview) {
                return;
            }


            preview.innerHTML = `

                <div
                    style="
                        text-align:center;
                    "
                >

                    <img
                        src="${e.target.result}"
                        alt="工作照片預覽"
                        style="
                            max-width:100%;
                            max-height:300px;
                            border-radius:14px;
                            object-fit:contain;
                            box-shadow:
                                0 4px 15px
                                rgba(0,0,0,0.15);
                        "
                    >

                    <p
                        style="
                            color:#475569;
                            font-size:14px;
                            margin-top:10px;
                        "
                    >
                        📷 ${escapeHTML(file.name)}
                    </p>

                    <p
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        原始大小：
                        ${formatFileSize(file.size)}
                    </p>

                </div>

            `;

        };


    reader.readAsDataURL(file);


    // ====================================
    // ⭐ 照片壓縮
    // ====================================

    compressWorkPhoto(
        file
    )
    .then(
        function(compressedFile) {

            selectedWorkPhoto =
                compressedFile;


            console.log(
                "📷 原始照片：",
                file.size,
                "bytes"
            );


            console.log(
                "📷 壓縮後照片：",
                compressedFile.size,
                "bytes"
            );


            updateClockInButton();

        }
    )
    .catch(
        function(error) {

            console.error(
                "照片處理失敗：",
                error
            );


            selectedWorkPhoto = null;


            alert(
                "照片處理失敗，請重新選擇照片"
            );


            updateClockInButton();

        }
    );

}


// ========================================
// 📷 壓縮照片
// ========================================

function compressWorkPhoto(
    file
) {

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

                            // =================================
                            // 最大寬高
                            // =================================

                            const MAX_WIDTH =
                                1280;

                            const MAX_HEIGHT =
                                1280;


                            let width =
                                img.width;


                            let height =
                                img.height;


                            // =================================
                            // 等比例縮小
                            // =================================

                            if (
                                width >
                                MAX_WIDTH
                            ) {

                                height =
                                    height *
                                    (
                                        MAX_WIDTH /
                                        width
                                    );

                                width =
                                    MAX_WIDTH;

                            }


                            if (
                                height >
                                MAX_HEIGHT
                            ) {

                                width =
                                    width *
                                    (
                                        MAX_HEIGHT /
                                        height
                                    );

                                height =
                                    MAX_HEIGHT;

                            }


                            // =================================
                            // Canvas
                            // =================================

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                Math.round(
                                    width
                                );


                            canvas.height =
                                Math.round(
                                    height
                                );


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            ctx.drawImage(
                                img,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );


                            // =================================
                            // JPEG
                            // =================================

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


                                    // =================================
                                    // 建立新的 File
                                    // =================================

                                    const compressedFile =
                                        new File(
                                            [
                                                blob
                                            ],
                                            "work-photo.jpg",
                                            {
                                                type:
                                                    "image/jpeg"
                                            }
                                        );


                                    resolve(
                                        compressedFile
                                    );

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
                            "無法讀取照片檔案"
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ========================================
// 📷 更新 Clock In 按鈕
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
        selectedWorkPhoto
    ) {

        button.style.display =
            "inline-block";


        button.disabled =
            false;


        button.textContent =
            "🟢 Clock In 打卡上班";

    }

    else {

        button.style.display =
            "none";

    }

}


// ========================================
// 📷 檔案大小格式
// ========================================

function formatFileSize(
    bytes
) {

    if (
        !bytes ||
        bytes <= 0
    ) {

        return "0 KB";

    }


    const kb =
        bytes / 1024;


    if (kb < 1024) {

        return (
            kb.toFixed(1) +
            " KB"
        );

    }


    const mb =
        kb / 1024;


    return (
        mb.toFixed(2) +
        " MB"
    );

}


// ========================================
// Clock In
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


    if (!selectedWorkPhoto) {

        alert(
            "📷 請先拍攝或選擇工作照片"
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
        "⏳ 照片處理中...";


    message.innerHTML = `

        <div class="loading">

            📷 正在處理照片...

        </div>

    `;


    try {

        // ====================================
        // 📷 File → Base64
        // ====================================

        const photoBase64 =
            await fileToBase64(
                selectedWorkPhoto
            );


        console.log(
            "================================"
        );


        console.log(
            "📷 PHOTO TEST"
        );


        console.log(
            "學生：",
            currentStudent.name
        );


        console.log(
            "工作場所：",
            selectedWorkplace
        );


        console.log(
            "照片是否存在：",
            !!selectedWorkPhoto
        );


        console.log(
            "壓縮照片大小：",
            selectedWorkPhoto.size
        );


        console.log(
            "Base64 長度：",
            photoBase64.length
        );


        console.log(
            "MIME Type：",
            "image/jpeg"
        );


        console.log(
            "================================"
        );


        // ====================================
        // Payload
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


        message.innerHTML = `

            <div class="loading">

                📤 正在上傳打卡資料與照片...

            </div>

        `;


        // ====================================
        // POST
        // ====================================

        const response =
            await fetch(
                SCRIPT_URL,
                {

                    method:
                        "POST",

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


        // ====================================
        // 讀取 Apps Script 回傳
        // ====================================

        const result =
            await response.json();


        console.log(
            "Google Apps Script 回傳：",
            result
        );


        if (
            result.status !==
            "success"
        ) {

            throw new Error(
                result.message ||
                "Google Apps Script 上傳失敗"
            );

        }


        // ====================================
        // 成功
        // ====================================

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
                    📷 工作照片已上傳
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
// 📷 File → Base64
// ========================================

function fileToBase64(
    file
) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function() {

                    const result =
                        String(
                            reader.result ||
                            ""
                        );


                    // =================================
                    // data:image/jpeg;base64,XXXX
                    //
                    // 我們只要逗號後面的 Base64
                    // =================================

                    const commaIndex =
                        result.indexOf(",");


                    if (
                        commaIndex ===
                        -1
                    ) {

                        reject(
                            new Error(
                                "照片 Base64 格式錯誤"
                            )
                        );

                        return;

                    }


                    const base64 =
                        result.substring(
                            commaIndex + 1
                        );


                    if (!base64) {

                        reject(
                            new Error(
                                "照片 Base64 是空的"
                            )
                        );

                        return;

                    }


                    resolve(
                        base64
                    );

                };


            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "照片轉換失敗"
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

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
// 💬 Teacher Feedback
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

        // ====================================
        // 防止快取
        // ====================================

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


        console.log(
            "Teacher Feedback API 原始資料：",
            data
        );


        // ====================================
        // 確認 API 回傳是不是陣列
        // ====================================

        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Teacher Feedback API 回傳的不是陣列"
            );

        }


        // ====================================
        // 確認目前登入學生
        // ====================================

        if (!currentStudent) {

            throw new Error(
                "目前沒有登入學生"
            );

        }


        const targetName =
            String(
                currentStudent.name
            )
            .trim();


        console.log(
            "目前學生：",
            targetName
        );


        // ====================================
        // 找出目前學生的所有評語
        // ====================================

        const records =
            data

                .map(
                    function(record) {

                        const studentName =
                            String(
                                record.studentName ||
                                ""
                            )
                            .trim();


                        const date =
                            String(
                                record.date ||
                                ""
                            )
                            .trim();


                        // ⭐ 清除評語前後及每行多餘空格

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
            "找到全部評語：",
            records
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
        // ⭐⭐⭐ 最重要的排序 ⭐⭐⭐
        //
        // 最新日期 → 最舊日期
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


        console.log(
            "⭐ 排序後評語：",
            records
        );


        // ====================================
        // ⭐ 依日期分組
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
        // ⭐ 日期排序
        // 最新 → 最舊
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


        // ====================================
        // 建立評語卡片
        // ====================================

        let feedbackHTML =
            "";


        sortedDates.forEach(
            function(date) {

                const dateRecords =
                    groupedRecords[
                        date
                    ];


                // ====================================
                // 日期標題
                // ====================================

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


                // ====================================
                // 該日期的所有評語
                // ====================================

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


                                <!--
                                    ⭐ 評語文字
                                    不使用 pre-wrap，
                                    避免 Google Sheet
                                    裡面的縮排空格被帶出來
                                -->

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


                // ====================================
                // 關閉日期區塊
                // ====================================

                feedbackHTML += `

                    </div>

                `;

            }
        );


        // ====================================
        // ⭐ 寫入頁面
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
// 初始化頁面
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    showHome
);
