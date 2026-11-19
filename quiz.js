
/* =====================================================
   TAS 每週測驗模組
   不覆蓋原本 script.js 的打卡、照片、用餐及評語功能
   ===================================================== */

(() => {
  "use strict";

  const QUIZ_API_URL =
    "https://script.google.com/macros/s/AKfycbwWfR-asRYYgCqtCszR7oKKv0s86YcXJY4Xm36CIq5swLTmTebBJfCMWI7V0sXNrhZF/exec";

  let studentName = "";
  let currentWeek = 0;
  let questionSetId = "";
  let questions = [];
  let answers = {};
  let busy = false;
  // ---------- AI 老師評語閱讀挑戰 ----------

  let readingChallengeId = "";
  let readingQuestions = [];
  let readingIndex = 0;
  let readingNeedsCorrection = false;
  let readingCorrectSentence = "";
   
  // ---------- 安全顯示文字 ----------

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- 取得目前登入的學生 ----------

  function getStudentName() {
    if (
      typeof currentStudent !== "undefined" &&
      currentStudent &&
      currentStudent.name
    ) {
      return String(currentStudent.name).trim();
    }

    return "";
  }

  // ---------- 呼叫 Apps Script API ----------
  // 使用 JSONP，避免一般跨網域 fetch 的 CORS 問題。
  // Apps Script 必須先加入本文後面的 doGet API 入口。

  
function callAPI(params) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "tasQuizCallback_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2);

    const script = document.createElement("script");

    let finished = false;

    // Gemini 同步生成需要較長時間，延長至 120 秒。
    const timeout = setTimeout(() => {
      finish();

      reject(
        new Error(
          "測驗伺服器回應逾時（120 秒），請稍候再重新嘗試。"
        )
      );
    }, 120000);

    function finish() {
      if (finished) return;
      finished = true;

      clearTimeout(timeout);

      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = (result) => {
      if (finished) return;

      finish();

      if (!result || result.status !== "success") {
        reject(
          new Error(
            result && result.message
              ? result.message
              : "測驗 API 回傳格式錯誤。"
          )
        );
        return;
      }

      resolve(result.data);
    };

    const query = new URLSearchParams({
      ...params,
      callback: callbackName,
      _ts: String(Date.now())
    });

    script.onerror = () => {
      if (finished) return;

      finish();

      reject(
        new Error(
          "無法連線至測驗伺服器。請檢查 Apps Script 部署網址及權限。"
        )
      );
    };

    script.src =
      QUIZ_API_URL + "?" + query.toString();

    document.head.appendChild(script);
  });
}


  // ---------- 共用畫面工具 ----------

  function render(html) {
    const app = document.getElementById("app");

    if (app) {
      app.innerHTML = html;
    }
  }

  function addBackButton(id, handler) {
    const button = document.getElementById(id);

    if (button) {
      button.addEventListener("click", handler);
    }
  }

  // ---------- 測驗首頁 ----------

  async function showQuizHome() {
    studentName = getStudentName();

    if (!studentName) {
      alert("請先選擇學生並完成生日驗證。");
      return;
    }

    render(`
      <h1>📝 每週測驗</h1>

      <h2>${escapeHTML(studentName)}</h2>

      <p>請選擇目前開放的測驗週次。</p>

      <div id="quizStatus" class="loading">
        ⏳ 正在讀取測驗週次……
      </div>

      <div id="quizWeekList"></div>

      <br>

      <button id="quizResultsButton" type="button">
        📊 我的測驗成績
      </button>

      <br><br>

      <button id="quizBackButton" type="button">
        ⬅ 返回主選單
      </button>
    `);

    addBackButton("quizBackButton", () => {
      if (typeof showMainMenu === "function") {
        showMainMenu();
      }
    });

    addBackButton(
      "quizResultsButton",
      showQuizResults
    );

    try {
      const data = await callAPI({
        action: "weeks"
      });

      const weeks = Array.isArray(data.weeks)
        ? data.weeks
        : [];

      const openWeeks = weeks.filter(
        (week) => week.isOpen === true
      );

      const status =
        document.getElementById("quizStatus");

      const list =
        document.getElementById("quizWeekList");

      if (!status || !list) return;

      if (openWeeks.length === 0) {
        status.className = "error";
        status.textContent =
          "目前沒有開放中的測驗週次。";
        return;
      }

      status.className = "";
      status.textContent = "請選擇測驗週次：";

      list.innerHTML = openWeeks.map((week) => `
        <button
          type="button"
          data-week="${Number(week.weekNumber)}"
          style="width:100%;margin:8px 0;"
        >
          📝 第 ${Number(week.weekNumber)} 週測驗
          <br>
          ${escapeHTML(week.openDate || "")}
          至
          ${escapeHTML(week.closeDate || "")}
        </button>
      `).join("");

      list.querySelectorAll("[data-week]").forEach(
        (button) => {
          button.addEventListener("click", () => {
            startQuiz(Number(button.dataset.week));
          });
        }
      );
    } catch (error) {
      const status =
        document.getElementById("quizStatus");

      if (status) {
        status.className = "error";
        status.textContent = error.message;
      }
    }
  }

  // ---------- 開始測驗 ----------


  // ---------- 開始測驗：先進入閱讀挑戰 ----------

  

async function startQuiz(weekNumber) {
  if (busy) return;

  busy = true;
  currentWeek = Number(weekNumber);

  questionSetId = "";
  questions = [];
  answers = {};

  readingChallengeId = "";
  readingQuestions = [];
  readingIndex = 0;
  readingNeedsCorrection = false;
  readingCorrectSentence = "";

  render(`
    <div class="loading">
      <p>⏳ 正在啟動 AI 老師評語閱讀挑戰……</p>
      <p>AI 正在閱讀本週教師評語，請稍候。</p>
      <p>題目準備完成後，就可以開始作答。</p>
    </div>
  `);

  try {
    // 1. 呼叫後端，直接同步生成閱讀挑戰題目。
    const startData = await callAPI({
      action: "startReadingChallenge",
      studentName: studentName,
      weekNumber: String(currentWeek)
    });

    if (!startData || !startData.jobId) {
      throw new Error(
        startData && startData.message
          ? startData.message
          : "無法啟動閱讀挑戰，請重新嘗試。"
      );
    }

    const jobId = startData.jobId;

    // 後端已明確回報生成失敗，不必再輪詢。
    if (startData.status === "failed") {
      throw new Error(
        startData.message || "AI 題目生成失敗，請重新嘗試。"
      );
    }

    // 2. 取得生成結果。
    // 同步生成完成時，通常第一次查詢就會取得 completed。
    // 若另一個請求正在生成，則每 3 秒查詢一次。
    let challengeData = null;
    let attempts = 0;
    const maxAttempts = 120;

    while (attempts < maxAttempts) {
      attempts++;

      const statusData = await callAPI({
        action: "getReadingChallengeStatus",
        studentName: studentName,
        weekNumber: String(currentWeek),
        jobId: jobId
      });

      if (!statusData) {
        throw new Error(
          "無法取得閱讀挑戰狀態，請重新嘗試。"
        );
      }

      if (statusData.status === "completed") {
        challengeData = statusData;
        break;
      }

      if (statusData.status === "failed") {
        throw new Error(
          statusData.message || "AI 題目生成失敗，請重新嘗試。"
        );
      }

      if (
        statusData.status !== "processing" &&
        statusData.status !== "queued"
      ) {
        throw new Error(
          "閱讀挑戰狀態異常，請返回測驗選單後重新嘗試。"
        );
      }

      render(`
        <div class="loading">
          <p>⏳ AI 正在準備閱讀挑戰題目……</p>
          <p>目前狀態：${statusData.status === "queued"
            ? "等待處理"
            : "正在生成題目"}</p>
          <p>請稍候，不要關閉此頁面。</p>
        </div>
      `);

      // 已完成的同步生成不需要等待；
      // 只有仍在 processing 時才等待 3 秒。
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (!challengeData) {
      throw new Error(
        "題目準備時間較長，請稍候再重新進入閱讀挑戰。"
      );
    }

    // 3. 載入三道閱讀挑戰題目。
    readingChallengeId = challengeData.challengeId;

    readingQuestions = Array.isArray(challengeData.questions)
      ? challengeData.questions
      : [];

    if (!readingChallengeId) {
      throw new Error("閱讀挑戰識別碼不存在，請重新嘗試。");
    }

    if (readingQuestions.length !== 3) {
      throw new Error("閱讀挑戰必須恰好有 3 題。");
    }

    readingIndex = 0;
    readingNeedsCorrection = false;
    readingCorrectSentence = "";

    renderReadingChallenge();

  } catch (error) {
    console.error("閱讀挑戰啟動失敗：", error);

    render(`
      <div class="error">
        <h3>閱讀挑戰暫時無法開始</h3>
        <p>${escapeHTML(error.message || error)}</p>

        <button id="readingRetryButton" type="button">
          重新嘗試
        </button>

        <br><br>

        <button id="readingReturnButton" type="button">
          返回測驗選單
        </button>
      </div>
    `);

    addBackButton("readingRetryButton", () => {
      startQuiz(currentWeek);
    });

    addBackButton("readingReturnButton", showQuizHome);

  } finally {
    busy = false;
  }
}


  // ---------- 顯示閱讀挑戰 ----------

  function renderReadingChallenge() {
    const q = readingQuestions[readingIndex];

    if (!q) {
      loadOfficialQuiz();
      return;
    }

    const options = [
      ["A", q.optionA],
      ["B", q.optionB],
      ["C", q.optionC],
      ["D", q.optionD]
    ];

    const correctionHTML = readingNeedsCorrection
      ? `
        <div style="
          background:#fff7ed;
          border:2px solid #fb923c;
          border-radius:14px;
          padding:16px;
          margin-top:18px;
          text-align:left;
        ">
          <h3>✏️ 請完成整句訂正</h3>

          <p style="line-height:1.7;">
            ${escapeHTML(readingCorrectSentence)}
          </p>

          <p>
            請將上面的完整正確句子重新輸入。
          </p>

          <textarea
            id="readingCorrectionInput"
            rows="3"
            style="
              width:100%;
              box-sizing:border-box;
              padding:12px;
              font-size:17px;
              border:1px solid #cbd5e1;
              border-radius:10px;
            "
            placeholder="請輸入完整正確句子"
          ></textarea>

          <button
            id="readingCorrectionButton"
            type="button"
            style="width:100%;margin-top:12px;"
          >
            送出訂正
          </button>
        </div>
      `
      : `
        <div id="readingOptionArea">
          ${options.map(([key, value]) => `
            <label style="
              display:flex;
              align-items:flex-start;
              gap:10px;
              text-align:left;
              font-size:17px;
              line-height:1.6;
              padding:12px;
              margin:8px 0;
              background:#f8fafc;
              border-radius:10px;
              cursor:pointer;
            ">
              <input
                type="radio"
                name="readingAnswer"
                value="${key}"
                style="width:20px;min-width:20px;margin-top:5px;"
              >
              <span>
                <strong>${key}.</strong>
                ${escapeHTML(value)}
              </span>
            </label>
          `).join("")}
        </div>

        <button
          id="readingAnswerButton"
          type="button"
          style="width:100%;margin-top:12px;"
        >
          確認答案
        </button>
      `;

    const progress = readingIndex + 1;

    render(`
      <h1>📖 AI 老師評語閱讀挑戰</h1>

      <p>第 ${currentWeek} 週｜${escapeHTML(studentName)}</p>

      <div style="
        background:#dbeafe;
        border-radius:12px;
        padding:12px;
        margin:12px 0;
      ">
        <strong>
          閱讀進度：第 ${progress} / ${readingQuestions.length} 題
        </strong>
      </div>

      <section style="
        text-align:left;
        background:#ffffff;
        border:1px solid #dbeafe;
        border-radius:16px;
        padding:18px;
        margin:16px 0;
      ">
        <h2>第 ${progress} 題</h2>

        <p style="
          font-size:19px;
          line-height:1.8;
          white-space:pre-line;
        ">
          ${escapeHTML(q.question)}
        </p>

        ${correctionHTML}

        <div id="readingMessage"></div>
      </section>

      <button id="readingCancelButton" type="button">
        ⬅ 返回測驗選單
      </button>
    `);

    addBackButton("readingCancelButton", showQuizHome);

    if (readingNeedsCorrection) {
      addBackButton(
        "readingCorrectionButton",
        submitReadingCorrection
      );
    } else {
      addBackButton(
        "readingAnswerButton",
        submitReadingAnswer
      );
    }
  }

  // ---------- 選擇閱讀題答案 ----------

  async function submitReadingAnswer() {
    if (busy) return;

    const selected = document.querySelector(
      'input[name="readingAnswer"]:checked'
    );

    const message = document.getElementById("readingMessage");

    if (!selected) {
      message.className = "error";
      message.textContent = "請先選擇一個答案。";
      return;
    }

    busy = true;

    const button = document.getElementById("readingAnswerButton");

    if (button) {
      button.disabled = true;
      button.textContent = "⏳ 正在確認答案……";
    }

    try {
      const data = await callAPI({
        action: "checkReadingAnswer",
        studentName: studentName,
        weekNumber: String(currentWeek),
        challengeId: readingChallengeId,
        questionIndex: String(readingIndex),
        selectedAnswer: selected.value,
        correctionSentence: ""
      });

      if (data.passed === true) {
        readingIndex++;
        readingNeedsCorrection = false;
        readingCorrectSentence = "";

        if (readingIndex >= readingQuestions.length) {
          await loadOfficialQuiz();
        } else {
          renderReadingChallenge();
        }

        return;
      }

      if (data.needsCorrection === true) {
        readingNeedsCorrection = true;
        readingCorrectSentence = String(
          data.correctSentence || ""
        );

        if (!readingCorrectSentence) {
          throw new Error("伺服器沒有提供正確完整句，請重新嘗試。");
        }

        renderReadingChallenge();

        const newMessage = document.getElementById("readingMessage");

        if (newMessage) {
          newMessage.className = "error";
          newMessage.textContent =
            "這次選擇不正確，請參考正確句子，完成整句訂正。";
        }

        return;
      }

      throw new Error(data.message || "答案確認失敗，請重新嘗試。");

    } catch (error) {
      const currentMessage = document.getElementById("readingMessage");

      if (currentMessage) {
        currentMessage.className = "error";
        currentMessage.textContent = error.message;
      }

      const retryButton = document.getElementById("readingAnswerButton");

      if (retryButton) {
        retryButton.disabled = false;
        retryButton.textContent = "確認答案";
      }

    } finally {
      busy = false;
    }
  }

  // ---------- 完整句訂正 ----------

  async function submitReadingCorrection() {
    if (busy) return;

    const input = document.getElementById("readingCorrectionInput");
    const message = document.getElementById("readingMessage");

    if (!input || !input.value.trim()) {
      message.className = "error";
      message.textContent = "請輸入完整正確句子。";
      return;
    }

    busy = true;

    const button = document.getElementById("readingCorrectionButton");

    if (button) {
      button.disabled = true;
      button.textContent = "⏳ 正在檢查訂正……";
    }

    try {
      const data = await callAPI({
        action: "checkReadingAnswer",
        studentName: studentName,
        weekNumber: String(currentWeek),
        challengeId: readingChallengeId,
        questionIndex: String(readingIndex),
        selectedAnswer: "",
        correctionSentence: input.value
      });

      if (
        data.passed === true ||
        data.correctionCorrect === true
      ) {
        readingIndex++;
        readingNeedsCorrection = false;
        readingCorrectSentence = "";

        if (readingIndex >= readingQuestions.length) {
          await loadOfficialQuiz();
        } else {
          renderReadingChallenge();
        }

        return;
      }

      if (data.correctionCorrect === false) {
        message.className = "error";
        message.textContent =
          "訂正還不完全正確，請再次檢查文字，並重新輸入完整句子。";

        input.value = "";
        input.focus();

        button.disabled = false;
        button.textContent = "重新送出訂正";
        return;
      }

      throw new Error(data.message || "訂正檢查失敗，請重新嘗試。");

    } catch (error) {
      const currentMessage = document.getElementById("readingMessage");

      if (currentMessage) {
        currentMessage.className = "error";
        currentMessage.textContent = error.message;
      }

      const retryButton = document.getElementById("readingCorrectionButton");

      if (retryButton) {
        retryButton.disabled = false;
        retryButton.textContent = "重新送出訂正";
      }

    } finally {
      busy = false;
    }
  }

  // ---------- 閱讀挑戰通過，開啟正式測驗 ----------

  
async function loadOfficialQuiz() {
  render(`
    <h1>🎉 閱讀挑戰完成！</h1>

    <div class="success">
      <p>所有閱讀題目都已經通過。</p>
      <p>現在為你開啟正式的 10 題測驗。</p>
    </div>

    <div class="loading">
      ⏳ 正在準備正式測驗題目……
    </div>
  `);

  try {
    // 確認閱讀挑戰已經有通關識別碼
    if (!readingChallengeId) {
      throw new Error(
        "閱讀挑戰通關資料不存在，無法開啟正式測驗。"
      );
    }

    const data = await callAPI({
      action: "getQuiz",
      studentName: studentName,
      weekNumber: String(currentWeek),
      challengeId: readingChallengeId
    });

    questionSetId = String(data.questionSetId || "");

    questions = Array.isArray(data.questions)
      ? data.questions
      : [];

    answers = {};

    if (!questionSetId || questions.length !== 10) {
      throw new Error(
        "正式測驗題目資料不完整，請返回後重新嘗試。"
      );
    }

    renderQuestions();

  } catch (error) {
    render(`
      <h1>無法開啟正式測驗</h1>

      <div class="error">
        ${escapeHTML(error.message)}
      </div>

      <br>

      <button id="quizReturnButton" type="button">
        返回測驗選單
      </button>
    `);

    addBackButton("quizReturnButton", showQuizHome);
  }
}


  // ---------- 顯示題目 ----------

  function renderQuestions() {
    const html = questions.map((q, index) => {
      const number = Number(
        q.questionNumber || index + 1
      );

      const options = [
        ["A", q.optionA],
        ["B", q.optionB],
        ["C", q.optionC],
        ["D", q.optionD]
      ];

      return `
        <section
          style="
            text-align:left;
            background:#ffffff;
            border:1px solid #dbeafe;
            border-radius:16px;
            padding:18px;
            margin:16px 0;
          "
        >
          <h2>第 ${number} 題</h2>

          <p
            style="
              font-size:18px;
              line-height:1.7;
              white-space:pre-line;
            "
          >
            ${escapeHTML(q.question)}
          </p>

          ${options.map(([key, value]) => `
            <label
              style="
                display:flex;
                align-items:flex-start;
                gap:10px;
                text-align:left;
                font-size:17px;
                line-height:1.6;
                padding:12px;
                margin:8px 0;
                background:#f8fafc;
                border-radius:10px;
                cursor:pointer;
              "
            >
              <input
                type="radio"
                name="quizQ${number}"
                value="${key}"
                style="
                  width:20px;
                  min-width:20px;
                  margin-top:5px;
                "
                ${answers[number] === key ? "checked" : ""}
              >

              <span>
                <strong>${key}.</strong>
                ${escapeHTML(value)}
              </span>
            </label>
          `).join("")}
        </section>
      `;
    }).join("");

    render(`
      <h1>📝 第 ${currentWeek} 週測驗</h1>

      <p>共 10 題，請完成全部題目後交卷。</p>

      <div id="quizQuestions">
        ${html}
      </div>

      <div id="quizSubmitMessage"></div>

      <button
        id="quizSubmitButton"
        type="button"
        style="width:100%;"
      >
        📨 確認並交卷
      </button>

      <br><br>

      <button id="quizCancelButton" type="button">
        ⬅ 返回測驗選單
      </button>
    `);

    questions.forEach((q, index) => {
      const number = Number(
        q.questionNumber || index + 1
      );

      document
        .querySelectorAll(`input[name="quizQ${number}"]`)
        .forEach((input) => {
          input.addEventListener("change", () => {
            answers[number] = input.value;
          });
        });
    });

    addBackButton(
      "quizSubmitButton",
      submitQuiz
    );

    addBackButton(
      "quizCancelButton",
      showQuizHome
    );
  }

  // ---------- 交卷及計分 ----------

  async function submitQuiz() {
    if (busy) return;

    const orderedAnswers = questions.map(
      (q, index) => {
        const number = Number(
          q.questionNumber || index + 1
        );

        return answers[number] || "";
      }
    );

    const missingIndex =
      orderedAnswers.findIndex((answer) => !answer);

    const message =
      document.getElementById("quizSubmitMessage");

    if (missingIndex !== -1) {
      message.className = "error";
      message.textContent =
        `第 ${missingIndex + 1} 題尚未作答，請完成所有題目。`;

      const section = document.querySelectorAll(
        "#quizQuestions section"
      )[missingIndex];

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      return;
    }

    if (
      !confirm(
        "確定要交卷嗎？交卷後不能修改，也不能重複作答。"
      )
    ) {
      return;
    }

    busy = true;

    const button =
      document.getElementById("quizSubmitButton");

    button.disabled = true;
    button.textContent = "⏳ 正在交卷……";

    message.className = "loading";
    message.textContent =
      "正在計分並儲存作答紀錄……";

    try {
      const data = await callAPI({
  action: "submit",
  studentName: studentName,
  weekNumber: String(currentWeek),
  questionSetId: questionSetId,
  challengeId: readingChallengeId,
  answers: JSON.stringify(orderedAnswers)
});
       

      render(`
        <div class="success">
          <h1>✅ 測驗完成！</h1>

          <h2>第 ${Number(data.weekNumber)} 週測驗</h2>

          <p>學生：${escapeHTML(data.studentName)}</p>

          <p style="font-size:30px;font-weight:800;">
            ${Number(data.score)} / ${Number(data.totalPoints)} 分
          </p>

          <p>
            答對 ${Number(data.correctCount)}
            / ${Number(data.totalQuestions)} 題
          </p>

          <p>已成功儲存作答紀錄。</p>
        </div>

        <button id="quizResultsButton" type="button" style="width:100%;">
          📊 查看我的歷次成績
        </button>

        <br><br>

        <button id="quizHomeButton" type="button">
          返回測驗選單
        </button>
      `);

      addBackButton(
        "quizResultsButton",
        showQuizResults
      );

      addBackButton(
        "quizHomeButton",
        showQuizHome
      );
    } catch (error) {
      message.className = "error";
      message.textContent = error.message;

      button.disabled = false;
      button.textContent = "📨 確認並交卷";
    } finally {
      busy = false;
    }
  }

  // ---------- 個人成績 ----------


async function showQuizResults() {
  studentName = getStudentName();

  if (!studentName) {
    alert("請先選擇學生並完成生日驗證。");
    return;
  }

  render(`
    <h1>📊 我的測驗成績</h1>
    <h2>${escapeHTML(studentName)}</h2>
    <div id="quizResultsStatus" class="loading">
      ⏳ 正在讀取成績……
    </div>
    <div id="quizResultsList"></div>
    <br>
    <button id="quizResultsBack" type="button">
      ⬅ 返回測驗選單
    </button>
  `);

  addBackButton("quizResultsBack", showQuizHome);

  try {
    const data = await callAPI({
      action: "results",
      studentName: studentName
    });

    const results = Array.isArray(data.results)
      ? data.results
      : [];

    const status = document.getElementById("quizResultsStatus");
    const list = document.getElementById("quizResultsList");

    if (!status || !list) return;

    if (results.length === 0) {
      status.className = "";
      status.textContent = "目前還沒有測驗成績。";
      return;
    }

    results.sort(
      (a, b) => Number(b.weekNumber) - Number(a.weekNumber)
    );

    status.className = "";
    status.textContent = `共 ${results.length} 筆測驗紀錄`;

    console.log("TAS 成績資料：", results);
    console.log("第一筆 submissionId：", results[0].submissionId);

    list.innerHTML = results.map((result, index) => {
      const submissionId = String(result.submissionId || "").trim();

      return `
        <section style="
          display:block;
          text-align:left;
          background:#fff;
          border:2px solid #2563eb;
          border-radius:14px;
          padding:16px;
          margin:12px 0;
        ">
          <h2>第 ${Number(result.weekNumber)} 週</h2>
          <p>成績：<strong>${Number(result.score)} / 100 分</strong></p>
          <p>答對題數：${Number(result.correctCount)} / 10 題</p>
          <p>評語日期：${escapeHTML(result.feedbackDate || "未提供")}</p>
          <p>交卷時間：${escapeHTML(result.submittedAt || "未提供")}</p>

          ${
            submissionId
              ? `<button type="button"
                   data-quiz-answer="${index}"
                   style="
                     display:block !important;
                     visibility:visible !important;
                     opacity:1 !important;
                     width:100%;
                     padding:14px;
                     margin-top:12px;
                     background:#2563eb;
                     color:white;
                     border:0;
                     border-radius:10px;
                     font-size:17px;
                     font-weight:bold;
                     cursor:pointer;
                   ">
                   📖 查看本次作答紀錄
                 </button>`
              : `<p style="color:#dc2626;font-weight:bold;">
                   ⚠ 此筆成績沒有 submissionId，暫時無法查詢作答紀錄。
                 </p>`
          }
        </section>
      `;
    }).join("");

    list.querySelectorAll("[data-quiz-answer]").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.quizAnswer);
        const result = results[index];
        showQuizAnswers(String(result.submissionId).trim());
      });
    });

  } catch (error) {
    const status = document.getElementById("quizResultsStatus");

    if (status) {
      status.className = "error";
      status.textContent = error.message;
    }

    console.error("TAS 成績查詢錯誤：", error);
  }
}

// ---------- 個人作答紀錄 ----------

async function showQuizAnswers(submissionId) {
  render(`
    <h1>📖 我的作答紀錄</h1>
    <div id="quizAnswersStatus" class="loading">
      ⏳ 正在讀取作答紀錄……
    </div>
    <div id="quizAnswersList"></div>
    <button id="quizAnswersBack" type="button">
      ⬅ 返回歷次成績
    </button>
  `);

  addBackButton("quizAnswersBack", showQuizResults);

  try {
    const data = await callAPI({
      action: "answers",
      studentName: studentName,
      submissionId: submissionId
    });

    const answers = Array.isArray(data.answers)
      ? data.answers
      : [];

    const status = document.getElementById("quizAnswersStatus");
    const list = document.getElementById("quizAnswersList");

    if (!status || !list) return;

    if (answers.length === 0) {
      status.textContent = "目前沒有作答紀錄。";
      return;
    }

    status.className = "";
    status.textContent = `共 ${answers.length} 題`;

    list.innerHTML = answers.map((item) => `
      <section style="
        text-align:left;
        background:#ffffff;
        border:1px solid #dbeafe;
        border-radius:14px;
        padding:16px;
        margin:12px 0;
      ">
        <h2>第 ${Number(item.questionNumber)} 題</h2>

        <p style="line-height:1.7;">
          ${escapeHTML(item.question)}
        </p>

        <p>
          你的答案：
          <strong>
            ${escapeHTML(item.selectedAnswer)}.
            ${escapeHTML(item.selectedText)}
          </strong>
        </p>

        <p style="
          color:${item.isCorrect ? "#16a34a" : "#dc2626"};
          font-weight:bold;
        ">
          ${item.isCorrect ? "✓ 答對" : "✗ 答錯"}
        </p>

        ${!item.isCorrect ? `
          <p style="color:#16a34a;font-weight:bold;">
            正確答案：
            ${escapeHTML(item.correctAnswer)}.
            ${escapeHTML(item.correctText)}
          </p>
        ` : ""}
      </section>
    `).join("");

  } catch (error) {
    const status = document.getElementById("quizAnswersStatus");

    if (status) {
      status.className = "error";
      status.textContent = error.message;
    }
  }
}


// ---------- 將測驗按鈕加入原本主選單 ----------
   
  // ---------- 將測驗按鈕加入原本主選單 ----------
  // 不修改原本主選單的 HTML 或其他按鈕。

  function addQuizButton() {
    const menu = document.querySelector("#app .menu");

    if (
      !menu ||
      document.getElementById("tasWeeklyQuizButton")
    ) {
      return;
    }

    const button = document.createElement("button");

    button.id = "tasWeeklyQuizButton";
    button.type = "button";
    button.textContent = "📝 每週測驗 Weekly Quiz";

    button.addEventListener("click", showQuizHome);

    const feedbackButton =
      document.getElementById("feedbackButton");

    if (
      feedbackButton &&
      feedbackButton.parentNode === menu
    ) {
      menu.insertBefore(button, feedbackButton);
    } else {
      menu.appendChild(button);
    }
  }

  // 原本 script.js 會動態更新畫面，因此監測主選單。
  const observer = new MutationObserver(addQuizButton);

  function initializeQuiz() {
    const app = document.getElementById("app");

    if (!app) return;

    observer.observe(app, {
      childList: true,
      subtree: true
    });

    addQuizButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeQuiz
    );
  } else {
    initializeQuiz();
  }
})();
