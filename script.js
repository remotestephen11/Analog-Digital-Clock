"use strict";

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");

const digitalTime = document.getElementById("digitalTime");
const digitalDate = document.getElementById("digitalDate");
const digitalZone = document.getElementById("digitalZone");
const statusText = document.getElementById("statusText");

const toggle24Btn = document.getElementById("toggle24");
const toggleSecondsBtn = document.getElementById("toggleSeconds");
const toggleTickBtn = document.getElementById("toggleTick");
const partyBtn = document.getElementById("party");
const stopPartyBtn = document.getElementById("stopParty");

let use24Hour = false;
let showSeconds = true;
let smoothHands = true;

let rafId = null;
let intervalId = null;

// Set numbers using data attributes (so CSS can counter-rotate neatly)
(function setClockNumbers() {
  const spans = document.querySelectorAll(".nums span");
  spans.forEach((span, idx) => {
    const n = idx + 1;
    span.setAttribute("data-num", String(n));
  });
})();

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  if (use24Hour) {
    const hh = pad2(h);
    const mm = pad2(m);
    const ss = pad2(s);
    return showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  } else {
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const hh = String(h12); // no leading zero feels nicer in 12h
    const mm = pad2(m);
    const ss = pad2(s);
    return showSeconds ? `${hh}:${mm}:${ss} ${suffix}` : `${hh}:${mm} ${suffix}`;
  }
}

function formatDate(date) {
  // Example: Tue, 05 Feb 2026
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const day = date.toLocaleDateString(undefined, { day: "2-digit" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const year = date.toLocaleDateString(undefined, { year: "numeric" });
  return `${weekday}, ${day} ${month} ${year}`;
}

function getTimeZoneLabel() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Time";
  } catch {
    return "Local Time";
  }
}

function setPressed(btn, isPressed, labelText) {
  btn.setAttribute("aria-pressed", String(isPressed));
  btn.textContent = labelText;
}

function updateDigital(now) {
  digitalTime.textContent = formatTime(now);
  digitalDate.textContent = formatDate(now);
  digitalZone.textContent = getTimeZoneLabel();
}

function setHandsFromDate(now) {
  const ms = now.getMilliseconds();
  const s = now.getSeconds() + (smoothHands ? ms / 1000 : 0);
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  const secDeg = s * 6;     // 360/60
  const minDeg = m * 6;
  const hourDeg = h * 30;   // 360/12

  hourHand.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translate(-50%, -100%) rotate(${minDeg}deg)`;
  secondHand.style.transform = `translate(-50%, -100%) rotate(${secDeg}deg)`;
}

function loopAnalog() {
  const now = new Date();
  setHandsFromDate(now);

  // digital can still update here if we want ultra-smooth seconds display
  // but we keep digital on timer for stability.
  rafId = requestAnimationFrame(loopAnalog);
}

function startAnalog() {
  stopAnalog();
  if (smoothHands) {
    rafId = requestAnimationFrame(loopAnalog);
  } else {
    // tick once per second
    setHandsFromDate(new Date());
    intervalId = setInterval(() => setHandsFromDate(new Date()), 1000);
  }
}

function stopAnalog() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

function startDigital() {
  // Update immediately
  const now = new Date();
  updateDigital(now);

  // Update every second (even if seconds hidden, date/time zone still stable)
  setInterval(() => {
    const n = new Date();
    updateDigital(n);
  }, 1000);
}

// Buttons
toggle24Btn.addEventListener("click", () => {
  use24Hour = !use24Hour;
  setPressed(toggle24Btn, use24Hour, `24h: ${use24Hour ? "ON" : "OFF"}`);
  updateDigital(new Date());
});

toggleSecondsBtn.addEventListener("click", () => {
  showSeconds = !showSeconds;
  setPressed(toggleSecondsBtn, showSeconds, `Seconds: ${showSeconds ? "ON" : "OFF"}`);
  updateDigital(new Date());
});

toggleTickBtn.addEventListener("click", () => {
  smoothHands = !smoothHands;
  setPressed(toggleTickBtn, smoothHands, `Smooth Hands: ${smoothHands ? "ON" : "OFF"}`);
  startAnalog();
});

partyBtn.addEventListener("click", () => {
  document.body.classList.add("party");
  statusText.textContent = "Party Mode";
});

stopPartyBtn.addEventListener("click", () => {
  document.body.classList.remove("party");
  statusText.textContent = "Live";
});

// Init
setPressed(toggle24Btn, use24Hour, `24h: ${use24Hour ? "ON" : "OFF"}`);
setPressed(toggleSecondsBtn, showSeconds, `Seconds: ${showSeconds ? "ON" : "OFF"}`);
setPressed(toggleTickBtn, smoothHands, `Smooth Hands: ${smoothHands ? "ON" : "OFF"}`);

startAnalog();
startDigital();
