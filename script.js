function updateClock() {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Analog calculations
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  document.getElementById("hour-hand").style.transform =
    `translateX(-50%) rotate(${hourDeg}deg)`;

  document.getElementById("minute-hand").style.transform =
    `translateX(-50%) rotate(${minuteDeg}deg)`;

  document.getElementById("second-hand").style.transform =
    `translateX(-50%) rotate(${secondDeg}deg)`;

  // Digital format
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  document.getElementById("digital-clock").textContent =
    `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

// Run immediately and every second
updateClock();
setInterval(updateClock, 1000);
