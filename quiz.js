
/* =====================================================
   TAS 每週測驗模組
   不覆蓋原本 script.js 的打卡、照片、用餐及評語功能
   ===================================================== */

(() => {
  "use strict";

  const QUIZ_API_URL =
    "https://script.google.com/macros/s/AKfycbyLPkIEnwiU6g2-IsGPLiYVlZ4pc1kB-qvi-vatmqC-ixsj_vo02yuib5-BAOx5OXvE/exec";

  let studentName = "";
  let currentWeek = 0;
  let questionSetId = "";
  let questions = [];
  let answers = {};
  let busy = false;

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

      const timeout = setTimeout(() => {
        finish();
        reject(
          new Error(
            "測驗伺服器回應逾時，請稍後再試。"
          )
        );
      }, 30000);

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

  async function startQuiz(weekNumber) {
    if (busy) return;

    busy = true;
    currentWeek = weekNumber;
    answers = {};
    questions = [];
    questionSetId = "";

    render(`
      <h1>第 ${weekNumber} 週測驗</h1>

      <p>${escapeHTML(studentName)}</p>

      <div class="loading">
        ⏳ 正在準備測驗題目……
      </div>

      <p>第一次產生題目可能需要較長時間。</p>

      <button id="quizCancelButton" type="button">
        ⬅ 返回測驗選單
      </button>
    `);

    addBackButton(
      "quizCancelButton",
      showQuizHome
    );

    try {
      const data = await callAPI({
        action: "getQuiz",
        studentName: studentName,
        weekNumber: String(weekNumber)
      });

      questionSetId =
        String(data.questionSetId || "");

      questions = Array.isArray(data.questions)
        ? data.questions
        : [];

      if (!questionSetId || questions.length !== 10) {
        throw new Error(
          "測驗題目資料不完整，請返回後重新嘗試。"
        );
      }

      renderQuestions();
    } catch (error) {
      render(`
        <h1>無法開啟測驗</h1>

        <div class="error">
          ${escapeHTML(error.message)}
        </div>

        <br>

        <button id="quizReturnButton" type="button">
          返回測驗選單
        </button>
      `);

      addBackButton(
        "quizReturnButton",
        showQuizHome
      );
    } finally {
      busy = false;
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

    addBackButton(
      "quizResultsBack",
      showQuizHome
    );

    try {
      const data = await callAPI({
        action: "results",
        studentName: studentName
      });

      const results = Array.isArray(data.results)
        ? data.results
        : [];

      const status =
        document.getElementById("quizResultsStatus");

      const list =
        document.getElementById("quizResultsList");

      if (!status || !list) return;

      if (results.length === 0) {
        status.className = "";
        status.textContent = "目前還沒有測驗成績。";
        return;
      }

      results.sort(
        (a, b) =>
          Number(b.weekNumber) - Number(a.weekNumber)
      );

      status.className = "";
      status.textContent =
        `共 ${results.length} 筆測驗紀錄`;

      list.innerHTML = results.map((result) => `
        <section
          style="
            text-align:left;
            background:#ffffff;
            border:1px solid #dbeafe;
            border-radius:14px;
            padding:16px;
            margin:12px 0;
          "
        >
          <h2>第 ${Number(result.weekNumber)} 週</h2>

          <p>
            成績：
            <strong>${Number(result.score)} / 100 分</strong>
          </p>

          <p>
            答對題數：
            ${Number(result.correctCount)} / 10 題
          </p>

          <p>
            評語日期：
            ${escapeHTML(result.feedbackDate || "未提供")}
          </p>

          <p>
            交卷時間：
            ${escapeHTML(result.submittedAt || "未提供")}
          </p>
        </section>
      `).join("");
    } catch (error) {
      const status =
        document.getElementById("quizResultsStatus");

      if (status) {
        status.className = "error";
        status.textContent = error.message;
      }
    }
  }

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
