
(() => {
  "use strict";

  const STORAGE_KEY = "vibevault-v1";

  const quotes = [
    ["You don't have to bloom every day. Some days, growing roots is enough.", "A gentle reminder"],
    ["You deserve the same patience you give to everyone else.", "A note to self"],
    ["Small steps still move you forward. Rest is part of the journey.", "Keep going softly"],
    ["You are allowed to outgrow places you once called home.", "Room to grow"],
    ["Not every day has to be productive to be meaningful.", "Slow living club"],
    ["Become someone who makes your own life feel like a safe place.", "A little intention"],
    ["Your pace is valid, even when it looks different from everyone else's.", "Trust your timing"],
    ["Let today be imperfect and still be worth remembering.", "For today"]
  ];

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const dateLabel = (value, options = {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) => {
    const d = value instanceof Date ? value : new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString(undefined, options);
  };

  const safeParse = value => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const initial = {
    moods: [],
    notes: [],
    selectedMood: null,
    quoteIndex: 0,
    lowGlow: false
  };

  let state = {
    ...initial,
    ...(safeParse(localStorage.getItem(STORAGE_KEY)) || {})
  };

  if (!Array.isArray(state.moods)) state.moods = [];
  if (!Array.isArray(state.notes)) state.notes = [];

  let pendingMood = null;
  let toastTimer;

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      showToast("Browser storage is full. Try deleting old notes.");
    }
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function updateDate() {
    const now = new Date();

    $("#currentDate").textContent = now.toLocaleDateString(
      undefined,
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );

    $("#todayLabel").textContent = now.toLocaleDateString(
      undefined,
      {
        weekday: "short",
        month: "short",
        day: "numeric"
      }
    ).toUpperCase();
  }

  function renderStats() {
    $("#checkinCount").textContent = state.moods.length;
    $("#noteCount").textContent = state.notes.length;

    const dates = new Set(state.moods.map(item => item.date));
    let streak = 0;
    const cursor = new Date();

    if (!dates.has(todayKey())) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (dates.has(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
    )) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    $("#streakCount").innerHTML =
      `${streak} <em>${streak === 1 ? "day" : "days"}</em>`;
  }

  function renderMoodHistory() {
    const container = $("#moodHistory");

    const recent = [...state.moods]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    if (!recent.length) {
      container.innerHTML =
        '<p class="empty-state">Your mood history will show up here.</p>';
      return;
    }

    container.innerHTML = recent.map(item => `
      <div class="history-item">
        <span class="history-emoji">${escapeHTML(item.emoji)}</span>
        <div class="history-main">
          <b>${escapeHTML(item.mood)}</b>
          <small>${escapeHTML(
            item.date === todayKey()
              ? "Today"
              : dateLabel(item.date, { month: "short", day: "numeric" })
          )}</small>
        </div>
        <time>${escapeHTML(
          new Date(item.createdAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
          })
        )}</time>
      </div>
    `).join("");
  }

  function renderNotes() {
    const container = $("#notesList");

    const notes = [...state.notes]
      .sort((a, b) => b.createdAt - a.createdAt);

    if (!notes.length) {
      container.innerHTML =
        '<p class="empty-state">Your saved thoughts will live here.</p>';
      return;
    }

    container.innerHTML = notes.map(note => `
      <article class="note-card">
        <div class="note-card-head">
          <div>
            <h3>${escapeHTML(note.title || "Untitled thought")}</h3>
            <time>${escapeHTML(
              dateLabel(note.createdAt, { month: "short", day: "numeric" })
            )}</time>
          </div>
          <button
            class="delete-note"
            data-delete="${escapeHTML(note.id)}"
            title="Delete note"
            aria-label="Delete note"
          >×</button>
        </div>
        <p>${escapeHTML(note.body)}</p>
      </article>
    `).join("");
  }

  function renderQuote() {
    const item = quotes[
      ((state.quoteIndex % quotes.length) + quotes.length) % quotes.length
    ];

    $("#quoteText").textContent = item[0];
    $("#quoteAuthor").textContent = `— ${item[1]}`;
  }

  function render() {
    renderStats();
    renderMoodHistory();
    renderNotes();
    renderQuote();

    document.body.classList.toggle(
      "low-glow",
      Boolean(state.lowGlow)
    );

    $("#themeButton").textContent = state.lowGlow ? "✧" : "☼";
  }

  // Mood selection
  $$("#moodGrid .mood-option").forEach(button => {
    button.addEventListener("click", () => {
      $$("#moodGrid .mood-option").forEach(item => {
        item.classList.remove("selected");
      });

      button.classList.add("selected");

      pendingMood = {
        mood: button.dataset.mood,
        emoji: button.dataset.emoji
      };

      $("#moodStatus").textContent =
        `${pendingMood.emoji} ${pendingMood.mood} — sounds like your vibe.`;

      $("#saveMood").disabled = false;
    });
  });

  // Save mood check-in
  $("#saveMood").addEventListener("click", () => {
    if (!pendingMood) return;

    const item = {
      ...pendingMood,
      date: todayKey(),
      createdAt: Date.now()
    };

    state.moods.push(item);
    state.selectedMood = pendingMood.mood;

    persist();
    render();

    $("#moodStatus").textContent =
      `Saved. Thanks for checking in with yourself ${item.emoji}`;

    $("#saveMood").disabled = true;
    showToast("Mood check-in saved ✦");
  });

  // Show another quote
  $("#newQuote").addEventListener("click", () => {
    const previous = state.quoteIndex;

    if (quotes.length > 1) {
      while (state.quoteIndex === previous) {
        state.quoteIndex = Math.floor(Math.random() * quotes.length);
      }
    }

    persist();
    renderQuote();
  });

  // Copy quote
  $("#copyQuote").addEventListener("click", async () => {
    const text =
      `“${$("#quoteText").textContent}” ${$("#quoteAuthor").textContent}`;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Quote copied to clipboard");
    } catch {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();

      const success = document.execCommand("copy");
      temp.remove();

      showToast(
        success
          ? "Quote copied to clipboard"
          : "Could not copy automatically. Please copy the quote manually."
      );
    }
  });

  // Journal character counter
  $("#noteBody").addEventListener("input", () => {
    $("#charCount").textContent =
      `${$("#noteBody").value.length} / 1200`;
  });

  // Save journal note
  $("#journalForm").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("#noteTitle").value.trim();
    const body = $("#noteBody").value.trim();

    if (!body) {
      showToast("Write a little something before saving ✎");
      $("#noteBody").focus();
      return;
    }

    state.notes.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      body,
      createdAt: Date.now()
    });

    persist();
    renderNotes();
    renderStats();

    $("#journalForm").reset();
    $("#charCount").textContent = "0 / 1200";

    showToast("Your thought is saved on this device ✦");
  });

  // Delete journal note
  $("#notesList").addEventListener("click", event => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;

    const note = state.notes.find(
      item => item.id === button.dataset.delete
    );

    if (!note) return;

    if (!window.confirm(
      `Delete "${note.title || "Untitled thought"}"? This cannot be undone.`
    )) return;

    state.notes = state.notes.filter(
      item => item.id !== button.dataset.delete
    );

    persist();
    renderNotes();
    renderStats();
    showToast("Note deleted");
  });

  // Toggle glow intensity
  $("#themeButton").addEventListener("click", () => {
    state.lowGlow = !state.lowGlow;

    persist();
    render();

    showToast(
      state.lowGlow
        ? "Soft glow mode enabled"
        : "Neon glow mode enabled"
    );
  });

  // Start app
  updateDate();
  render();

  const todaysMood = [...state.moods]
    .reverse()
    .find(item => item.date === todayKey());

  if (todaysMood) {
    const button = $$("#moodGrid .mood-option")
      .find(item => item.dataset.mood === todaysMood.mood);

    if (button) button.classList.add("selected");

    $("#moodStatus").textContent =
      `Today's check-in: ${todaysMood.emoji} ${todaysMood.mood}`;
  }
})();
