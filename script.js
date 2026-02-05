// =========================
// STATE (single source)
// =========================
const state = {
  running: true,
  tzOffset: 0,
  showSeconds: true,
  showDate: true,
  showTicks: true,
  showNumbers: false,
  is24: true,
  soundEnabled: true,

  // alarms
  alarms: [], // { id, hhmm, enabled }

  // stopwatch
  swRunning: false,
  swStartTs: 0,
  swElapsedMs: 0,
  swLaps: [],

  // timer
  timerRunning: false,
  timerRemainingMs: 0,
  timerEndTs: 0
};

// =========================
// DOM
// =========================
const dom = {
  ticks: document.getElementById("ticks"),
  numbers: document.getElementById("numbers"),
  h: document.getElementById("h"),
  m: document.getElementById("m"),
  s: document.getElementById("s"),
  digital: document.getElementById("digital"),
  dateLine: document.getElementById("dateLine"),
  runState: document.getElementById("runState"),
  tzState: document.getElementById("tzState"),
  fmtState: document.getElementById("fmtState"),

  pause: document.getElementById("pause"),
  resume: document.getElementById("resume"),
  tzPlus: document.getElementById("tzPlus"),
  tzMinus: document.getElementById("tzMinus"),
  toggleSeconds: document.getElementById("toggleSeconds"),
  toggleDate: document.getElementById("toggleDate"),
  toggleTicks: document.getElementById("toggleTicks"),
  toggleNumbers: document.getElementById("toggleNumbers"),
  toggleFormat: document.getElementById("toggleFormat"),

  themeSelect: document.getElementById("themeSelect"),
  glowSelect: document.getElementById("glowSelect"),

  alarmTime: document.getElementById("alarmTime"),
  addAlarm: document.getElementById("addAlarm"),
  alarmList: document.getElementById("alarmList"),

  swDisplay: document.getElementById("swDisplay"),
  swStartStop: document.getElementById("swStartStop"),
  swLap: document.getElementById("swLap"),
  swReset: document.getElementById("swReset"),
  lapList: document.getElementById("lapList"),

  tMin: document.getElementById("tMin"),
  tSec: document.getElementById("tSec"),
  timerDisplay: document.getElementById("timerDisplay"),
  timerStartStop: document.getElementById("timerStartStop"),
  timerReset: document.getElementById("timerReset"),

  hardReset: document.getElementById("hardReset"),
  tzZero: document.getElementById("tzZero"),
  toggleSound: document.getElementById("toggleSound"),
  tzInfo: document.getElementById("tzInfo"),
  soundInfo: document.getElementById("soundInfo"),
  engineInfo: document.getElementById("engineInfo")
};

// =========================
// Utilities
// =========================
const pad2 = n => String(n).padStart(2, "0");

function adjustedNow() {
  const d = new Date();
  d.setHours(d.getHours() + state.tzOffset);
  return d;
}

// =========================
// Build Analog Face
// =========================
function buildTicks() {
  dom.ticks.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.className = "tick" + (i % 5 === 0 ? " major" : "");
    el.style.setProperty("--deg", `${i * 6}deg`);
    dom.ticks.appendChild(el);
  }
}

function buildNumbers() {
  dom.numbers.innerHTML = "";
  const center = 160; // for 320px face
  const radius = 125;
  for (let n = 1; n <= 12; n++) {
    const angle = (n * 30 - 90) * Math.PI / 180;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const el = document.createElement("div");
    el.className = "num";
    el.textContent = n;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    dom.numbers.appendChild(el);
  }
}

// =========================
// Audio (beep)
// =========================
let audioCtx = null;

function beep(duration = 160, freq = 880, gain = 0.08) {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    setTimeout(() => o.stop(), duration);
  } catch {
    // ignore if blocked
  }
}

function beepSequence() {
  beep(180, 880, 0.10);
  setTimeout(() => beep(180, 660, 0.10), 220);
  setTimeout(() => beep(220, 990, 0.12), 460);
}

// =========================
// Render: Clock
// =========================
function renderAnalog(time) {
  const ms = time.getMilliseconds();
  const sec = time.getSeconds() + ms / 1000;
  const min = time.getMinutes() + sec / 60;
  const hr = (time.getHours() % 12) + min / 60;

  dom.h.style.transform = `translateX(-50%) rotate(${hr * 30}deg)`;
  dom.m.style.transform = `translateX(-50%) rotate(${min * 6}deg)`;
  dom.s.style.transform = `translateX(-50%) rotate(${sec * 6}deg)`;
}

function renderDigital(time) {
  let h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  let suffix = "";
  if (!state.is24) {
    suffix = h >= 12 ? " PM" : " AM";
    h = h % 12 || 12;
  }

  const secPart = state.showSeconds ? `:${pad2(s)}` : "";
  dom.digital.textContent = `${pad2(h)}:${pad2(m)}${secPart}${suffix}`;

  dom.dateLine.style.display = state.showDate ? "block" : "none";
  if (state.showDate) {
    dom.dateLine.textContent = time.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}

function renderStatus() {
  dom.runState.textContent = state.running ? "Running" : "Paused";
  dom.tzState.textContent = `TZ Offset: ${state.tzOffset}`;
  dom.fmtState.textContent = state.is24 ? "24H" : "12H";
  dom.toggleSeconds.textContent = `Seconds: ${state.showSeconds ? "ON" : "OFF"}`;
  dom.toggleDate.textContent = `Date: ${state.showDate ? "ON" : "OFF"}`;
  dom.toggleTicks.textContent = `Ticks: ${state.showTicks ? "ON" : "OFF"}`;
  dom.toggleNumbers.textContent = `Numbers: ${state.showNumbers ? "ON" : "OFF"}`;
  dom.tzInfo.textContent = String(state.tzOffset);
  dom.soundInfo.textContent = state.soundEnabled ? "Enabled" : "Muted";

  dom.ticks.style.display = state.showTicks ? "block" : "none";
  dom.numbers.style.display = state.showNumbers ? "block" : "none";
}

// =========================
// Alarms
// =========================
function genId() {
  return (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
}

function addAlarm(hhmm) {
  state.alarms.push({ id: genId(), hhmm, enabled: true });
  renderAlarms();
}

function removeAlarm(id) {
  state.alarms = state.alarms.filter(a => a.id !== id);
  renderAlarms();
}

function toggleAlarm(id) {
  const a = state.alarms.find(x => x.id === id);
  if (!a) return;
  a.enabled = !a.enabled;
  renderAlarms();
}

function renderAlarms() {
  dom.alarmList.innerHTML = "";
  if (state.alarms.length === 0) {
    const li = document.createElement("li");
    li.className = "listItem";
    li.innerHTML = `<span class="small">No alarms set.</span><span class="muted">Add one above</span>`;
    dom.alarmList.appendChild(li);
    return;
  }

  for (const a of state.alarms) {
    const li = document.createElement("li");
    li.className = "listItem";
    li.innerHTML = `
      <div>
        <div class="mono" style="font-weight:900">${a.hhmm}</div>
        <div class="small">${a.enabled ? "Enabled" : "Disabled"}</div>
      </div>
      <div class="row" style="gap:6px">
        <button data-act="toggle" data-id="${a.id}" class="secondary">${a.enabled ? "Disable" : "Enable"}</button>
        <button data-act="del" data-id="${a.id}">Delete</button>
      </div>
    `;
    dom.alarmList.appendChild(li);
  }
}

let lastSecond = -1;

function checkAlarms(time) {
  // check once per second: match HH:MM at second 0
  if (time.getSeconds() !== 0) return;
  const hhmm = `${pad2(time.getHours())}:${pad2(time.getMinutes())}`;

  for (const a of state.alarms) {
    if (a.enabled && a.hhmm === hhmm) {
      beepSequence();
    }
  }
}

// =========================
// Stopwatch
// =========================
function formatStopwatch(ms) {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const milli = Math.floor(total % 1000);
  return `${pad2(minutes)}:${pad2(seconds)}.${String(milli).padStart(3, "0")}`;
}

function swStartStop() {
  if (!state.swRunning) {
    state.swRunning = true;
    state.swStartTs = performance.now();
    dom.swStartStop.textContent = "Pause";
  } else {
    state.swRunning = false;
    state.swElapsedMs += performance.now() - state.swStartTs;
    dom.swStartStop.textContent = "Start";
  }
}

function swReset() {
  state.swRunning = false;
  state.swStartTs = 0;
  state.swElapsedMs = 0;
  state.swLaps = [];
  dom.swStartStop.textContent = "Start";
  renderLaps();
  dom.swDisplay.textContent = "00:00.000";
}

function swLap() {
  const elapsed = getStopwatchElapsed();
  state.swLaps.unshift(elapsed);
  renderLaps();
  beep(80, 1200, 0.06);
}

function getStopwatchElapsed() {
  if (!state.swRunning) return state.swElapsedMs;
  return state.swElapsedMs + (performance.now() - state.swStartTs);
}

function renderLaps() {
  dom.lapList.innerHTML = "";
  if (state.swLaps.length === 0) {
    dom.lapList.innerHTML = `<div class="muted">No laps yet.</div>`;
    return;
  }

  state.swLaps.slice(0, 20).forEach((ms, idx) => {
    const row = document.createElement("div");
    row.className = "listItem";
    row.innerHTML = `
      <div class="small">Lap ${state.swLaps.length - idx}</div>
      <div class="mono" style="font-weight:900">${formatStopwatch(ms)}</div>
    `;
    dom.lapList.appendChild(row);
  });
}

// =========================
// Timer
// =========================
function formatTimer(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

function timerStartStop() {
  if (!state.timerRunning) {
    // start: if fresh, read inputs
    if (state.timerRemainingMs <= 0) {
      const mins = Number(dom.tMin.value || 0);
      const secs = Number(dom.tSec.value || 0);
      state.timerRemainingMs = (mins * 60 + secs) * 1000;
    }
    if (state.timerRemainingMs <= 0) return;

    state.timerRunning = true;
    state.timerEndTs = performance.now() + state.timerRemainingMs;
    dom.timerStartStop.textContent = "Pause";
  } else {
    // pause
    state.timerRunning = false;
    state.timerRemainingMs = Math.max(0, state.timerEndTs - performance.now());
    dom.timerStartStop.textContent = "Start";
  }
}

function timerReset() {
  state.timerRunning = false;
  state.timerRemainingMs = 0;
  state.timerEndTs = 0;
  dom.timerStartStop.textContent = "Start";
  dom.timerDisplay.textContent = "00:00";
}

function tickTimer() {
  if (!state.timerRunning) return;
  state.timerRemainingMs = Math.max(0, state.timerEndTs - performance.now());

  if (state.timerRemainingMs <= 0) {
    state.timerRunning = false;
    dom.timerStartStop.textContent = "Start";
    beepSequence();
  }
}

// =========================
// Main Loop (RAF)
// =========================
function loop() {
  const time = adjustedNow();

  if (state.running) {
    renderAnalog(time);
    renderDigital(time);

    // alarm check once per second
    if (time.getSeconds() !== lastSecond) {
      lastSecond = time.getSeconds();
      checkAlarms(time);
    }
  }

  // stopwatch live
  dom.swDisplay.textContent = formatStopwatch(getStopwatchElapsed());

  // timer live
  tickTimer();
  dom.timerDisplay.textContent = formatTimer(state.timerRemainingMs);

  renderStatus();
  requestAnimationFrame(loop);
}

// =========================
// Events
// =========================
dom.pause.onclick = () => state.running = false;
dom.resume.onclick = () => state.running = true;

dom.tzPlus.onclick = () => state.tzOffset++;
dom.tzMinus.onclick = () => state.tzOffset--;

dom.toggleSeconds.onclick = () => state.showSeconds = !state.showSeconds;
dom.toggleDate.onclick = () => state.showDate = !state.showDate;
dom.toggleTicks.onclick = () => state.showTicks = !state.showTicks;
dom.toggleNumbers.onclick = () => state.showNumbers = !state.showNumbers;
dom.toggleFormat.onclick = () => state.is24 = !state.is24;

// theme / glow
dom.themeSelect.onchange = () => {
  document.body.classList.remove("theme-red", "theme-neon", "theme-mono");
  document.body.classList.add(dom.themeSelect.value);
};
dom.glowSelect.onchange = () => {
  document.body.classList.remove("glow-low", "glow-med", "glow-high");
  document.body.classList.add(dom.glowSelect.value);
};

// alarms
dom.addAlarm.onclick = () => {
  const val = dom.alarmTime.value;
  if (!val) return;
  addAlarm(val);
  beep(90, 1000, 0.07);
};

dom.alarmList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { id, act } = btn.dataset;
  if (act === "del") removeAlarm(id);
  if (act === "toggle") toggleAlarm(id);
});

// stopwatch
dom.swStartStop.onclick = swStartStop;
dom.swLap.onclick = swLap;
dom.swReset.onclick = swReset;

// timer
dom.timerStartStop.onclick = timerStartStop;
dom.timerReset.onclick = timerReset;

// quick controls
dom.hardReset.onclick = () => {
  state.running = true;
  state.tzOffset = 0;
  state.showSeconds = true;
  state.showDate = true;
  state.showTicks = true;
  state.showNumbers = false;
  state.is24 = true;
  state.soundEnabled = true;

  state.alarms = [];
  renderAlarms();

  swReset();
  timerReset();
  dom.tMin.value = "";
  dom.tSec.value = "";

  beepSequence();
};

dom.tzZero.onclick = () => state.tzOffset = 0;

dom.toggleSound.onclick = () => {
  state.soundEnabled = !state.soundEnabled;
  dom.toggleSound.textContent = state.soundEnabled ? "Mute" : "Unmute";
  if (state.soundEnabled) beep(80, 900, 0.07);
};

// keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  if (e.code === "Space") {
    e.preventDefault();
    state.running = !state.running;
    beep(60, 700, 0.06);
  }

  if (e.key.toLowerCase() === "a") {
    // quick alarm: next minute
    const t = adjustedNow();
    t.setMinutes(t.getMinutes() + 1);
    addAlarm(`${pad2(t.getHours())}:${pad2(t.getMinutes())}`);
    beep(90, 1100, 0.07);
  }

  if (e.key.toLowerCase() === "s") {
    swStartStop();
    beep(60, 900, 0.06);
  }

  if (e.key.toLowerCase() === "t") {
    timerStartStop();
    beep(60, 820, 0.06);
  }
});

// =========================
// Boot
// =========================
buildTicks();
buildNumbers();
renderAlarms();
renderLaps();
loop();
