/* App controller: rendering + interaction. Vanilla JS, no build step. */
(() => {
  const view = document.getElementById("view");
  const modal = document.getElementById("modal");

  const state = {
    tab: "workout",
    date: todayStr(),
    pickerSearch: "",
    pickerMuscle: "All",
    historyOpen: {}, // date -> bool
  };

  // ---------- Helpers ----------
  function todayStr() {
    const d = new Date();
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
  }
  function unit() {
    return Store.getUnit();
  }
  function allExercises() {
    return [...EXERCISES, ...Store.getCustomExercises()];
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function fmtDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1400);
  }
  // current working workout (always exists in memory for the selected date)
  function currentWorkout() {
    return Store.getWorkout(state.date) || { date: state.date, exercises: [] };
  }
  function persist(workout) {
    Store.saveWorkout(workout);
  }

  // ---------- Stats ----------
  function workoutStats(w) {
    let sets = 0;
    w.exercises.forEach((ex) => { ex.sets.forEach(() => { sets += 1; }); });
    return { exercises: w.exercises.length, sets };
  }

  function shiftDate(days) {
    const [y, m, d] = state.date.split("-").map(Number);
    const next = new Date(y, m - 1, d + days);
    const off = next.getTimezoneOffset();
    const clamped = new Date(Math.min(next.getTime() - off * 60000, Date.now()));
    state.date = clamped.toISOString().slice(0, 10);
  }

  // ============================================================
  //  WORKOUT TAB
  // ============================================================
  function renderWorkout() {
    const w = currentWorkout();
    const stats = workoutStats(w);

    const isToday = state.date === todayStr();
    let html = `
      <div class="datebar">
        <button class="arrow-btn" id="prevDay">&#8592;</button>
        <input type="date" id="dateInput" value="${state.date}" max="${todayStr()}" />
        <button class="arrow-btn" id="nextDay" ${isToday ? "disabled" : ""}>&#8594;</button>
        <button class="today-btn" id="todayBtn">Today</button>
      </div>
      <div class="summary">
        <div class="stat"><b>${stats.exercises}</b><span>Exercises</span></div>
        <div class="stat"><b>${stats.sets}</b><span>Sets</span></div>
      </div>
    `;

    if (w.exercises.length === 0) {
      html += `
        <div class="empty">
          <span class="big">💪</span>
          No exercises yet for this day.<br/>Tap below to add your first one.
        </div>`;
    } else {
      w.exercises.forEach((ex, ei) => {
        html += `
          <div class="card" data-ei="${ei}">
            <div class="ex-head">
              <div>
                <div class="ex-name">${esc(ex.name)}</div>
                <span class="ex-muscle">${esc(ex.muscle || "")}</span>
              </div>
              <button class="icon-btn danger" data-act="del-ex" data-ei="${ei}">🗑</button>
            </div>
            <div class="sets">
              <div class="col-h">#</div>
              <div class="col-h">Reps</div>
              <div class="col-h">Weight (${unit()})</div>
              <div class="col-h"></div>
              ${ex.sets.map((s, si) => `
                <div class="set-idx">${si + 1}</div>
                <input type="number" inputmode="numeric" min="0" placeholder="0"
                       value="${s.reps ?? ""}" data-act="reps" data-ei="${ei}" data-si="${si}" />
                <input type="number" inputmode="decimal" min="0" step="0.5" placeholder="0"
                       value="${s.weight ?? ""}" data-act="weight" data-ei="${ei}" data-si="${si}" />
                <button class="icon-btn danger" data-act="del-set" data-ei="${ei}" data-si="${si}">✕</button>
              `).join("")}
            </div>
            <div class="btn-row">
              <button class="btn ghost" data-act="add-set" data-ei="${ei}">+ Add Set</button>
            </div>
          </div>`;
      });
    }

    html += `<button class="add-ex-btn" id="addExBtn">+ Add Exercise</button>`;
    view.innerHTML = html;

    // wire up
    document.getElementById("dateInput").addEventListener("change", (e) => {
      state.date = e.target.value || todayStr();
      render();
    });
    document.getElementById("todayBtn").addEventListener("click", () => {
      state.date = todayStr();
      render();
    });
    document.getElementById("prevDay").addEventListener("click", () => {
      shiftDate(-1);
      render();
    });
    document.getElementById("nextDay").addEventListener("click", () => {
      shiftDate(1);
      render();
    });
    document.getElementById("addExBtn").addEventListener("click", openPicker);

    view.querySelectorAll("[data-act]").forEach((el) => {
      const act = el.dataset.act;
      if (act === "reps" || act === "weight") {
        el.addEventListener("input", onSetInput);
      } else {
        el.addEventListener("click", onWorkoutClick);
      }
    });
  }

  function onSetInput(e) {
    const { ei, si, act } = e.target.dataset;
    const w = currentWorkout();
    const val = e.target.value === "" ? "" : Number(e.target.value);
    w.exercises[ei].sets[si][act] = val;
    persist(w);
    updateSummary();
  }

  function updateSummary() {
    const stats = workoutStats(currentWorkout());
    const stat = view.querySelectorAll(".summary .stat b");
    if (stat.length >= 2) {
      stat[0].textContent = stats.exercises;
      stat[1].textContent = stats.sets;
    }
  }

  function onWorkoutClick(e) {
    const { act, ei, si } = e.currentTarget.dataset;
    const w = currentWorkout();
    if (act === "add-set") {
      const sets = w.exercises[ei].sets;
      const last = sets[sets.length - 1];
      sets.push({ reps: last ? last.reps : "", weight: last ? last.weight : "" });
      persist(w);
      renderWorkout();
    } else if (act === "del-set") {
      w.exercises[ei].sets.splice(si, 1);
      if (w.exercises[ei].sets.length === 0) w.exercises[ei].sets.push({ reps: "", weight: "" });
      persist(w);
      renderWorkout();
    } else if (act === "del-ex") {
      w.exercises.splice(ei, 1);
      persist(w);
      renderWorkout();
    }
  }

  function addExerciseToWorkout(ex) {
    const w = currentWorkout();
    w.exercises.push({
      exId: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      sets: [{ reps: "", weight: "" }],
    });
    persist(w);
    closePicker();
    state.tab = "workout";
    syncTabs();
    renderWorkout();
    toast(`Added ${ex.name}`);
  }

  // ============================================================
  //  EXERCISE PICKER (modal)
  // ============================================================
  function openPicker() {
    state.pickerSearch = "";
    state.pickerMuscle = "All";
    modal.classList.remove("hidden");
    document.getElementById("pickerSearch").value = "";
    renderPicker();
  }
  function closePicker() {
    modal.classList.add("hidden");
  }

  function renderPicker() {
    const chipWrap = document.getElementById("pickerChips");
    const groups = ["All", ...MUSCLE_GROUPS];
    chipWrap.innerHTML = groups.map((g) =>
      `<button class="chip ${state.pickerMuscle === g ? "is-active" : ""}" data-m="${esc(g)}">${esc(g)}</button>`
    ).join("");
    chipWrap.querySelectorAll(".chip").forEach((c) =>
      c.addEventListener("click", () => {
        state.pickerMuscle = c.dataset.m;
        renderPicker();
      })
    );

    const q = state.pickerSearch.trim().toLowerCase();
    let list = allExercises();
    if (state.pickerMuscle !== "All") list = list.filter((e) => e.muscle === state.pickerMuscle);
    if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));

    const listEl = document.getElementById("pickerList");
    let html = "";
    if (list.length === 0) {
      html += `<div class="empty">No matches.</div>`;
    } else {
      // group by muscle for display
      const byMuscle = {};
      list.forEach((e) => { (byMuscle[e.muscle] = byMuscle[e.muscle] || []).push(e); });
      Object.keys(byMuscle).forEach((m) => {
        html += `<div class="muscle-group"><div class="section-title">${esc(m)}</div>`;
        byMuscle[m].forEach((e) => {
          html += `
            <div class="ex-item">
              <div class="ex-item-main"><div class="name">${esc(e.name)}</div></div>
              <button class="add" data-id="${esc(e.id)}">Add</button>
            </div>`;
        });
        html += `</div>`;
      });
    }

    // add custom exercise form
    html += `
      <div class="add-custom">
        <div class="section-title">Add Custom Exercise</div>
        <div class="row2">
          <input id="customName" type="text" placeholder="Exercise name" />
          <select id="customMuscle">
            ${MUSCLE_GROUPS.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join("")}
          </select>
        </div>
        <button class="btn primary block" id="addCustomBtn" style="margin-top:8px;">Create & Add</button>
      </div>`;

    listEl.innerHTML = html;

    listEl.querySelectorAll(".add").forEach((b) =>
      b.addEventListener("click", () => {
        const ex = allExercises().find((e) => e.id === b.dataset.id);
        if (ex) addExerciseToWorkout(ex);
      })
    );
    document.getElementById("addCustomBtn").addEventListener("click", () => {
      const name = document.getElementById("customName").value.trim();
      const muscle = document.getElementById("customMuscle").value;
      if (!name) { toast("Enter a name"); return; }
      const ex = { id: "custom-" + Date.now(), name, muscle, custom: true };
      Store.addCustomExercise(ex);
      addExerciseToWorkout(ex);
    });
  }

  // ============================================================
  //  LIBRARY TAB
  // ============================================================
  function renderLibrary() {
    const q = state.pickerSearch.trim().toLowerCase();
    let list = allExercises();
    if (state.pickerMuscle !== "All") list = list.filter((e) => e.muscle === state.pickerMuscle);
    if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));

    const groups = ["All", ...MUSCLE_GROUPS];
    let html = `
      <div class="body-fig-wrap">
        ${buildBodyFigure(state.pickerMuscle)}
        ${state.pickerMuscle !== "All" ? `
          <div class="body-fig-active-label">
            ${esc(state.pickerMuscle)}
            <button class="body-fig-clear" id="bodyFigClear">✕ All</button>
          </div>` : ""}
      </div>
      <input id="libSearch" class="search" type="search" placeholder="Search exercises…" value="${esc(state.pickerSearch)}" autocomplete="off" />
      <div class="chips" id="libChips">
        ${groups.map((g) => `<button class="chip ${state.pickerMuscle === g ? "is-active" : ""}" data-m="${esc(g)}">${esc(g)}</button>`).join("")}
      </div>
    `;

    const byMuscle = {};
    list.forEach((e) => { (byMuscle[e.muscle] = byMuscle[e.muscle] || []).push(e); });

    if (list.length === 0) {
      html += `<div class="empty">No matches.</div>`;
    } else {
      Object.keys(byMuscle).forEach((m) => {
        html += `<div class="muscle-group"><div class="section-title">${esc(m)} · ${byMuscle[m].length}</div>`;
        byMuscle[m].forEach((e) => {
          html += `
            <div class="ex-item">
              <div class="ex-item-main"><div><div class="name">${esc(e.name)}</div>${e.custom ? '<div class="meta">Custom</div>' : ""}</div></div>
              <div class="ex-item-actions">
                <button class="add" data-id="${esc(e.id)}">+ Add</button>
                ${e.custom ? `<button class="icon-btn danger" data-del="${esc(e.id)}" title="Delete exercise">🗑</button>` : ""}
              </div>
            </div>`;
        });
        html += `</div>`;
      });
    }

    html += `
      <div class="card">
        <div class="section-title">Add Custom Exercise</div>
        <div class="row2" style="display:flex; gap:8px;">
          <input id="libCustomName" class="search" style="margin:0; flex:1;" type="text" placeholder="Exercise name" />
          <select id="libCustomMuscle" class="search" style="margin:0; width:auto;">
            ${MUSCLE_GROUPS.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join("")}
          </select>
        </div>
        <button class="btn primary block" id="libAddCustom" style="margin-top:10px;">Create Exercise</button>
      </div>`;

    view.innerHTML = html;

    const search = document.getElementById("libSearch");
    search.addEventListener("input", (e) => {
      state.pickerSearch = e.target.value;
      renderLibrary();
      // keep focus + caret at end after re-render
      const s = document.getElementById("libSearch");
      s.focus();
      s.setSelectionRange(s.value.length, s.value.length);
    });
    document.getElementById("libChips").querySelectorAll(".chip").forEach((c) =>
      c.addEventListener("click", () => { state.pickerMuscle = c.dataset.m; renderLibrary(); })
    );
    // Body figure region clicks
    view.querySelectorAll("[data-muscle]").forEach((el) =>
      el.addEventListener("click", () => {
        const m = el.dataset.muscle;
        state.pickerMuscle = state.pickerMuscle === m ? "All" : m;
        renderLibrary();
      })
    );
    const clearBtn = document.getElementById("bodyFigClear");
    if (clearBtn) clearBtn.addEventListener("click", () => { state.pickerMuscle = "All"; renderLibrary(); });
    view.querySelectorAll(".add").forEach((b) =>
      b.addEventListener("click", () => {
        const ex = allExercises().find((e) => e.id === b.dataset.id);
        if (ex) {
          addExerciseToWorkout(ex);
        }
      })
    );
    view.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => {
        const ex = allExercises().find((e) => e.id === b.dataset.del);
        if (ex && confirm(`Delete "${ex.name}"? This only removes it from your library; past workouts keep it.`)) {
          Store.removeCustomExercise(b.dataset.del);
          renderLibrary();
          toast("Exercise deleted");
        }
      })
    );
    document.getElementById("libAddCustom").addEventListener("click", () => {
      const name = document.getElementById("libCustomName").value.trim();
      const muscle = document.getElementById("libCustomMuscle").value;
      if (!name) { toast("Enter a name"); return; }
      Store.addCustomExercise({ id: "custom-" + Date.now(), name, muscle, custom: true });
      toast(`Created ${name}`);
      renderLibrary();
    });
  }

  // ============================================================
  //  HISTORY TAB
  // ============================================================
  function renderHistory() {
    const workouts = Store.getWorkouts()
      .filter((w) => w.exercises.length > 0)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    if (workouts.length === 0) {
      view.innerHTML = `
        <div class="empty">
          <span class="big">📈</span>
          No workout history yet.<br/>Log a workout and it'll show up here.
        </div>`;
      return;
    }

    let html = `<div class="section-title">${workouts.length} Workout${workouts.length > 1 ? "s" : ""}</div>`;
    workouts.forEach((w) => {
      const stats = workoutStats(w);
      const open = !!state.historyOpen[w.date];
      html += `
        <div class="hist-item">
          <div class="hist-top" data-act="toggle" data-date="${w.date}" style="cursor:pointer;">
            <div>
              <div class="hist-date">${fmtDate(w.date)}</div>
              <div class="hist-meta">${stats.exercises} exercises · ${stats.sets} sets</div>
            </div>
            <span class="icon-btn">${open ? "▲" : "▼"}</span>
          </div>
          ${open ? `
            <div class="hist-detail">
              ${w.exercises.map((ex) => `
                <div class="row">
                  <span>${esc(ex.name)}</span>
                  <span class="sets-text">${ex.sets.map((s) => `${s.reps || 0}×${s.weight || 0}`).join(", ")}</span>
                </div>`).join("")}
              <div class="btn-row">
                <button class="btn" data-act="open-date" data-date="${w.date}">Open in Workout</button>
                <button class="btn danger" data-act="del-workout" data-date="${w.date}">Delete</button>
              </div>
            </div>` : ""}
        </div>`;
    });
    view.innerHTML = html;

    view.querySelectorAll("[data-act]").forEach((el) =>
      el.addEventListener("click", () => {
        const { act, date } = el.dataset;
        if (act === "toggle") {
          state.historyOpen[date] = !state.historyOpen[date];
          renderHistory();
        } else if (act === "open-date") {
          state.date = date;
          state.tab = "workout";
          syncTabs();
          render();
        } else if (act === "del-workout") {
          if (confirm("Delete this workout? This cannot be undone.")) {
            Store.deleteWorkout(date);
            renderHistory();
            toast("Workout deleted");
          }
        }
      })
    );
  }

  // ============================================================
  //  SHELL
  // ============================================================
  function render() {
    if (state.tab === "workout") renderWorkout();
    else if (state.tab === "library") renderLibrary();
    else if (state.tab === "history") renderHistory();
  }

  function syncTabs() {
    document.querySelectorAll(".tab-btn").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.tab === state.tab)
    );
  }

  function init() {
    // tab bar
    document.querySelectorAll(".tab-btn").forEach((b) =>
      b.addEventListener("click", () => {
        state.tab = b.dataset.tab;
        if (state.tab === "library") { state.pickerSearch = ""; state.pickerMuscle = "All"; }
        syncTabs();
        render();
      })
    );

    // unit toggle
    const unitBtn = document.getElementById("unitToggle");
    unitBtn.textContent = unit();
    unitBtn.addEventListener("click", () => {
      Store.setUnit(unit() === "kg" ? "lb" : "kg");
      unitBtn.textContent = unit();
      render();
    });

    // modal close
    modal.querySelectorAll("[data-close]").forEach((el) =>
      el.addEventListener("click", closePicker)
    );
    document.getElementById("pickerSearch").addEventListener("input", (e) => {
      state.pickerSearch = e.target.value;
      renderPicker();
      const s = document.getElementById("pickerSearch");
      s.focus();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
