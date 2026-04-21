// Data Storage using localStorage
class StudyPlannerApp {
  // Daily Status Calculation Method
  calculateDailyStatus(hardwork, health, schoolWork) {
    const totalScore =
      parseFloat(hardwork) + parseFloat(health) + parseFloat(schoolWork);
    const averageScore = (totalScore / 27.5).toFixed(3) * 10;

    let remarks = "";
    let statusClass = "";

    if (totalScore === 27.5) {
      remarks = "Satisfied — Winning today!";
      statusClass = "status-excellent";
    } else if (totalScore >= 24) {
      remarks = "No Problem — On track, keep going";
      statusClass = "status-excellent";
    } else if (totalScore >= 20) {
      remarks = "Needs improvement";
      statusClass = "status-good";
    } else if (totalScore >= 17) {
      remarks = "Urgent focus needed";
      statusClass = "status-average";
    } else if (totalScore >= 14) {
      remarks = "Not Satisfied — Rese";
      statusClass = "status-poor";
    } else {
      remarks = "Get Out — Wake-up call!";
      statusClass = "status-critical";
    }

    return {
      totalScore: totalScore.toFixed(1),
      averageScore,
      remarks,
      statusClass,
    };
  }

  // Add Daily Status Method
  addDailyStatus(
    date,
    day,
    hardwork,
    health,
    schoolWork,
    reviseLessons,
    maintainDiet,
  ) {
    const calculation = this.calculateDailyStatus(hardwork, health, schoolWork);

    const statusReport = {
      date,
      day,
      scores: {
        hardwork: parseFloat(hardwork),
        health: parseFloat(health),
        school_work: parseFloat(schoolWork),
      },
      extras: {
        reviseLessons: reviseLessons || false,
        maintainDiet: maintainDiet || false,
      },
      total_score: parseFloat(calculation.totalScore),
      average_score: parseFloat(calculation.averageScore),
      remarks: calculation.remarks,
      statusClass: calculation.statusClass,
      timestamp: new Date().toISOString(),
    };

    // Remove existing entry for the same date if it exists
    this.dailyStatusReports = this.dailyStatusReports.filter(
      (report) => report.date !== date,
    );

    // Add new report
    this.dailyStatusReports.unshift(statusReport);

    // Keep only last 30 days
    this.dailyStatusReports = this.dailyStatusReports.slice(0, 30);

    localStorage.setItem(
      "dailyStatusReports",
      JSON.stringify(this.dailyStatusReports),
    );
    this.loadDailyStatus();

    return statusReport;
  }

  // Load Daily Status Method
  loadDailyStatus() {
    const today = new Date().toISOString().split("T")[0];
    const todayReport = this.dailyStatusReports.find(
      (report) => report.date === today,
    );

    const todayDisplay = document.getElementById("todayStatusDisplay");

    if (todayReport) {
      todayDisplay.innerHTML = `
      <div class="bg-white/10 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white font-bold text-lg">Today's Status Report</h3>
          <div class="px-3 py-1 rounded-full ${todayReport.statusClass} text-white text-sm font-medium">
            ${todayReport.total_score}/27.5
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="text-center">
            <p class="text-gray-300 text-xs">Hardwork</p>
            <p class="text-white font-bold">${todayReport.scores.hardwork}/10</p>
          </div>
          <div class="text-center">
            <p class="text-gray-300 text-xs">Health</p>
            <p class="text-white font-bold">${todayReport.scores.health}/15</p>
          </div>
          <div class="text-center">
            <p class="text-gray-300 text-xs">School Work</p>
            <p class="text-white font-bold">${todayReport.scores.school_work}/2.5</p>
          </div>
        </div>
        
        <div class="text-center">
          <div class="mb-2">
            <span class="text-gray-300 text-sm">Average Score: </span>
            <span class="text-white font-bold">${todayReport.average_score}</span>
          </div>
          <div class="px-4 py-2 rounded-lg ${todayReport.statusClass} text-white font-medium">
            ${todayReport.remarks}
          </div>
        </div>
        
        ${todayReport.extras ? "" : ""}
      </div>
    `;
    } else {
      todayDisplay.innerHTML = `
      <div class="bg-white/10 rounded-xl p-6 text-center">
        <div class="text-gray-300 mb-4">
          <div class="text-4xl mb-2">📊</div>
          <p class="text-lg">No status recorded for today</p>
          <p class="text-sm">Click "Update Status" to track your daily progress</p>
        </div>
      </div>
    `;
    }

    this.loadStatusHistory();
  }

  // Load Status History Method
  loadStatusHistory() {
    const historyContainer = document.getElementById("statusHistory");

    if (this.dailyStatusReports.length === 0) {
      historyContainer.innerHTML =
        '<p class="text-gray-300 text-center py-4">No history available yet</p>';
      return;
    }

    historyContainer.innerHTML = this.dailyStatusReports
      .slice(0, 10) // Show last 10 entries
      .map(
        (report) => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
        <div class="flex items-center space-x-3">
          <div class="text-center">
            <p class="text-white text-sm font-medium">${new Date(
              report.date,
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}</p>
            <p class="text-gray-300 text-xs">${report.day}</p>
          </div>
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 rounded text-xs font-medium ${
                report.statusClass
              } text-white">
                ${report.total_score}/27.5
              </span>
              <span class="text-white text-sm">${report.remarks
                .split("—")[0]
                .trim()}</span>
            </div>
          </div>
        </div>
        <button onclick="app.viewStatusDetails('${
          report.date
        }')" class="text-blue-400 hover:text-blue-300 text-xs">
          View
        </button>
      </div>
    `,
      )
      .join("");
  }

  // View Status Details Method
  viewStatusDetails(date) {
    const report = this.dailyStatusReports.find((r) => r.date === date);
    if (report) {
      const detailsText = `Date: ${report.date} (${report.day})\nScores:\n- Hardwork: ${report.scores.hardwork}/10\n- Health: ${report.scores.health}/15\n- School Work: ${report.scores.school_work}/2.5\n\nTotal Score: ${report.total_score}/27.5\nAverage Score: ${report.average_score}\nRemarks: ${report.remarks}\n\nDo you want to delete this status entry?`;
      if (confirm(detailsText)) {
        this.deleteDailyStatus(date);
      }
    }
  }

  // Delete Daily Status Method
  deleteDailyStatus(date) {
    this.dailyStatusReports = this.dailyStatusReports.filter(
      (report) => report.date !== date,
    );
    localStorage.setItem(
      "dailyStatusReports",
      JSON.stringify(this.dailyStatusReports),
    );
    this.loadDailyStatus();
    this.showNotification("Status entry deleted! 🗑️");
  }

  // Open Status Modal Method
  openStatusModal() {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const dayStr = today.toLocaleDateString("en-US", { weekday: "long" });

    document.getElementById("statusDate").value = dateStr;
    document.getElementById("statusDay").value = dayStr;

    // ADD THIS: Update day when date changes
    document
      .getElementById("statusDate")
      .addEventListener("change", function () {
        const selectedDate = new Date(this.value);
        const dayName = selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
        });
        document.getElementById("statusDay").value = dayName;
      });

    // Pre-fill with today's data if it exists
    const todayReport = this.dailyStatusReports.find(
      (report) => report.date === dateStr,
    );
    if (todayReport) {
      document.getElementById("hardworkScore").value =
        todayReport.scores.hardwork;
      document.getElementById("healthScore").value = todayReport.scores.health;
      document.getElementById("schoolWorkScore").value =
        todayReport.scores.school_work;
      if (todayReport.extras) {
        document.getElementById("reviseLessons").checked =
          todayReport.extras.reviseLessons || false;
        document.getElementById("maintainDiet").checked =
          todayReport.extras.maintainDiet || false;
      }
    }

    document.getElementById("statusModal").classList.remove("hidden");
    document.getElementById("statusModal").classList.add("flex");
  }

  // Close Status Modal Method
  closeStatusModal() {
    document.getElementById("statusModal").classList.add("hidden");
    document.getElementById("statusModal").classList.remove("flex");
    document.getElementById("statusForm").reset();
  }
  constructor() {
    this.currentMode = "warrior";
    this.studySessions =
      JSON.parse(localStorage.getItem("studySessions")) || [];
    this.savedQuotes = JSON.parse(localStorage.getItem("savedQuotes")) || [];
    // Add this line in the constructor after this.savedQuotes
    this.dailyStatusReports =
      JSON.parse(localStorage.getItem("dailyStatusReports")) || [];

    // Timer properties
    this.timerInterval = null;
    this.isRunning = false;
    this.timeLeft = 25 * 60; // 25 minutes in seconds
    this.totalTime = 25 * 60;
    this.currentTimerMode = "Focus Time";
    this.timerStats = JSON.parse(localStorage.getItem("timerStats")) || {
      completedSessions: 0,
      focusTimeToday: 0,
      currentStreak: 0,
      lastDate: new Date().toDateString(),
    };

    this.quotes = {
      bhakti: [
        {
          text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
          author: "Bhagavad Gita 2.47",
        },
        { text: "योगस्थः कुरु कर्माणि", author: "Bhagavad Gita 2.48" },
        {
          text: "श्रद्धावान् लभते ज्ञानम्",
          author: "Bhagavad Gita 4.39",
        },
        {
          text: "मन एव मनुष्याणां कारणं बन्धमोक्षयोः",
          author: "Ancient Wisdom",
        },
        { text: "तत्त्वमसि - You are That", author: "Upanishads" },
      ],
      warrior: [
        {
          text: "The COMEBACK is greater than that of Setback.",
          author: "Anonymous",
        },
        {
          text: "Success is not about motivation, it's about consistency.",
          author: "Anonymous",
        },
        {
          text: "Discipline is choosing between what you want now and what you want most.",
          author: "Abraham Lincoln",
        },
        {
          text: "The pain of discipline weighs ounces, but the pain of regret weighs tons.",
          author: "Jim Rohn",
        },
        {
          text: "Champions don't become champions in the ring. They become champions in training.",
          author: "Muhammad Ali",
        },
        {
          text: "Your 4.00 journey begins with a single step of discipline.",
          author: "Study Warrior",
        },
      ],
      peace: [
        {
          text: "Peace comes from within. Do not seek it without.",
          author: "Buddha",
        },
        {
          text: "In the midst of winter, I found there was, within me, an invincible summer.",
          author: "Albert Camus",
        },
        {
          text: "Breathe in peace, breathe out stress.",
          author: "Mindfulness Practice",
        },
        {
          text: "Be present in all things and thankful for all things.",
          author: "Maya Angelou",
        },
        {
          text: "Stillness is where creativity and solutions are found.",
          author: "Eckhart Tolle",
        },
      ],
    };

    this.init();
  }

  init() {
    this.updateDateTime();
    this.generateNewQuote();
    this.loadStudySessions();
    // Add this line to your init() method after this.loadSavedQuotes();
    this.loadDailyStatus();
    this.loadSavedQuotes();
    this.setupEventListeners();
    this.updateTimerDisplay();
    this.loadTimerStats();
    this.checkDateReset();

    // Update time every minute
    setInterval(() => this.updateDateTime(), 60000);
  }

  updateDateTime() {
    const now = new Date();
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    document.getElementById("currentDate").textContent = now.toLocaleDateString(
      "en-US",
      dateOptions,
    );
    document.getElementById("currentTime").textContent = now.toLocaleTimeString(
      "en-US",
      timeOptions,
    );
  }

  setMotivationMode(mode) {
    this.currentMode = mode;
    // Update active button styling
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.remove("ring-2", "ring-white");
    });
    event.target.classList.add("ring-2", "ring-white");
    this.generateNewQuote();
  }

  generateNewQuote() {
    const quotes = this.quotes[this.currentMode];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    document.getElementById("motivationQuote").textContent = randomQuote.text;
    document.getElementById("quoteAuthor").textContent =
      `— ${randomQuote.author}`;

    // Add animation
    const quoteElement =
      document.getElementById("motivationQuote").parentElement;
    quoteElement.classList.add("animate-slide-up");
    setTimeout(() => quoteElement.classList.remove("animate-slide-up"), 300);
  }

  saveQuote() {
    const quoteText = document.getElementById("motivationQuote").textContent;
    const quoteAuthor = document.getElementById("quoteAuthor").textContent;

    const quote = {
      text: quoteText,
      author: quoteAuthor,
      mode: this.currentMode,
      timestamp: new Date().toISOString(),
    };
    // Add this line in the constructor after this.savedQuotes
    this.dailyStatusReports =
      JSON.parse(localStorage.getItem("dailyStatusReports")) || [];

    // Check if quote already exists
    const exists = this.savedQuotes.some((q) => q.text === quoteText);
    if (!exists) {
      this.savedQuotes.unshift(quote);
      localStorage.setItem("savedQuotes", JSON.stringify(this.savedQuotes));
      this.loadSavedQuotes();
      this.showNotification("Quote saved successfully! 💫");
    } else {
      this.showNotification("Quote already saved! 📌");
    }
  }

  addStudySession(subject, startTime, endTime) {
    const session = {
      id: Date.now(),
      subject,
      startTime,
      endTime,
      duration: this.calculateDuration(startTime, endTime),
      completed: false,
      timestamp: new Date().toISOString(),
    };

    this.studySessions.push(session);
    this.studySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    localStorage.setItem("studySessions", JSON.stringify(this.studySessions));
    this.loadStudySessions();
  }

  toggleSessionCompletion(sessionId) {
    const session = this.studySessions.find((s) => s.id === sessionId);
    if (session) {
      session.completed = !session.completed;
      localStorage.setItem("studySessions", JSON.stringify(this.studySessions));
      this.loadStudySessions();
    }
  }

  deleteStudySession(sessionId) {
    this.studySessions = this.studySessions.filter((s) => s.id !== sessionId);
    localStorage.setItem("studySessions", JSON.stringify(this.studySessions));
    this.loadStudySessions();
  }

  calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let diff = (end - start) / (1000 * 60); // minutes

    if (diff < 0) {
      diff += 24 * 60; // Add 24 hours if end time is next day
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  getCurrentTimeStatus(startTime, endTime) {
    const now = new Date();
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    if (currentTime < startTime) {
      return "upcoming";
    } else if (currentTime >= startTime && currentTime <= endTime) {
      return "current";
    } else {
      return "past";
    }
  }

  loadStudySessions() {
    const container = document.getElementById("studySessionsList");

    if (this.studySessions.length === 0) {
      container.innerHTML = `
                        <div class="text-center py-8 text-gray-300">
                            <p class="text-lg">📝 No study sessions planned yet</p>
                            <p class="text-sm">Click "Add Session" to get started!</p>
                        </div>
                    `;
      this.updateStats();
      return;
    }

    container.innerHTML = this.studySessions
      .map((session) => {
        const timeStatus = this.getCurrentTimeStatus(
          session.startTime,
          session.endTime,
        );
        let statusClass = "";
        let statusIcon = "";

        if (session.completed) {
          statusClass = "study-session-completed";
          statusIcon = "✅";
        } else if (timeStatus === "current") {
          statusClass = "study-session-upcoming";
          statusIcon = "⏰";
        } else {
          statusClass = "study-session-pending";
          statusIcon = "📚";
        }

        return `
                        <div class="flex items-center justify-between p-4 rounded-lg ${statusClass} animate-fade-in">
                            <div class="flex items-center space-x-3">
                                <input type="checkbox" ${
                                  session.completed ? "checked" : ""
                                } 
                                       onchange="app.toggleSessionCompletion(${
                                         session.id
                                       })"
                                       class="w-5 h-5 text-green-500 rounded">
                                <div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-lg">${statusIcon}</span>
                                        <span class="font-medium">${
                                          session.startTime
                                        } – ${session.endTime}</span>
                                        <span class="text-sm opacity-75">(${
                                          session.duration
                                        })</span>
                                    </div>
                                    <p class="text-sm opacity-90">${
                                      session.subject
                                    }</p>
                                </div>
                            </div>
                            <button onclick="app.deleteStudySession(${
                              session.id
                            })" 
                                    class="text-white/70 hover:text-red-300 transition-colors">
                                🗑️
                            </button>
                        </div>
                    `;
      })
      .join("");

    this.updateStats();
  }

  updateStats() {
    const completed = this.studySessions.filter((s) => s.completed).length;
    const pending = this.studySessions.filter((s) => !s.completed).length;
    const totalMinutes = this.studySessions.reduce((total, session) => {
      const duration = session.duration;
      const hours = parseInt(
        duration.match(/(\d+)h/) ? duration.match(/(\d+)h/)[1] : 0,
      );
      const minutes = parseInt(
        duration.match(/(\d+)m/) ? duration.match(/(\d+)m/)[1] : 0,
      );
      return total + hours * 60 + minutes;
    }, 0);

    const totalHours = (totalMinutes / 60).toFixed(1);

    document.getElementById("completedCount").textContent = completed;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("totalHours").textContent = totalHours;
  }

  loadSavedQuotes() {
    const container = document.getElementById("savedQuotesList");

    if (this.savedQuotes.length === 0) {
      container.innerHTML =
        '<p class="text-gray-300 text-center py-4">No saved quotes yet. Save your favorites! ⭐</p>';
      return;
    }

    container.innerHTML = this.savedQuotes
      .map(
        (quote, index) => `
                    <div class="bg-white/10 rounded-lg p-3 flex justify-between items-start">
                        <div class="flex-1">
                            <p class="text-white text-sm">"${quote.text}"</p>
                            <p class="text-gray-300 text-xs mt-1">${quote.author}</p>
                        </div>
                        <button onclick="app.deleteSavedQuote(${index})" class="text-red-400 hover:text-red-300 ml-2">
                            ✕
                        </button>
                    </div>
                `,
      )
      .join("");
  }

  deleteSavedQuote(index) {
    this.savedQuotes.splice(index, 1);
    localStorage.setItem("savedQuotes", JSON.stringify(this.savedQuotes));
    this.loadSavedQuotes();
  }

  setupEventListeners() {
    // Add Session Form
    document
      .getElementById("addSessionForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();

        const subject = document.getElementById("sessionSubject").value;
        const startTime = document.getElementById("sessionStartTime").value;
        const endTime = document.getElementById("sessionEndTime").value;

        if (startTime >= endTime) {
          this.showNotification(
            "End time must be after start time! ⏰",
            "error",
          );
          return;
        }

        this.addStudySession(subject, startTime, endTime);
        this.closeAddSessionModal();
        this.showNotification("Study session added successfully! 📚");
      });

    // ADD THIS: Status Form Event Listener
    document.getElementById("statusForm").addEventListener("submit", (e) => {
      e.preventDefault();

      const date = document.getElementById("statusDate").value;
      const day = document.getElementById("statusDay").value;
      const hardwork = document.getElementById("hardworkScore").value;
      const health = document.getElementById("healthScore").value;
      const schoolWork = document.getElementById("schoolWorkScore").value;
      const reviseLessons = document.getElementById("reviseLessons").checked;
      const maintainDiet = document.getElementById("maintainDiet").checked;

      // Validate inputs
      if (!date || !hardwork || !health || !schoolWork) {
        this.showNotification("Please fill all fields! ⚠️", "error");
        return;
      }

      // Add the status report
      const report = this.addDailyStatus(
        date,
        day,
        hardwork,
        health,
        schoolWork,
        reviseLessons,
        maintainDiet,
      );

      this.closeStatusModal();
      this.showNotification(
        `Status saved! Total Score: ${
          report.total_score
        }/27.5 - ${report.remarks.split("—")[0].trim()}! 📊`,
      );
    });
  }

  downloadStatusExcel() {
    // Get all status reports from localStorage
    const data = JSON.parse(localStorage.getItem("dailyStatusReports")) || [];
    if (data.length === 0) {
      alert("No status data to export!");
      return;
    }

    // Prepare data for Excel with S.NO. and correct headers
    const rows = data.map((report, idx) => ({
      "S.NO.": idx + 1,
      Date: report.date,
      Day: report.day,
      "Hardwork (10)": report.scores.hardwork,
      "Health (15)": report.scores.health,
      "School Work (2.5)": report.scores.school_work,
      "Revise Lessons": report.extras?.reviseLessons ? "Yes" : "No",
      "Maintain Diet": report.extras?.maintainDiet ? "Yes" : "No",
      "Total Score": report.total_score,
      "Average Score": report.average_score,
      Remarks: report.remarks,
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [
        "S.NO.",
        "Date",
        "Day",
        "Hardwork (10)",
        "Health (15)",
        "School Work (2.5)",
        "Revise Lessons",
        "Maintain Diet",
        "Total Score",
        "Average Score",
        "Remarks",
      ],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Status");

    // Download file
    XLSX.writeFile(wb, "DailyStatus.xlsx");
  }

  openAddSessionModal() {
    document.getElementById("addSessionModal").classList.remove("hidden");
    document.getElementById("addSessionModal").classList.add("flex");
    document.getElementById("sessionSubject").focus();
  }

  closeAddSessionModal() {
    document.getElementById("addSessionModal").classList.add("hidden");
    document.getElementById("addSessionModal").classList.remove("flex");
    document.getElementById("addSessionForm").reset();
  }

  showNotification(message, type = "success") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white font-medium`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add("translate-x-0"), 100);

    // Hide notification
    setTimeout(() => {
      notification.classList.add("translate-x-full");
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  // Timer Methods
  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      document.getElementById("startBtn").classList.add("hidden");
      document.getElementById("pauseBtn").classList.remove("hidden");

      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        this.updateTimerDisplay();
        this.updateProgressRing();

        if (this.timeLeft <= 0) {
          this.timerComplete();
        }
      }, 1000);
    }
  }

  pauseTimer() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.timerInterval);
      document.getElementById("startBtn").classList.remove("hidden");
      document.getElementById("pauseBtn").classList.add("hidden");
    }
  }

  resetTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timeLeft = this.totalTime;
    this.updateTimerDisplay();
    this.updateProgressRing();
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
  }

  setTimer(minutes, mode) {
    this.pauseTimer();
    this.totalTime = minutes * 60;
    this.timeLeft = this.totalTime;
    this.currentTimerMode = mode;
    this.updateTimerDisplay();
    this.updateProgressRing();
  }

  setCustomTimer() {
    const minutes = parseInt(document.getElementById("customMinutes").value);
    if (minutes > 0 && minutes <= 190) {
      this.setTimer(minutes, "Custom Timer");
      this.showNotification(`Timer set for ${minutes} minutes! ⏱️`);
    } else {
      this.showNotification(
        "Please enter a valid time (1-190 minutes)! ⚠️",
        "error",
      );
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    document.getElementById("timerDisplay").textContent = display;
    document.getElementById("timerMode").textContent = this.currentTimerMode;

    // Update page title with timer
    if (this.isRunning) {
      document.title = `${display} - ${this.currentTimerMode} | 4.00 Journey`;
    } else {
      document.title = "4.00 Journey - Study Planner & Motivation Tracker";
    }
  }

  updateProgressRing() {
    const progress = (this.totalTime - this.timeLeft) / this.totalTime;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - progress * circumference;

    const ring = document.getElementById("progressRing");
    ring.style.strokeDashoffset = offset;

    // Change color based on time remaining
    if (this.timeLeft <= 60) {
      // Last minute
      ring.style.stroke = "#EF4444"; // Red
    } else if (this.timeLeft <= 300) {
      // Last 5 minutes
      ring.style.stroke = "#F59E0B"; // Orange
    } else {
      ring.style.stroke = "#10B981"; // Green
    }
  }

  timerComplete() {
    this.pauseTimer();
    this.updateTimerStats();
    this.playNotificationSound();

    // Show completion notification
    if (
      this.currentTimerMode.includes("Focus") ||
      this.currentTimerMode.includes("Pomodoro")
    ) {
      this.showNotification("🎉 Focus session completed! Time for a break!");
    } else {
      this.showNotification("✨ Break time over! Ready to focus again?");
    }

    // Auto-suggest next timer
    this.suggestNextTimer();
  }

  updateTimerStats() {
    const today = new Date().toDateString();

    if (this.timerStats.lastDate !== today) {
      // Reset daily stats for new day
      this.timerStats.focusTimeToday = 0;
      this.timerStats.lastDate = today;
    }

    if (
      this.currentTimerMode.includes("Focus") ||
      this.currentTimerMode.includes("Pomodoro") ||
      this.currentTimerMode === "Deep Focus"
    ) {
      this.timerStats.completedSessions++;
      this.timerStats.focusTimeToday += Math.floor(this.totalTime / 60);
      this.timerStats.currentStreak++;
    } else {
      // Don't break streak for break timers
    }

    localStorage.setItem("timerStats", JSON.stringify(this.timerStats));
    this.loadTimerStats();
  }

  loadTimerStats() {
    document.getElementById("completedSessions").textContent =
      this.timerStats.completedSessions;
    document.getElementById("focusTimeToday").textContent =
      `${this.timerStats.focusTimeToday}h`;
    document.getElementById("currentStreak").textContent =
      this.timerStats.currentStreak;
  }

  checkDateReset() {
    const today = new Date().toDateString();
    if (this.timerStats.lastDate !== today) {
      this.timerStats.focusTimeToday = 0;
      this.timerStats.lastDate = today;
      localStorage.setItem("timerStats", JSON.stringify(this.timerStats));
      this.loadTimerStats();
    }
  }

  suggestNextTimer() {
    setTimeout(() => {
      if (
        this.currentTimerMode.includes("Focus") ||
        this.currentTimerMode.includes("Pomodoro")
      ) {
        // Suggest break after focus
        if (this.timerStats.completedSessions % 4 === 0) {
          this.setTimer(15, "Long Break");
          this.showNotification("Long break time! You've earned it! 🛋️");
        } else {
          this.setTimer(5, "Short Break");
          this.showNotification("Take a short break! ☕");
        }
      } else {
        // Suggest focus after break
        this.setTimer(25, "Focus time");
        this.showNotification("Ready to focus again? 🍅");
      }
    }, 2000);
  }

  playNotificationSound() {
    // Create audio context for notification sound
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Fallback for browsers that don't support Web Audio API
      console.log("Timer completed!");
    }
  }
}

// Global functions for HTML onclick events
function setMotivationMode(mode) {
  app.setMotivationMode(mode);
}

function generateNewQuote() {
  app.generateNewQuote();
}

function saveQuote() {
  app.saveQuote();
}

function openAddSessionModal() {
  app.openAddSessionModal();
}

function closeAddSessionModal() {
  app.closeAddSessionModal();
}

// Timer global functions
function startTimer() {
  app.startTimer();
}

function pauseTimer() {
  app.pauseTimer();
}

function resetTimer() {
  app.resetTimer();
}

function setTimer(minutes, mode) {
  app.setTimer(minutes, mode);
}

function setCustomTimer() {
  app.setCustomTimer();
}

function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById("themeIcon");
  if (body.classList.contains("light-theme")) {
    body.classList.remove("light-theme");
    localStorage.setItem("theme", "dark");
    icon.textContent = "🌙";
  } else {
    body.classList.add("light-theme");
    localStorage.setItem("theme", "light");
    icon.textContent = "☀️";
  }
}

// Global functions for status modal
function openStatusModal() {
  app.openStatusModal();
}

function closeStatusModal() {
  app.closeStatusModal();
}

// On load, set theme from localStorage
document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("theme");
  const icon = document.getElementById("themeIcon");
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    if (icon) icon.textContent = "☀️";
  } else {
    document.body.classList.remove("light-theme");
    if (icon) icon.textContent = "🌙";
  }
  // Initialize default mode styling
  const warriorBtn = document.querySelector(
    "[onclick=\"setMotivationMode('warrior')\"]",
  );
  if (warriorBtn) {
    warriorBtn.classList.add("ring-2", "ring-white");
  }
});

// Add these functions after the existing global functions and before "// Initialize app"

// Global functions for status modal
function openStatusModal() {
  app.openStatusModal();
}

function closeStatusModal() {
  app.closeStatusModal();
}
function downloadStatusExcel() {
  app.downloadStatusExcel();
}

// Initialize app
const app = new StudyPlannerApp();
